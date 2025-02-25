import { Context, createContext } from './actions/context.js';
import { dim, red, yellow } from 'picocolors';
import { log, logAction } from './utils/logger.js';
import { checkWritePermissions } from './utils/is-writeable.js';
import { getOnline } from './utils/is-online.js';
import { getPackageManagerConfirmation } from './prompts/package-manager.js';
import { installDependencies } from './actions/install.js';
import process from 'node:process';
import { resolvePackageVersion } from './utils/registry.js';
import { setupStylelintConfig } from './actions/config.js';
import { showHelp } from './actions/help.js';
import { showNextSteps } from './actions/post-setup.js';
import { validatePackageJson } from './utils/package-utils.js';

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

	const isOnline = await getOnline();

	if (!isOnline) {
		log(red('No internet connection detected.\n'));
		log(dim('Please check your network connection and try again.\n'));
		process.exit(1);
	}
}

async function setupStylelint(context: Context): Promise<void> {
	if (context.isDryRun) {
		logAction('--dry-run', 'Running in dry-run mode');
	}

	if (context.shouldSkipInstall) {
		logAction('--skip-install', 'Dependency installation skipped');
	}

	await setupStylelintConfig(context);

	if (!context.packageManager) {
		context.packageManager = await getPackageManagerConfirmation(context);
	}

	if (!context.isDryRun) {
		await validatePackageJson(context.packageManager);
	}

	await installDependencies(context);
	await showNextSteps(context);
}

export async function main(): Promise<void> {
	const context = await createContext(process.argv.slice(2));

	if (context.version) {
		try {
			const version = await resolvePackageVersion('create-stylelint');

			log(`create-stylelint v${version}`);
			process.exit(0);
		} catch (error) {
			console.error(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	}

	if (context.help) {
		showHelp();
		process.exit(0);
	}

	if (!context.isDryRun) {
		await validatePackageJson(context.packageManager ?? 'npm');
	}

	try {
		await validateEnvironment(context);
		await setupStylelint(context);
	} catch (error) {
		log(red(`${error}\n`));
		process.exit(1);
	}
}

main();
