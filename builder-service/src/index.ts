import Docker from 'dockerode';
import {Worker} from 'bullmq';
import {Readable} from 'stream';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();
// Initialize Docker and AWS S3 clients
const docker = new Docker();
const s3 = new AWS.S3({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_ACCESS_KEY_SECRET!,
    },
});

async function buildDockerImage(repoUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
        docker.buildImage(
            {
                context: './src/react', // Directory containing Dockerfile
                src: ['Dockerfile'],
            },
            {
                t: 'node-app-image', // Tag for the built image
                buildargs: {REPO_URL: repoUrl}, // Pass repo URL
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                result?.pipe(process.stdout);
                result?.on('end', () => {
                    console.log('Docker image built successfully.');
                    resolve();
                });
                result?.on('error', reject);
            }
        );
    });
}

async function pullAndCreateContainer(repoUrl: string) {
    await docker.pull('node:20'); // Pull base Node.js image
    await buildDockerImage(repoUrl); // Build the Docker image

    const container = await docker.createContainer({
        Image: 'node-app-image',
        Cmd: [
            '/bin/sh',
            '-c',
            `echo "Build complete!" && tail -f /dev/null`
        ],
        Tty: false,
        HostConfig: {
            Memory: 512 * 1024 * 1024, // 512MB memory limit
            NanoCpus: 1000000000, // 1 CPU core limit
        },
    });

    await container.start();
    return container;
}

async function monitorBuild(
    container: Docker.Container,
    timeout = 1000 * 60 * 5
): Promise<void> {
    let isBuildComplete = false;
    const startTime = Date.now();

    while (!isBuildComplete && Date.now() - startTime < timeout) {
        const logs = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 100,
        });

        logs.on('data', (chunk) => {
            const output = chunk.toString();
            console.log(output);
            if (output.includes('Build complete!')) {
                isBuildComplete = true;
            }
        });

        if (!isBuildComplete) {
            console.log('Waiting for build completion...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    if (!isBuildComplete) {
        throw new Error('Build process timed out');
    }
}

async function findAndUploadFiles(
    container: Docker.Container,
    path: string,
    projectId: string
) {
    const exec = await container.exec({
        Cmd: ['find', path],
        AttachStdout: true,
        AttachStderr: true,
    });
    const stream = await new Promise<Readable>((resolve, reject) =>
        exec.start({}, (err, result) =>
            err ? reject(err) : resolve(result as Readable)
        )
    );

    let filePaths = '';
    stream.on('data', (chunk) => {
        filePaths += chunk.toString();
    });

    stream.on('end', () => {
        const paths = filePaths.trim().split('\n');
        paths.forEach((filePath) => uploadFileToS3(projectId, filePath, container));
    });

    stream.on('error', (err) => {
        console.error('Error finding files:', err);
    });
}

async function uploadFileToS3(
    projectId: string,
    filePath: string,
    container: Docker.Container
) {
    try {
        const exec = await container.exec({
            Cmd: ['cat', filePath],
            AttachStdout: true,
            AttachStderr: true,
        });
        const stream = await new Promise<Readable>((resolve, reject) =>
            exec.start({}, (err, result) =>
                err ? reject(err) : resolve(result as Readable)
            )
        );

        const s3Key = `${projectId}/${filePath.replace('./dist/', '')}`;
        const uploadParams = {
            Bucket: process.env.R2_BUCKET!,
            Key: s3Key,
            Body: stream,
        };

        s3.upload(uploadParams, (err: any, data: { Location: any; }) => {
            if (err) {
                console.error('Error uploading file to S3:', err);
            } else {
                console.log('File uploaded to S3:', data.Location);
            }
        });
    } catch (error) {
        console.error('Error during S3 upload:', error);
    }
}

const worker = new Worker(
    'buildQueue',
    async (job) => {
        const {repoUrl, projectId} = job.data;
        try {
            const container = await pullAndCreateContainer(repoUrl);
            await monitorBuild(container);

            console.log('Finding and uploading build files...');
            await findAndUploadFiles(container, './dist', projectId);

            await container.stop();
            await container.remove();
        } catch (error) {
            console.error(`Build failed for project ${projectId}:`, error);
        }
    },
    {
        connection: {host: '192.168.0.101', port: 6379},
    }
);

console.log('Worker is running and awaiting jobs...');
