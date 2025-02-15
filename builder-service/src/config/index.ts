import Docker from 'dockerode';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_ACCESS_KEY_SECRET',
    'R2_BUCKET'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const docker = new Docker();


// Redis configuration
export const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Build process configuration
export const buildConfig = {
    timeout: 1000 * 60 * 5, // 5 minutes
    memory: 512 * 1024 * 1024, // 512MB
    nanoCpus: 1000000000, // 1 CPU
    buildPath: './dist',
};

// S3/R2 configuration
export const s3Config = {
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_ACCESS_KEY_SECRET!,
    },
    bucketName: process.env.R2_BUCKET!
}; 