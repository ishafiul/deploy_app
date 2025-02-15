import { Queue } from 'bullmq';
import { redisConfig } from '../config';
import { BuildLog, LogLevel } from '../types';

const logQueue = new Queue('buildLogs', {
    connection: redisConfig,
});

export async function sendLog(
    projectId: string,
    message: string,
    level: LogLevel = 'info',
    userId: string
): Promise<void> {
    await logQueue.add(`log-${Date.now()}`, {
        projectId,
        message,
        userId,
        level,
    } as BuildLog);
} 