/* eslint n/no-process-exit: 'off' */

import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';

import { cancel, confirm, intro, isCancel, log, note, outro, spinner } from '@clack/prompts';
import { cosmiconfig } from 'cosmiconfig';
import { execa } from 'execa';
import pc from 'picocolors';
// @ts-expect-error - TS2595: 'whichPMRuns' can only be imported by using a default import.
//                    Need to wait for a `@types/which-pm-runs` new version.
import { whichPMRuns } from 'which-pm-runs';

const DEFAULT_CONFIG_FILE = 'stylelint.config.mjs';
const DEFAULT_CONFIG_CONTENT = `/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"]
};`;

const ADD_COMMAND = 'add -D stylelint stylelint-config-standard';

export async function main() {
	const pkgManager = whichPMRuns()?.name ?? 'npm';
	const cwd = './';

	intro(pc.bgGreen(pc.white(' create-stylelint ')));

	note(
		stripIndent(`
			Create a ${pc.cyan(DEFAULT_CONFIG_FILE)} file containing:

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
					? `A ${pc.cyan('stylelint')} entry in ${pc.cyan('package.json')} already exists.`
					: `A ${pc.cyan(basename)} file already exists.`;

			throw new Error(`${failureMessage} Remove it and then try again.`);
		}

		if (!directoryHasPackageJson(cwd)) {
			throw new Error(
				`A ${pc.cyan('package.json')} was not found. Run ${pc.cyan(`${pkgManager} init`)} and then try again.`,
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
		await execa(pkgManager, [...ADD_COMMAND.split(' ')], { cwd });
		depsSpinner.stop('Added dependencies');
	} catch (error) {
		handleError(depsSpinner, error);
	}

	log.success('Stylelint is ready!');

	note(
		stripIndent(`
			Lint your CSS files:

			  ${pc.dim(`${getExecuteCommand(pkgManager)} stylelint "**/*.css"`)}

			Customize your config:

			- ${pc.underline(pc.cyan('https://stylelint.io/user-guide/customize'))}
		`).trim(),
		'Next steps:',
	);

	log.message(
		stripIndent(`
			${pc.dim('Support Stylelint:')}

			${pc.dim(`- ${pc.underline(pc.cyan('https://github.com/sponsors/stylelint'))}`)}
			${pc.dim(`- ${pc.underline(pc.cyan('https://opencollective.com/stylelint'))}`)}
		`).trim(),
	);

	outro(pc.green('Done!'));
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
			throw new Error(`${pc.cyan(pkgManager)} package manager is not supported`);
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
