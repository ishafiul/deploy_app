import Docker from 'dockerode';

export type LogLevel = 'info' | 'error' | 'warning';

export interface BuildLog {
    projectId: string;
    message: string;
    userId: string;
    level: LogLevel;
}

export interface BuildConfig {
    repoUrl: string;
    projectId: string;
    userId: string;
    buildPath: string;
}

export interface ContainerConfig {
    Image: string;
    Cmd: string[];
    Tty: boolean;
    HostConfig: {
        Memory: number;
        NanoCpus: number;
    };
}

export interface S3Config {
    Bucket: string;
    Key: string;
    Body: any;
    ContentType: string;
} 