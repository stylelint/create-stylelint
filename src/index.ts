import process from 'node:process';
import { red, green, dim, yellow } from 'picocolors';
import { Context, createContext } from '$/actions/context.js';
import { setupConfig } from '$/actions/config.js';
import { installDependencies } from '$/actions/install.js';
import { showNextSteps } from '$/actions/post-setup.js';
import { checkWritePermissions } from '$/fs/permissions.js';
import { checkNetworkConnection } from '$/network/online.js';
import { log } from '$/output/format.js';
import { validatePackageJson } from '$/fs/package.js';
import { detectPackageManagerWithFallback } from '$/package/detect.js';

process.on('SIGINT', () => {
	log(yellow('\nProcess interrupted by user. Exiting...\n'));
	process.exit(1);
});

process.on('SIGTERM', () => {
	log(yellow('\nProcess terminated. Exiting...\n'));
	process.exit(1);
});

async function validateEnvironment(context: Context): Promise<void> {
	const currentDir = process.cwd();
	if (!context.isDryRun && !(await checkWritePermissions(currentDir))) {
		log(red(`No write permissions in directory: ${currentDir}\n`));
		log(dim('Please check your permissions and try again.\n'));
		process.exit(1);
	}

	if (!context.isDryRun) {
		await validatePackageJson(context.packageManager);
	}

	const isOnline = await checkNetworkConnection();
	if (!isOnline) {
		log(red('No internet connection detected.\n'));
		log(dim('Please check your network connection and try again.\n'));
		process.exit(1);
	}
}

async function setupStylelint(context: Context): Promise<void> {
	if (context.isDryRun) {
		log(`${green('◼')}  ${green('--dry-run')} Running in dry-run mode\n`);
	}

	if (context.shouldSkipInstall) {
		log(`${green('◼')}  ${green('--skip-install')} Installation will be skipped\n`);
	}

	context.packageManager = await detectPackageManagerWithFallback(process.cwd(), {
		useNpm: context.useNpm,
		usePnpm: context.usePnpm,
		useYarn: context.useYarn,
		useBun: context.useBun,
	});

	await setupConfig(context);
	await installDependencies(context);
	await showNextSteps(context);
}

export async function main(): Promise<void> {
	try {
		const context = await createContext(process.argv.slice(2));
		await validateEnvironment(context);
		await setupStylelint(context);
	} catch (error) {
		log(red(`${error}\n`));
		process.exit(1);
	}
}

main()
