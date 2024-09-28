import Docker from 'dockerode';
import {QueueEvents, Worker} from 'bullmq';
import * as tar from 'tar-stream';
import * as fs from 'fs';
import * as path from 'path';
import {Readable} from "node:stream";
// Initialize Docker client
const docker = new Docker();
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';


import AWS from "aws-sdk";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://0f23a9fe02e7260db3b9922bda5c83a9.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: '05d76448a032d53093095fd45fe67c81',
        secretAccessKey: 'f90f7002df3b0c2f716bf11893d2a4eec620b76ddac4c0ec469e80e9ffbaeae8',
    },
});
const s3 = new AWS.S3({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: `${process.env.R2_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.R2_ACCESS_KEY_SECRET}`,
    }
});

async function buildDockerImage(repoUrl: string) {
    return new Promise<void>((resolve, reject) => {
        docker.buildImage(
            {
                context: './src/react', // The directory containing the Dockerfile
                src: ['Dockerfile'], // The Dockerfile name or list of files to include
            },
            {
                t: 'node-app-image', // Tag for the built image
                buildargs: {
                    REPO_URL: repoUrl, // Passing the repo URL as a build argument
                },
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if(result === undefined) {
                        reject();
                        return;
                    }
                    result.pipe(process.stdout);

                    result.on('end', () => {
                        console.log('Build completed');
                        resolve();
                    });

                    result.on('error', (error) => {
                        reject(error);
                    });
                }
            }
        );
    });
}

async function pullAndCreate(repoUrl: string) {
    await docker.pull('node:20');

    // Build the Docker image
    await buildDockerImage(repoUrl);

    // Create and start the container using the built image
    const container = await docker.createContainer({
        Image: 'node-app-image',
        Cmd: [
            '/bin/sh', '-c',
            `git clone ${repoUrl} app && cd app && npm install --legacy-peer-deps && npm run build && \
                echo "Build complete!" && tail -f /dev/null`
        ],
        Tty: false,
        HostConfig: {
            Memory: 512 * 1024 * 1024, // Limit to 512MB
            NanoCpus: 1000000000, // Limit to 1 CPU core
        },
    });

    await container.start();

    // Poll for logs to check when build is complete
    let isBuildComplete = false;
    const start = Date.now();
    const timeout = 1000 * 60 * 5; // 5 minutes timeout

    while (!isBuildComplete) {
        const logs = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
            tail: 100 // Tail the last 100 lines
        });

        logs.on('data', (chunk) => {
            const output = chunk.toString();
            console.log(output); // Print the logs to the console
            if (output.includes('Build complete!')) { // Check for the completion message
                isBuildComplete = true;
            }
        });

        if (Date.now() - start > timeout) {
            console.error('Build timed out');
            break;
        }

        console.log('Waiting for build to complete...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }

    return container;
}

async function findFiles(container: Docker.Container, path: string, projectId: string) {
    // Create an exec instance to list files and directories
    const exec = await container.exec({
        Cmd: ['find', path], // Use 'find' to list all files and directories
        AttachStdout: true,
        AttachStderr: true
    });

    // Start the exec instance and get the stream
    const stream: Readable = await new Promise((resolve, reject) => {
        exec.start({}, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result as Readable);
            }
        });
    });

    // Collect data from the stream and print the paths
    let output = '';

    stream.on('data', (chunk: Buffer) => {
        output += chunk.toString(); // Collect the data
    });

    // Handle the end of the stream
    stream.on('end', () => {
        const paths = output.trim().split('\n'); // Split by new line to get each path
        paths.forEach((path) => uploadFileToS3(projectId, path, container)); // Print each path
    });

    // Handle errors in the stream
    stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
    });
}


async function uploadFileToS3(projectId: string, filePath: string, container: Docker.Container) {
    try {
        // Create the S3 key using the project ID and the file name
        const s3Client = new S3Client({region: 'your-region'});
        const s3Key = `${projectId}/${filePath.replace('./dist/', '')}`
        // Get a stream of the file from the Docker container


        const exec = await container.exec({
            Cmd: ['find', filePath], // Use 'find' to list all files and directories
            AttachStdout: true,
            AttachStderr: true
        });

        // Start the exec instance and get the stream
        const stream: Readable = await new Promise((resolve, reject) => {
            exec.start({}, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result as Readable);
                }
            });
        });

        // Collect data from the stream and print the paths
        let output = '';

        stream.on('data', (chunk: Buffer) => {
            output += chunk.toString(); // Collect the data
        });

        // Handle the end of the stream
        stream.on('end', async () => {

            // Create the PutObjectCommand with the file stream
            const uploadParams = {
                Bucket: `${process.env.R2_BUCKET}`, // Replace with your bucket name
                Key: s3Key,
                Body: output, // File content to upload
            };

            // Use the PutObjectCommand to upload the file
            s3.upload(uploadParams, (err: any, data: { Location: any; }) => {
                if (err) {
                    console.error('Error uploading file to S3:', err);
                } else {
                    console.log(`File uploaded successfully to S3: ${data.Location}`);
                }
            });
            console.log(`File uploaded successfully to S3:`);
        });

        // Handle errors in the stream
        stream.on('error', (streamErr) => {
            console.error('Stream error:', streamErr);
        });


    } catch (error) {
        console.error('Error uploading file to S3:', error);
    }
}

const worker = new Worker('buildQueue', async (job) => {
    const {repoUrl, projectId} = job.data;

    try {

        const container = await pullAndCreate(repoUrl);
        // Delay to ensure everything is set up before finding files
        await new Promise(resolve => setTimeout(resolve, 3000)); // Adjust the delay as needed

        // Make sure the container is running
        const containerStatus = await container.inspect();
        if (containerStatus.State.Running) {
            await findFiles(container, "./dist", projectId);
        } else {
            console.error('Container is not running. Cannot find files.');
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // Adjust the delay as needed
        await container.stop();
        await container.remove();

    } catch (err) {
        console.error(`Build failed for project ${projectId}:`, err);

    }
}, {
    connection: {
        host: "192.168.0.101",
        port: 6379,
    },
});

console.log('Worker is running and waiting for jobs...');
