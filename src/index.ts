import process from 'node:process';
import pc from 'picocolors';
import { Context, createContext } from './actions/context.js';
import { setupConfig } from './actions/config.js';
import { installDeps } from './actions/install.js';
import { showNextSteps } from './actions/post-setup.js';
import { promptPackageManager } from './prompts/package-manager.js';
import { checkWritePermissions } from './utils/fs/permissions.js';
import { checkNetworkConnection } from './utils/network/online.js';
import { log } from './utils/output/format.js';
import { validatePackageJson } from './utils/fs/package.js';

process.on('SIGINT', () => {
	log(pc.yellow('\nProcess interrupted by user. Exiting...\n'));
	process.exit(1);
});

process.on('SIGTERM', () => {
	log(pc.yellow('\nProcess terminated. Exiting...\n'));
	process.exit(1);
});

async function validateEnvironment(context: Context): Promise<void> {
	const currentDir = process.cwd();
	if (!(await checkWritePermissions(currentDir))) {
		log(pc.red(`No write permissions in directory: ${currentDir}\n`));
		log(pc.dim('Please check your permissions and try again.\n'));
		process.exit(1);
	}

	await validatePackageJson(context.pkgManager);

	const isOnline = await checkNetworkConnection();
	if (!isOnline) {
		log(pc.red('No internet connection detected.\n'));
		log(pc.dim('Please check your network connection and try again.\n'));
		process.exit(1);
	}
}

async function setupStylelint(context: Context): Promise<void> {
	await setupConfig (context);

	await promptPackageManager(context);

	await installDeps(context);
	await showNextSteps(context);
}

export async function main(): Promise<void> {
	try {
		const context = await createContext(process.argv.slice(2));
		await validateEnvironment(context);
		await setupStylelint(context);
	} catch (error) {
		log(pc.red(`${error}\n`));
		process.exit(1);
	}
}

main();
