/* eslint n/no-process-exit: 'off' */

import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';
import { styleText } from 'node:util'; // eslint-disable-line n/no-unsupported-features/node-builtins

import { cancel, confirm, intro, isCancel, log, note, outro, spinner } from '@clack/prompts';
import { cosmiconfig } from 'cosmiconfig';
import { x } from 'tinyexec';

const DEFAULT_CONFIG_FILE = 'stylelint.config.mjs';
const DEFAULT_CONFIG_CONTENT = `/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"]
};`;

const ADD_COMMAND = 'add -D stylelint stylelint-config-standard';

export async function main() {
	const pkgManager = detectPackageManager();
	const cwd = './';

	intro(styleText(['bgGreen', 'white'], ' create-stylelint '));

	note(
		stripIndent(`
			Create a ${styleText('cyan', DEFAULT_CONFIG_FILE)} file containing:

			  ${DEFAULT_CONFIG_CONTENT.split('\n').join('\n\t\t\t  ')}

			Add the related dependencies using:

			  ${pkgManager} ${ADD_COMMAND}
		`).trim(),
		'This tool will:',
	);

	const shouldContinue = await confirm({ message: 'Continue?' });

	if (isCancel(shouldContinue) || !shouldContinue) {
		cancel('Canceled');
		process.exit(0);
	}

	const configSpinner = spinner();

	configSpinner.start('Creating config');

	try {
		const existingConfig = await getExistingConfigInDirectory();

		if (existingConfig !== null) {
			const basename = path.basename(existingConfig.filepath);
			const failureMessage =
				basename === 'package.json'
					? `A ${styleText('cyan', 'stylelint')} entry in ${styleText('cyan', 'package.json')} already exists.`
					: `A ${styleText('cyan', basename)} file already exists.`;

			throw new Error(`${failureMessage} Remove it and then try again.`);
		}

		if (!directoryHasPackageJson(cwd)) {
			throw new Error(
				`A ${styleText('cyan', 'package.json')} was not found. Run ${styleText('cyan', `${pkgManager} init`)} and then try again.`,
			);
		}

		fs.writeFileSync(DEFAULT_CONFIG_FILE, `${DEFAULT_CONFIG_CONTENT}\n`);
		configSpinner.stop('Created config file');
	} catch (error) {
		handleError(configSpinner, error);
	}

	const depsSpinner = spinner();

	depsSpinner.start('Adding dependencies');

	try {
		const { exitCode, stderr, stdout } = await x(pkgManager, ADD_COMMAND.split(' '), {
			nodeOptions: { cwd },
		});

		if (exitCode !== 0) {
			throw new Error(stderr || stdout);
		}

		depsSpinner.stop('Added dependencies');
	} catch (error) {
		handleError(depsSpinner, error);
	}

	log.success('Stylelint is ready!');

	note(
		stripIndent(`
			Lint your CSS files:

			  ${styleText('dim', `${getExecuteCommand(pkgManager)} stylelint "**/*.css"`)}

			Customize your config:

			- ${styleText(['underline', 'cyan'], 'https://stylelint.io/user-guide/customize')}
		`).trim(),
		'Next steps:',
	);

	log.message(
		stripIndent(`
			${styleText('dim', 'Support Stylelint:')}

			${styleText('dim', `- ${styleText(['underline', 'cyan'], 'https://github.com/sponsors/stylelint')}`)}
			${styleText('dim', `- ${styleText(['underline', 'cyan'], 'https://opencollective.com/stylelint')}`)}
		`).trim(),
	);

	outro(styleText('green', 'Done!'));
}

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
 * @param {ReturnType<typeof spinner>} s
 * @param {unknown} error
 * @returns {never}
 */
function handleError(s, error) {
	const message = error instanceof Error ? error.message : String(error);

	s.error(message);
	cancel('Canceled');
	process.exit(1);
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
			throw new Error(`${styleText('cyan', pkgManager)} package manager is not supported`);
	}
}

/**
 * @param {string} string
 * @return {string}
 */
function stripIndent(string) {
	const indents = string.match(/^[ \t]*(?=\S)/gm);

	if (!indents) return string;

	const commonIndent = Math.min(...indents.map((indent) => indent.length));

	if (commonIndent === 0) return string;

	return string.replace(new RegExp(`^[ \\t]{${commonIndent}}`, 'gm'), '');
}

function detectPackageManager() {
	const userAgent = process.env.npm_config_user_agent;

	if (!userAgent) return 'npm';

	const [spec = ''] = userAgent.split(' ');
	const name = spec.substring(0, spec.lastIndexOf('/'));

	return name === 'npminstall' ? 'cnpm' : name;
}
