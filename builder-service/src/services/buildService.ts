import Docker from 'dockerode';
import { DockerService } from './dockerService';
import { S3Service } from './s3Service';
import { sendLog } from '../queues/logQueue';
import { BuildConfig } from '../types';

export class BuildService {
    private dockerService: DockerService;
    private s3Service: S3Service;

    constructor() {
        this.dockerService = new DockerService();
        this.s3Service = new S3Service();
    }

    async processBuild(buildConfig: BuildConfig): Promise<void> {
        const { repoUrl, projectId, userId } = buildConfig;

        try {
            await sendLog(projectId, 'Starting build process...', 'info', userId);
            
            const container = await this.dockerService.pullAndCreateContainer(repoUrl, projectId, userId);
            await this.dockerService.monitorBuild(userId, container, projectId);
            
            await sendLog(projectId, 'Finding and uploading build files...', 'info', userId);
            const files = await this.dockerService.findFiles(container, buildConfig.buildPath);
            
            await Promise.all(
                files.map(filePath => this.s3Service.uploadFile(userId, projectId, filePath, container))
            );
            
            await this.cleanup(container);
            await sendLog(projectId, 'Build completed successfully', 'info', userId);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await sendLog(projectId, `Build failed: ${errorMessage}`, 'error', userId);
            console.error(`Build failed for project ${projectId}:`, error);
            throw error;
        }
    }

    private async cleanup(container: Docker.Container): Promise<void> {
        await container.stop();
        await container.remove();
    }
} 