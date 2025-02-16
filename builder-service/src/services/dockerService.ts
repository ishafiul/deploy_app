import Docker from 'dockerode';
import {Readable} from 'stream';
import {buildConfig, docker} from '../config';
import {sendLog} from '../queues/logQueue';
import {FrameworkDetector} from '../utils/frameworkDetector';
import * as fs from 'fs/promises';
import path from 'path';
import { frameworkConfigs } from '../config/frameworks';

export class DockerService {
    private readonly dockerfilesPath: string;

    constructor() {
        // Handle both development and production paths
        const baseDir = process.env.NODE_ENV === 'production' ? process.cwd() : path.join(__dirname, '..');
        this.dockerfilesPath = path.join(baseDir, 'config', 'docker', 'frameworks');
    }

    private getDockerfilePath(framework: string): string {
       switch(framework) {
        case 'react':
            return frameworkConfigs.react.dockerfilePath;
        case 'vue':
            return frameworkConfigs.vue.dockerfilePath;
        case 'svelte':
            return frameworkConfigs.svelte.dockerfilePath;
        case 'solid':
            return frameworkConfigs.solid.dockerfilePath;
        case 'flutter':
            return frameworkConfigs.flutter.dockerfilePath;
        default:
            return frameworkConfigs.unknown.dockerfilePath;
       }
    }

    async buildImage(repoUrl: string, projectId: string, userId: string): Promise<void> {
        const framework = await FrameworkDetector.detectFramework(repoUrl);
        const dockerfilePath = this.getDockerfilePath(framework);
        const config = frameworkConfigs[framework];

        // Verify Dockerfile exists
        try {
            await fs.access(dockerfilePath);
        } catch (error) {
            await sendLog(projectId, `Dockerfile not found at ${dockerfilePath}`, 'error', userId);
            throw new Error(`Dockerfile not found for framework: ${framework}`);
        }

        await sendLog(projectId, `Detected framework: ${framework}`, 'info', userId);
        await sendLog(projectId, `Using image: ${config.imageName}`, 'info', userId);
        await sendLog(projectId, `Using Dockerfile: ${dockerfilePath}`, 'info', userId);

        return new Promise((resolve, reject) => {
            docker.buildImage(
                {
                    context: dockerfilePath,
                    src: ["Dockerfile"],
                },
                {
                    t: config.imageName,
                    buildargs: { 
                        REPO_URL: repoUrl,
                        BUILD_COMMAND: config.buildCommand,
                        BUILD_OUTPUT_DIR: config.outputDir,
                        ...config.env
                    },
                },
                (error, result) => {
                    if (error) return reject(error);
                    this.handleBuildStream(result, projectId, userId, resolve, reject);
                }
            );
        });
    }

    async pullAndCreateContainer(repoUrl: string, projectId: string, userId: string): Promise<Docker.Container> {
        const framework = await FrameworkDetector.detectFramework(repoUrl);
        const config = frameworkConfigs[framework];

        await docker.pull(config.baseImage);
        await this.buildImage(repoUrl, projectId, userId);

        const container = await docker.createContainer({
            Image: config.imageName,
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
        console.log(container)
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