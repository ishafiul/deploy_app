import { PassThrough } from 'stream';
import * as mime from 'mime-types';
import Docker from 'dockerode';
import AWS from 'aws-sdk';
import { s3Config } from '../config';
import { sendLog } from '../queues/logQueue';
import { S3Config } from '../types';

export class S3Service {
    private s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            region: s3Config.region,
            endpoint: s3Config.endpoint,
            credentials: s3Config.credentials
        });
    }

    async uploadFile(
        userId: string,
        projectId: string,
        filePath: string,
        container: Docker.Container
    ): Promise<void> {
        try {
            const mimetype = mime.lookup(filePath);
            if (!mimetype) {
                await sendLog(projectId, `MIME type not found for file: ${filePath}`, 'error', userId);
                return;
            }

            const s3Key = `${projectId}/${filePath.replace('./dist/', '')}`;
            const s3UploadStream = new PassThrough();

            // Get file stream from container
            const options = {
                Cmd: ['cat', `/app/${filePath}`],
                Tty: false,
                AttachStdout: true,
                AttachStderr: true,
            };

            await this.streamFileToS3(container, options, s3UploadStream, {
                Bucket: s3Config.bucketName,
                Key: s3Key,
                Body: s3UploadStream,
                ContentType: mimetype,
            }, projectId, userId);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await sendLog(projectId, `Error during S3 upload: ${errorMessage}`, 'error', userId);
            console.error('Error during S3 upload:', error);
        }
    }

    private async streamFileToS3(
        container: Docker.Container,
        execOptions: Docker.ExecCreateOptions,
        s3UploadStream: PassThrough,
        uploadParams: S3Config,
        projectId: string,
        userId: string
    ): Promise<void> {
        await new Promise((resolve, reject) => {
            container.exec(execOptions, (err, exec) => {
                if (err || !exec) {
                    reject(new Error('Container exec failed!'));
                    return;
                }

                exec.start({ hijack: true }, (err, stream) => {
                    if (err || !stream) {
                        reject(new Error('Container start execution failed!'));
                        return;
                    }

                    const stdout = new PassThrough();
                    const stderr = new PassThrough();
                    container.modem.demuxStream(stream, stdout, stderr);

                    stdout.on('data', (chunk: Buffer) => {
                        s3UploadStream.write(chunk);
                    });

                    stream.on('end', () => {
                        s3UploadStream.end();
                        sendLog(projectId, 'Closed stream', 'info', userId);
                        resolve('Ready');
                    });

                    stderr.on('data', (errData: Buffer) => {
                        sendLog(projectId, `Error output from the container: ${errData.toString()}`, 'error', userId);
                    });

                    exec.inspect((err) => {
                        if (err) {
                            sendLog(projectId, `Execution Inspect failed! ${err.message}`, 'error', userId);
                        }
                    });
                });
            });
        });

        await new Promise<void>((resolve, reject) => {
            this.s3.upload(uploadParams).send((err, data) => {
                if (err) {
                    sendLog(projectId, `Error uploading file to S3: ${err.message}`, 'error', userId);
                    console.error('Detailed Error:', err);
                    reject(err);
                } else {
                    sendLog(projectId, `File uploaded to S3: ${data.Location}`, 'info', userId);
                    resolve();
                }
            });
        });
    }
} 