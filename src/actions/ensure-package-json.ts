import * as fs from 'node:fs';
import process from 'node:process';
import ora from 'ora';
import { messages } from '../messages';
import { execa } from 'execa';
import type { PackageManager } from '../prompts/package-manager';

function hasPackageJson(dir: string): boolean {
	try {
		return fs.readdirSync(dir).includes('package.json');
	} catch (error) {
		return false;
	}
}

async function initializePackageJson(cwd: string, pkgManager: PackageManager): Promise<void> {
	const spinner = ora(messages.creatingPackageJson).start();
	try {
		await execa(pkgManager, ['init', '-y'], { cwd });
		spinner.succeed(messages.createdPackageJsonFile);
	} catch (error: any) {
		spinner.fail(`${messages.failedToCreatePackageJson}:\n${error}`);
		process.exit(1);
	}
}

export async function ensureProjectPackageJson(cwd: string): Promise<void> {
	if (!hasPackageJson(cwd)) {
		console.warn(messages.packageJsonNotFoundWarning('npm'));
		await initializePackageJson(cwd, 'npm');
	}
}
