import Docker from 'dockerode';
import {Worker, Queue} from 'bullmq';
import {Readable} from 'stream';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import * as mime from 'mime-types';
import {PassThrough} from "node:stream";

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

// Initialize log queue
const logQueue = new Queue('buildLogs', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});

async function sendLog(projectId: string, message: string, level: 'info' | 'error' | 'warning' = 'info',userId: string) {
    await logQueue.add(`log-${Date.now()}`, {
        projectId,
        message,
        userId,
        level,
    });
}

async function buildDockerImage(repoUrl: string, projectId: string,userId:string): Promise<void> {
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

                // Capture and send build logs
                result?.on('data', (chunk) => {
                    try {
                        const data = JSON.parse(chunk.toString());
                        if (data.stream) {
                            console.log(data.stream.trim())
                            sendLog(projectId, data.stream.trim(), 'info',userId);
                        } else if (data.error) {
                            sendLog(projectId, data.error, 'error',userId);
                        }
                    } catch (err) {
                        sendLog(projectId, chunk.toString(), 'info',userId);
                    }
                });

                result?.on('end', () => {
                    sendLog(projectId, 'Docker image built successfully.', 'info',userId);
                    resolve();
                });
                result?.on('error', (err: Error) => {
                    sendLog(projectId, `Build error: ${err.message}`, 'error',userId);
                    reject(err);
                });
            }
        );
    });
}

async function pullAndCreateContainer(repoUrl: string, projectId: string, userId: string): Promise<Docker.Container> {
    await docker.pull('node:20');
    await buildDockerImage(repoUrl, projectId,userId);

    const container = await docker.createContainer({
        Image: 'node-app-image',
        Cmd: [
            '/bin/sh',
            '-c',
            `echo "Build complete!" && tail -f /dev/null`
        ],
        Tty: false,
        HostConfig: {
            Memory: 512 * 1024 * 1024,
            NanoCpus: 1000000000,
        },
    });

    await container.start();
    return container;
}

async function monitorBuild(
    userId:string,
    container: Docker.Container,
    projectId: string,
    timeout = 1000 * 60 * 5,

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
            console.log(output)
            sendLog(projectId, output, 'info',userId);
            if (output.includes('Build complete!')) {
                isBuildComplete = true;
            }
        });

        if (!isBuildComplete) {
            await sendLog(projectId, 'Waiting for build completion...', 'info', userId);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    if (!isBuildComplete) {
        await sendLog(projectId, 'Build process timed out', 'error', userId);
        throw new Error('Build process timed out');
    }
}

async function findAndUploadFiles(
    userId:string,
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

    let filePaths: string[] = [];

    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
        filePaths = filePaths.concat(chunk.trim().split('\n'));
    });

    stream.on('end', async () => {
        const uploadPromises = filePaths
            .filter((filePath) => filePath) // Ensure filePath is valid
            .map((filePath) => uploadFileToS3(userId,projectId, filePath, container));

        try {
            await Promise.all(uploadPromises); // Wait for all uploads to complete
            await sendLog(projectId, 'All files uploaded successfully.', 'info', userId);
        } catch (uploadError: unknown) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
            await sendLog(projectId, `Error during file uploads: ${errorMessage}`, 'error', userId);
            console.error('Error during file uploads:', uploadError);
        }
    });

    stream.on('error', (err: Error) => {
        sendLog(projectId, `Error finding files: ${err.message}`, 'error',userId);
        console.error('Error finding files:', err);
    });
}


// Promisify the stream to buffer function
const streamToBuffer = async (stream: Readable) => {
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};

async function uploadFileToS3(
    userId:string,
    projectId: string,
    filePath: string,
    container: Docker.Container
) {
    try {
        const mimetype = mime.lookup(filePath);
        if (!mimetype) {
            await sendLog(projectId, `MIME type not found for file: ${filePath}`, 'error', userId);
            return;
        }

        const s3Key = `${projectId}/${filePath.replace('./dist/', '')}`;

        // Define the exec options
        const options = {
            Cmd: ['cat', `/app/${filePath}`],
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
        };

        // Create a write stream for S3 upload
        const s3UploadStream = new PassThrough();

        // Start the exec command
        await new Promise((resolve, reject) => {
            container.exec(options, function (err, exec) {
                if (err) {
                    reject(new Error('Container exec failed!'));
                    return;
                }
                if (exec) {
                    exec.start({hijack: true}, function (err: Error | null, stream: any) {
                        if (err) {
                            reject(new Error('Container start execution failed!'));
                            return;
                        }

                        // Demux stdout and stderr
                        const stdout = new PassThrough();
                        const stderr = new PassThrough();
                        container.modem.demuxStream(stream, stdout, stderr);

                        // Pipe stdout data to the S3 upload stream
                        stdout.on('data', function (chunk: Buffer) {
                            s3UploadStream.write(chunk);
                        });

                        // Handle stream end
                        stream.on('end', () => {
                            s3UploadStream.end(); // Close the upload stream
                            sendLog(projectId, 'Closed stream', 'info',userId);
                            resolve('Ready');
                        });

                        // Handle any errors
                        stderr.on('data', (errData: Buffer) => {
                            sendLog(projectId, `Error output from the container: ${errData.toString()}`, 'error',userId);
                        });

                        // Inspect the exec for debugging if needed
                        exec.inspect(function (err: Error | null) {
                            if (err) {
                                sendLog(projectId, `Execution Inspect failed! ${err.message}`, 'error',userId);
                            }
                        });
                    });
                }
            });
        });

        // Upload the collected data to S3
        const uploadParams: AWS.S3.PutObjectRequest = {
            Bucket: process.env.R2_BUCKET!,
            Key: s3Key,
            Body: s3UploadStream,
            ContentType: mimetype,
        };

        // Start the upload
        await new Promise<AWS.S3.ManagedUpload.SendData>((resolve, reject) => {
            s3.upload(uploadParams).send((err, data) => {
                if (err) {
                    sendLog(projectId, `Error uploading file to S3: ${err.message}`, 'error',userId);
                    console.error('Detailed Error:', err);
                    reject(err);
                } else {
                    sendLog(projectId, `File uploaded to S3: ${data.Location}`, 'info',userId);
                    resolve(data);
                }
            });
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await sendLog(projectId, `Error during S3 upload: ${errorMessage}`, 'error', userId);
        console.error('Error during S3 upload:', error);
    }
}


const worker = new Worker(
    'buildQueue',
    async (job) => {
        const {repoUrl, projectId, userId} = job.data;
        try {
            sendLog(projectId,'Starting build process...', 'info',userId);
            const container = await pullAndCreateContainer(repoUrl, projectId, userId);
            await monitorBuild(userId,container, projectId);

            sendLog(projectId, 'Finding and uploading build files...', 'info',userId);
            await new Promise(resolve => setTimeout(resolve, 10000));
            await findAndUploadFiles(userId,container, './dist', projectId);

            await container.stop();
            await container.remove();
            sendLog(projectId, 'Build completed successfully', 'info',userId);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            sendLog(projectId, `Build failed: ${errorMessage}`, 'error',userId);
            console.error(`Build failed for project ${projectId}:`, error);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
    }
);

console.log('Worker is running and awaiting jobs...');
