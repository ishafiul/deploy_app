import { Framework } from '../utils/frameworkDetector';

export interface FrameworkConfig {
    baseImage: string;
    imageName: string;
    dockerfilePath: string;
    buildCommand: string;
    outputDir: string;
    env: Record<string, string>;
}
const baseDir = process.cwd();
export const frameworkConfigs: Record<Framework, FrameworkConfig> = {
    'react': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/node-csr`,
        baseImage: 'node:20',
        imageName: 'react-app-image',
        buildCommand: 'build',
        outputDir: 'dist',
        env: {
            GENERATE_SOURCEMAP: 'false'
        }
    },
    'vue': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/node-csr`,
        baseImage: 'node:20',
        imageName: 'vue-app-image',
        buildCommand: 'build',
        outputDir: 'dist',
        env: {
            VUE_CLI_BABEL_TRANSPILE_MODULES: 'false'
        }
    },
    'svelte': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/node-csr`,
        baseImage: 'node:20',
        imageName: 'svelte-app-image',
        buildCommand: 'build',
        outputDir: 'dist',
        env: {}
    },
    'solid': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/node-csr`,
        baseImage: 'node:20',
        imageName: 'solid-app-image',
        buildCommand: 'build',
        outputDir: 'dist',
        env: {}
    },
    'flutter': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/flutter`,
        baseImage: 'cirrusci/flutter:stable',
        imageName: 'flutter-app-image',
        buildCommand: 'build web --release',
        outputDir: 'build/web',
        env: {}
    },
    'unknown': {
        dockerfilePath: `${baseDir}/src/config/docker/frameworks/node-csr`,
        baseImage: 'node:20',
        imageName: 'app-image',
        buildCommand: 'build',
        outputDir: 'dist',
        env: {}
    }
}; 