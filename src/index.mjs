/* eslint-disable no-process-exit */
/* eslint no-console: 'off' */

import detectPackageManager from 'which-pm-runs';
import { execa } from 'execa';
import fs from 'fs';
import ora from 'ora';
import picocolors from 'picocolors';

const DEFAULT_CONFIG_FILE = '.stylelintrc.json';

const STYLELINT_CONFIG_PATHS = new Set([
	'.stylelintrc',
	'.stylelintrc.cjs',
	'.stylelintrc.json',
	'.stylelintrc.yaml',
	'.stylelintrc.yml',
	'.stylelintrc.js',
	'stylelint.config.js',
	'stylelint.config.cjs',
]);

const NEXT_STEPS_STRING = `
You can now lint your CSS files using:
npx stylelint "**/*.css"

${picocolors.dim(`We recommend customizing Stylelint:
https://stylelint.io/user-guide/customize/`)}
`;

function getExistingConfigsInDirectory(dir) {
	return fs.readdirSync(dir).filter((file) => STYLELINT_CONFIG_PATHS.has(file));
}

function directoryHasPackageJson(dir) {
	return fs.readdirSync(dir).some((file) => file === 'package.json');
}

function getInstallCommand(pkgManager) {
	return pkgManager === 'npm' ? 'install' : 'add';
}

async function installPackages(cwd, pkgManager) {
	const installExec = execa(
		pkgManager,
		[`${getInstallCommand(pkgManager)}`, '-D', 'stylelint', 'stylelint-config-standard'],
		{ cwd },
	);
	const installingPackagesMsg = `Installing packages...`;
	const installSpinner = ora(installingPackagesMsg).start();

	await new Promise((resolve, reject) => {
		installExec.stdout?.on('data', (data) => {
			installSpinner.text = `${installingPackagesMsg}\n${picocolors.bold(
				`[${pkgManager}]`,
			)} ${data}`;
		});
		installExec.on('error', (error) => {
			console.error(picocolors.red(`Failed to install packages: ${error}`));
			reject(error);
		});
		installExec.on('close', () => resolve());
	});
	installSpinner.text = picocolors.green('Installed packages.');
	installSpinner.succeed();
}

export async function main() {
	const pkgManager = detectPackageManager()?.name || 'npm';
	const cwd = './';

	const existingConfigs = getExistingConfigsInDirectory(cwd);

	if (existingConfigs.length > 0) {
		console.error(
			picocolors.red(
				`The ${existingConfigs.join(
					', ',
				)} config(s) already exist. Remove them and then try again.`,
			),
		);
		process.exit(1);
	}

	if (!directoryHasPackageJson(cwd)) {
		console.error(
			picocolors.red(
				`The package.json was not found. Run "${pkgManager} init" and then try again.`,
			),
		);
		process.exit(1);
	}

	fs.writeFileSync(DEFAULT_CONFIG_FILE, '{ "extends": ["stylelint-config-standard"] }');
	console.log(picocolors.green(`Created ${DEFAULT_CONFIG_FILE}.`));

	await installPackages(cwd, pkgManager);

	console.log(picocolors.green('Stylelint has been fully configured.'));

	console.log(NEXT_STEPS_STRING);
}
