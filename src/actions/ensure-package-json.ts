import * as nodeFS from 'node:fs';
import ora from 'ora';
import { shell } from '../shell';
import type { Context } from './context';

function hasPackageJson(dir: string): boolean {
	try {
		const normalizedDir = dir.replace(/^\/+/, '');

		if (!nodeFS.existsSync(normalizedDir)) {
			nodeFS.mkdirSync(normalizedDir, { recursive: true });
		}

		const files = nodeFS.readdirSync(normalizedDir);
		return files.includes('package.json');
	} catch (error: unknown) {
		return false;
	}
}

async function initializePackageJson(context: Context): Promise<void> {
	const spinner = ora('Creating a `package.json` file...').start();

	if (context.dryRun) {
		spinner.info('Creating a `package.json` file... (skipped due to --dry-run)');
		spinner.stop();
		return;
	}

	try {
		await shell(context.packageManager, ['init', '-y'], { cwd: context.cwd });
		spinner.succeed('Successfully created `package.json`.');
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		spinner.fail(`Failed to create \`package.json\`:\n${errorMessage}`);
		context.exit(1);
	}
}

export async function ensureProjectPackageJson(context: Context): Promise<void> {
	const dir = context.cwd.pathname.replace(/^\/+/, '');

	if (!hasPackageJson(dir)) {
		console.warn(
			`No \`package.json\` file was found in the current directory. The tool will attempt to create one using \`${context.packageManager} init\`.`,
		);
		await initializePackageJson(context);
	} else {
		console.error('[package.json already exists');
	}
}
