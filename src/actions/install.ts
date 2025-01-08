import ora from 'ora';
import pc from 'picocolors';
import { shell } from '../utils/output/shell.js';
import { Context } from './context.js';
import { createBox, log, newline } from '../utils/output/format.js';
import { promptForInstallation } from '../prompts/install.js';
import { getInstallCommand } from '../utils/package/helpers.js';
import { logDryRunSkipped } from '../utils/prompts.js';

interface Package {
	name: string;
	version: string;
}

function logInfo(message: string): void {
	newline();
	log(`${' '.repeat(2)}${pc.bgMagenta(pc.white(' INFO '))}${' '.repeat(8)}${pc.magenta(message)}`);
}

async function runInstall(packageManager: string, pkgs: Package[]): Promise<void> {
	if (!packageManager) {
		throw new Error('No package manager specified.');
	}

	const installFlags = pkgs.map((pkg) => `${pkg.name}@${pkg.version}`);
	await shell(packageManager, ['add', '-D', ...installFlags], { cwd: process.cwd() });
}

async function installWithLoader(
	packageManager: string,
	packages: Package[],
	context: Context,
): Promise<void> {
	if (context.isDryRun) {
		logDryRunSkipped('dependency installation');
		return;
	}

	const spinner = ora('Installing the necessary Stylelint dependencies...').start();

	try {
		await runInstall(packageManager, packages);
		spinner.succeed('Successfully installed dependencies');
	} catch (error) {
		spinner.fail('Failed to install dependencies');
		console.error(error);
		context.exit(1);
	}
}

export async function installDeps(context: Context): Promise<void> {
	const packages: Package[] = [
		{ name: 'stylelint', version: context.pkgVersions.stylelint },
		{ name: 'stylelint-config-standard', version: context.pkgVersions.stylelintConfig },
	];

	const installCommand = getInstallCommand(context.pkgManager!, packages);

	logInfo('Stylelint will run the following command:');
	log(`${' '.repeat(16)}If you skip this step, you can always run it yourself later`);
	newline();
	log(createBox([installCommand]) + '\n');

	const shouldProceed = await promptForInstallation(context);

	if (shouldProceed && !context.shouldSkipInstall) {
		await installWithLoader(context.pkgManager!, packages, context);
	}
}
