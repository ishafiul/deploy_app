import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { redisConfig } from './config';
import { BuildService } from './services/buildService';
import { BuildConfig } from './types';

dotenv.config();

// Initialize build service
const buildService = new BuildService();

// Initialize worker
const worker = new Worker(
    'buildQueue',
    async (job) => {
        const buildConfig: BuildConfig = {
            ...job.data,
            buildPath: './dist'
        };
        await buildService.processBuild(buildConfig);
    },
    {
        connection: redisConfig
    }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});

console.log('Worker is running and awaiting jobs...');
