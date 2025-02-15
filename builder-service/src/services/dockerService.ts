import Docker from 'dockerode';
import { Readable } from 'stream';
import { docker, buildConfig } from '../config';
import { sendLog } from '../queues/logQueue';
import { ContainerConfig } from '../types';

export class DockerService {
    private readonly dockerfilePath = './src/config/docker/react/';

    async buildImage(repoUrl: string, projectId: string, userId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            docker.buildImage(
                {
                    context: this.dockerfilePath,
                    src: ['react.Dockerfile'],
                },
                {
                    t: 'node-app-image',
                    buildargs: { REPO_URL: repoUrl },
                },
                (error, result) => {
                    if (error) return reject(error);

                    this.handleBuildStream(result, projectId, userId, resolve, reject);
                }
            );
        });
    }

    async pullAndCreateContainer(repoUrl: string, projectId: string, userId: string): Promise<Docker.Container> {
        await docker.pull('node:20');
        await this.buildImage(repoUrl, projectId, userId);

        const container = await docker.createContainer({
            Image: 'node-app-image',
            Cmd: ['/bin/sh', '-c', `echo "Build complete!" && tail -f /dev/null`],
            Tty: false,
            HostConfig: {
                Memory: buildConfig.memory,
                NanoCpus: buildConfig.nanoCpus,
            },
        });

        await container.start();
        return container;
    }

    async monitorBuild(userId: string, container: Docker.Container, projectId: string): Promise<void> {
        let isBuildComplete = false;
        const startTime = Date.now();

        while (!isBuildComplete && Date.now() - startTime < buildConfig.timeout) {
            const logs = await container.logs({
                follow: true,
                stdout: true,
                stderr: true,
                tail: 100,
            });

            logs.on('data', (chunk) => {
                const output = chunk.toString();
                console.log(output);
                sendLog(projectId, output, 'info', userId);
                if (output.includes('Build complete!')) {
                    isBuildComplete = true;
                }
            });

            if (!isBuildComplete) {
                await sendLog(projectId, 'Waiting for build completion...', 'info', userId);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!isBuildComplete) {
            await sendLog(projectId, 'Build process timed out', 'error', userId);
            throw new Error('Build process timed out');
        }
    }

    async getFileStream(container: Docker.Container, filePath: string): Promise<Readable> {
        const exec = await container.exec({
            Cmd: ['cat', `/app/${filePath}`],
            AttachStdout: true,
            AttachStderr: true,
        });

        return new Promise<Readable>((resolve, reject) =>
            exec.start({}, (err, result) =>
                err ? reject(err) : resolve(result as Readable)
            )
        );
    }

    async findFiles(container: Docker.Container, path: string): Promise<string[]> {
        const exec = await container.exec({
            Cmd: ['find', path],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await this.startExec(exec);
        return this.collectFilePaths(stream);
    }

    private async startExec(exec: Docker.Exec): Promise<Readable> {
        return new Promise<Readable>((resolve, reject) =>
            exec.start({}, (err, result) =>
                err ? reject(err) : resolve(result as Readable)
            )
        );
    }

    private async collectFilePaths(stream: Readable): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let filePaths: string[] = [];
            stream.setEncoding('utf8');
            
            stream.on('data', (chunk) => {
                filePaths = filePaths.concat(chunk.trim().split('\n'));
            });

            stream.on('end', () => {
                resolve(filePaths.filter(path => path));
            });

            stream.on('error', reject);
        });
    }

    private handleBuildStream(
        result: NodeJS.ReadableStream | undefined, 
        projectId: string, 
        userId: string,
        resolve: () => void,
        reject: (error: Error) => void
    ): void {
        if (!result) {
            reject(new Error('Build stream not available'));
            return;
        }

        result.on('data', (chunk) => {
            try {
                const data = JSON.parse(chunk.toString());
                if (data.stream) {
                    console.log(data.stream.trim());
                    sendLog(projectId, data.stream.trim(), 'info', userId);
                } else if (data.error) {
                    sendLog(projectId, data.error, 'error', userId);
                }
            } catch (err) {
                sendLog(projectId, chunk.toString(), 'info', userId);
            }
        });

        result.on('end', () => {
            sendLog(projectId, 'Docker image built successfully.', 'info', userId);
            resolve();
        });

        result.on('error', (err: Error) => {
            sendLog(projectId, `Build error: ${err.message}`, 'error', userId);
            reject(err);
        });
    }
} 