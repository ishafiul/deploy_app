import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export type Framework = 'react' | 'vue' | 'svelte' | 'solid' | 'flutter' | 'unknown';

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

interface PubspecYaml {
    dependencies?: Record<string, any>;
    dev_dependencies?: Record<string, any>;
}

export class FrameworkDetector {
    private static frameworkPatterns = {
        react: ['react', 'react-dom'],
        vue: ['vue'],
        svelte: ['svelte'],
        solid: ['solid-js'],
    };

    static async detectFramework(repoUrl: string): Promise<Framework> {
        try {
            // Create a temporary directory
            const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
            await fs.mkdir(tempDir, { recursive: true });

            // Clone the repository
            await execAsync(`git clone ${repoUrl} ${tempDir}`);

            // Check for pubspec.yaml (Flutter)
            const pubspecPath = path.join(tempDir, 'pubspec.yaml');
            if (await this.fileExists(pubspecPath)) {
                // Clean up
                await fs.rm(tempDir, { recursive: true, force: true });
                return 'flutter';
            }

            // Check for package.json (JS frameworks)
            const packageJsonPath = path.join(tempDir, 'package.json');
            if (await this.fileExists(packageJsonPath)) {
                const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
                const packageJson: PackageJson = JSON.parse(packageJsonContent);
                
                // Clean up
                await fs.rm(tempDir, { recursive: true, force: true });
                return this.detectFrameworkFromPackageJson(packageJson);
            }

            // Clean up
            await fs.rm(tempDir, { recursive: true, force: true });
            return 'unknown';
        } catch (error) {
            console.error('Error detecting framework:', error);
            return 'unknown';
        }
    }

    private static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private static detectFrameworkFromPackageJson(packageJson: PackageJson): Framework {
        const allDependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };

        for (const [framework, patterns] of Object.entries(this.frameworkPatterns)) {
            if (patterns.some(pattern => pattern in allDependencies)) {
                return framework as Framework;
            }
        }

        return 'unknown';
    }
} 