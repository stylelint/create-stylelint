import ora from 'ora';
import { bgMagenta, magenta, white, green } from 'picocolors';
import { shell } from '$/output/shell.js';
import { Context } from '$/actions/context.js';
import { createBox, log, newline } from '$/output/format.js';
import { promptForInstallation } from '$/prompts/install.js';
import { getInstallCommand } from '$/package/helpers.js';

type Package = { name: string; version: string };

async function runInstall(packageManager: string, command: string): Promise<void> {
	await shell(packageManager, command.split(' ').slice(1), { cwd: process.cwd() });
}

async function installWithLoader(
	packageManager: string,
	command: string,
	context: Context,
): Promise<void> {
	if (context.isDryRun) {
		log(
			'\n' +
				' '.repeat(2) +
				green('◼') +
				'  ' +
				green('--dry-run') +
				` Skipping dependency installation.\n`,
		);
		return;
	}

	const spinner = ora('Installing the necessary Stylelint dependencies...').start();

	try {
		await runInstall(packageManager, command);
		spinner.succeed('Successfully installed dependencies');
	} catch (error) {
		spinner.fail('Failed to install dependencies');
		console.error(error);
		context.exit(1);
	}
}

export async function installDependencies(context: Context): Promise<void> {
	if (context.shouldSkipInstall) return;

	const packages: Package[] = [
		{ name: 'stylelint', version: context.packageVersions.stylelint },
		{ name: 'stylelint-config-standard', version: context.packageVersions.stylelintConfig },
	];

	const installCommand = getInstallCommand(context.packageManager, packages);

	newline();
	log(
		`${' '.repeat(2)}${bgMagenta(white(' INFO '))}${' '.repeat(8)}${magenta(
			'Stylelint will run the following command:',
		)}`,
	);
	log(`${' '.repeat(16)}If you skip this step, you can always run it yourself later`);
	newline();
	log(createBox([installCommand]) + '\n');

	const shouldProceed = await promptForInstallation(context);
	if (shouldProceed) {
		await installWithLoader(context.packageManager, installCommand, context);
	}
}
