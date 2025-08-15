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
import pc from 'picocolors';
import stripIndent from 'strip-indent';

const DEFAULT_CONFIG_FILE = 'stylelint.config.mjs';
const DEFAULT_CONFIG_CONTENT = `/** @type {import("stylelint").Config} */
export default {
  "extends": ["stylelint-config-standard"]
};`;

const ADD_COMMAND = 'add -D stylelint stylelint-config-standard';

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
 * @return {string} The command
 */
function getExecuteCommand(pkgManager) {
	switch (pkgManager) {
		case 'npm':
			return 'npx';
		case 'bun':
			return 'bunx';
		case 'pnpm':
		case 'yarn':
			return `${pkgManager} dlx`;
		default:
			throw new Error(`"${pkgManager}" package manager is not supported`);
	}
}

/**
 * @param {string} errorMessage
 */
function cancelSetup(errorMessage = '') {
	console.error(
		stripIndent(`
			${pc.red(pc.bold('Setup canceled!'))}
		`),
	);

	if (errorMessage) {
		console.error(
			stripIndent(`${errorMessage}
			`),
		);
	}

	process.exit(1);
}

/**
 * @param {string} pkgManager
 */
async function showPrompt(pkgManager) {
	console.info(
		stripIndent(`
			We'll create a ${pc.italic(DEFAULT_CONFIG_FILE)} file containing:
		`),
	);

	console.info(
		pc.dim(
			DEFAULT_CONFIG_CONTENT.split('\n')
				.map((line) => `  ${line}`)
				.join('\n'),
		),
	);

	console.info(
		stripIndent(`
			Then add the related dependencies using:

			  ${pc.dim(`${pkgManager} ${ADD_COMMAND}`)}
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
		cancelSetup(`${failureMessage} Remove it and then try again.`);
	}

	if (!directoryHasPackageJson(cwd)) {
		spinner.fail();
		cancelSetup(`A "package.json" was not found. Run "${pkgManager} init" and then try again.`);
	}

	try {
		fs.writeFileSync(DEFAULT_CONFIG_FILE, DEFAULT_CONFIG_CONTENT);
	} catch (error) {
		spinner.fail();
		cancelSetup(error instanceof Error ? error.message : String(error));
	}

	spinner.succeed(`Created ${DEFAULT_CONFIG_FILE}`);
}

/**
 * @param {string} cwd
 * @param {string} pkgManager
 */
async function addPackages(cwd, pkgManager) {
	const spinner = ora('Adding packages...').start();

	try {
		await execa(pkgManager, [...ADD_COMMAND.split(' ')], {
			cwd,
		});
	} catch (error) {
		spinner.fail();
		cancelSetup(error instanceof Error ? error.message : String(error));
	}

	spinner.succeed('Added packages');
}

/**
 * @param {string} pkgManager
 */
function showNextSteps(pkgManager) {
	console.info(
		stripIndent(`
			${pc.green(pc.bold('Setup complete!'))}

			Lint your CSS files with:

			  ${pc.dim(`${getExecuteCommand(pkgManager)} stylelint "**/*.css"`)}

			Next steps? Customize your config: ${pc.underline(
				pc.blue('https://stylelint.io/user-guide/customize'),
			)}

			If you benefit from Stylelint, please consider sponsoring the project at:

			- ${pc.underline(pc.blue('https://github.com/sponsors/stylelint'))}
			- ${pc.underline(pc.blue('https://opencollective.com/stylelint'))}
		`),
	);
}

export async function main() {
	const pkgManager = detectPackageManager()?.name ?? 'npm';
	const cwd = './';

	await showPrompt(pkgManager);
	await createConfig(cwd, pkgManager);
	await addPackages(cwd, pkgManager);
	showNextSteps(pkgManager);
}
