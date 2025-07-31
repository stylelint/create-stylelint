/* eslint no-console: 'off' */
/* eslint n/no-process-exit: 'off' */

import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';

import confirm from '@inquirer/confirm';
import { cosmiconfig } from 'cosmiconfig';
import detectPackageManager from 'which-pm-runs';
import { execa } from 'execa';
import ora from 'ora';
import picocolors from 'picocolors';
import stripIndent from 'strip-indent';

const DEFAULT_CONFIG_FILE = 'stylelint.config.mjs';
const DEFAULT_CONFIG_CONTENT = `/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
};`;

async function getExistingConfigInDirectory() {
	const explorer = cosmiconfig('stylelint');
	const result = await explorer.search();

	return result;
}

/**
 * @param {fs.PathLike} dir
 */
function directoryHasPackageJson(dir) {
	return fs.readdirSync(dir).some((file) => file === 'package.json');
}

/**
 * @param {string} pkgManager
 */
function getInstallCommand(pkgManager) {
	return pkgManager === 'npm' ? 'install' : 'add';
}

function cancelSetup() {
	console.error(picocolors.yellow('Setup cancelled.'));
	process.exit(1);
}

async function showPrompt() {
	console.log(
		stripIndent(`
			This tool will create a '${DEFAULT_CONFIG_FILE}' file containing:
		`),
	);

	console.log(
		picocolors.dim(
			DEFAULT_CONFIG_CONTENT.split('\n')
				.map((line) => `  ${line}`)
				.join('\n'),
		),
	);

	console.log(
		stripIndent(`
			And install the related dependencies using:

			  ${picocolors.dim(`npm install -D stylelint stylelint-config-standard`)}
		`),
	);

	let proceed;

	try {
		proceed = await confirm({
			message: 'Continue?',
		});
	} catch (error) {
		if (error instanceof Error && error.name === 'ExitPromptError') {
			// silence
		} else {
			throw error;
		}
	}

	if (!proceed) {
		cancelSetup();
	}
}

/**
 * @param {string} cwd
 * @param {string} pkgManager
 */
async function createConfig(cwd, pkgManager) {
	const spinner = ora('Creating config...').start();
	const existingConfig = await getExistingConfigInDirectory();

	if (existingConfig !== null) {
		const basename = path.basename(existingConfig.filepath);
		const failureMessage =
			basename === 'package.json'
				? 'A "stylelint" config in "package.json" already exists.'
				: `A "${basename}" config already exists.`;

		spinner.fail();

		console.error(
			stripIndent(`
				${failureMessage} Remove it and then try again.
			`),
		);

		cancelSetup();
	}

	if (!directoryHasPackageJson(cwd)) {
		spinner.fail();

		console.error(
			stripIndent(`
				A "package.json" was not found. Run "${pkgManager} init" and then try again.
			`),
		);

		cancelSetup();
	}

	try {
		fs.writeFileSync(DEFAULT_CONFIG_FILE, DEFAULT_CONFIG_CONTENT);
	} catch (error) {
		spinner.fail();
		console.error(
			stripIndent(`
				${error}
			`),
		);
		cancelSetup();
	}

	spinner.succeed(`Created ${DEFAULT_CONFIG_FILE}`);
}

/**
 * @param {string} cwd
 * @param {string} pkgManager
 */
async function installPackages(cwd, pkgManager) {
	const spinner = ora('Installing packages...').start();

	try {
		await execa(
			pkgManager,
			[`${getInstallCommand(pkgManager)}`, '-D', 'stylelint', 'stylelint-config-standard'],
			{ cwd },
		);
	} catch (error) {
		spinner.fail();
		console.error(
			stripIndent(`
				${error}
			`),
		);
		cancelSetup();
	}

	spinner.succeed('Installed packages');
}

function showNextSteps() {
	console.log(
		stripIndent(`
			${picocolors.green(picocolors.bold('Setup complete!'))}

			Lint your CSS files with:

			  ${picocolors.dim(`npx stylelint "**/*.css"`)}

			Next steps? Customize your config: ${picocolors.underline(
				picocolors.blue('https://stylelint.io/user-guide/customize'),
			)}

			If you benefit from Stylelint, please consider sponsoring the project on:

			- ${picocolors.underline(picocolors.blue('https://github.com/sponsors/stylelint'))}
			- ${picocolors.underline(picocolors.blue('https://opencollective.com/stylelint'))}
		`),
	);
}

export async function main() {
	const pkgManager = detectPackageManager()?.name ?? 'npm';
	const cwd = './';

	await showPrompt();
	await createConfig(cwd, pkgManager);
	await installPackages(cwd, pkgManager);
	showNextSteps();
}
