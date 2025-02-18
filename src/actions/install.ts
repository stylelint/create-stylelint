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
const INFO_PREFIX = `${' '.repeat(2)}${bgMagenta(white(' INFO '))}${' '.repeat(8)}`;
const COMMAND_INFO_TEXT = magenta('Stylelint will run the following command:');
const DEPENDENCY_INSTALL_TEXT = 'Installing the necessary Stylelint dependencies...';

export async function installDependencies(context: Context): Promise<void> {
	if (context.shouldSkipInstall) {
		logAction('--skip-install', 'Dependency installation skipped');

		return;
	}

	const resolvedPackages = await Promise.all(
		REQUIRED_PACKAGES.map(async (packageName) => ({
			packageName,
			requestedVersion: await resolvePackageVersion(packageName),
		})),
	);

	const installCommand = getInstallCommand(context.packageManager!, resolvedPackages);

	newline();
	log(`${INFO_PREFIX}${COMMAND_INFO_TEXT}`);
	log(`${' '.repeat(16)}If you skip this step, you can always run it yourself later`);
	newline();
	log(`${createBox([installCommand])}\n`);

	const shouldProceed = await getInstallConfirmation(context);

	if (!shouldProceed) return;

	if (context.isDryRun) {
		logAction('--dry-run', 'Skipping dependency installation');

		return;
	}

	const installationSpinner = ora(DEPENDENCY_INSTALL_TEXT).start();

	try {
		const [...args] = installCommand.split(' ');

		await x(context.packageManager!, args, {
			nodeOptions: { cwd: process.cwd() },
		});
		installationSpinner.succeed('Successfully installed dependencies');
	} catch (error) {
		installationSpinner.fail(`Failed to install dependencies: ${(error as Error).message}`);
		log(dim('Please check your network connection and try again.\n'));
		context.exit(1);
	}
}
