import { bgMagenta, dim, magenta, white } from 'picocolors';
import ora from 'ora';
import process from 'node:process';
import { x } from 'tinyexec';

import { log, logAction, newline } from '../utils/logger.js';
import type { Context } from './context.js';
import { createBox } from '../utils/terminal-box.js';
import { getInstallCommand } from '../utils/package-manager-commands.js';
import { getInstallConfirmation } from '../prompts/install.js';
import { resolvePackageVersion } from '../utils/registry.js';

const REQUIRED_PACKAGES = ['stylelint', 'stylelint-config-standard'];

export async function installDependencies(context: Context): Promise<void> {
	if (context.shouldSkipInstall) {
		logAction('--skip-install', 'Dependency installation skipped');

		return;
	}

	const packageVersions = await Promise.all(
		REQUIRED_PACKAGES.map(async (pkg) => ({
			packageName: pkg,
			requestedVersion: await resolvePackageVersion(pkg),
		})),
	);

	const installCommand = getInstallCommand(context.packageManager!, packageVersions);
	const infoPrefix = `${'  '}${bgMagenta(white(' INFO '))}${' '.repeat(8)}`;

	// Display command preview
	newline();
	log(`${infoPrefix}${magenta('Stylelint will run the following command:')}`);
	log(`${'  '.repeat(8)}If you skip this step, you can always run it yourself later`);
	newline();
	log(`${createBox([installCommand])}\n`);

	if (!(await getInstallConfirmation(context))) return;

	if (context.isDryRun) {
		logAction('--dry-run', 'Skipping dependency installation');

		return;
	}

	const spinner = ora('Installing the necessary Stylelint dependencies...').start();

	try {
		const [command, ...args] = installCommand.split(' ');

		await x(command!, args, { nodeOptions: { cwd: process.cwd() } });
		spinner.succeed('Successfully installed dependencies');
	} catch (error) {
		spinner.fail(`Failed to install dependencies: ${(error as Error).message}`);
		log(dim('Please check your network connection and try again.\n'));
		context.exit(1);
	}
}
