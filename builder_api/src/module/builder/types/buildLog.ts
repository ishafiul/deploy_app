export interface BuildLog {
    projectId: string;
    message: string;
    level: 'info' | 'error' | 'warning';
    timestamp: Date;
} 