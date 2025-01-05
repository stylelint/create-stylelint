import ora from 'ora';
import pc from 'picocolors';
import { shell } from '../utils/output/shell.js';
import { Context } from './context.js';
import { createBox, log, newline } from '../utils/output/format.js';
import { promptForInstallation } from '../prompts/install.js';
import { getInstallCommand } from '../utils/package/helpers.js';

interface Package {
	name: string;
	version: string;
}

function logInfo(message: string): void {
	newline();
	log(`${' '.repeat(2)}${pc.bgMagenta(pc.white(' INFO '))}${' '.repeat(8)}${pc.magenta(message)}`);
}

async function runInstall(pkgManager: string, pkgs: Package[]): Promise<void> {
	if (!pkgManager) {
		throw new Error('No package manager specified.');
	}

	const installFlags = pkgs.map((pkg) => `${pkg.name}@${pkg.version}`);
	await shell(pkgManager, ['add', '-D', ...installFlags], { cwd: process.cwd() });
}

async function installWithLoader(pkgManager: string, pkgs: Package[], ctx: Context): Promise<void> {
	const spinner = ora('Installing the necessary Stylelint pkgs...').start();

	try {
		await runInstall(pkgManager, pkgs);
		spinner.succeed('Successfully installed dependencies');
	} catch (error) {
		spinner.fail('Failed to install dependencies');
		ctx.exit(1);
	}
}

export async function installDeps(ctx: Context): Promise<void> {
	const pkgs: Package[] = [
		{ name: 'stylelint', version: ctx.pkgVersions.stylelint },
		{ name: 'stylelint-config-standard', version: ctx.pkgVersions.stylelintConfig },
	];

	const installCommand = getInstallCommand(ctx.pkgManager!, pkgs);

	logInfo('Stylelint will run the following command:');
	log(`${' '.repeat(16)}If you skip this step, you can always run it yourself later.`);
	newline();
	log(createBox([installCommand]) + '\n');

	await promptForInstallation(ctx);
	await installWithLoader(ctx.pkgManager!, pkgs, ctx);
}
