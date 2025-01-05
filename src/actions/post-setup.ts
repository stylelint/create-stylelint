import pc from 'picocolors';
import { getLintCommand, PackageManager } from '../utils/package/helpers.js';
import terminalLink from 'terminal-link';
import type { Context } from './context.js';
import { log, newline } from '../utils/output/format.js';

export async function showNextSteps(context: Context): Promise<void> {
	const pkgManager = context.pkgManager as PackageManager;
	const lintCmd = getLintCommand(pkgManager);

	newline();

	log(
		`${' '.repeat(2)}${pc.bgGreen(pc.white(' SUCCESS '))}${' '.repeat(5)}${pc.green(
			'Start linting your CSS files:',
		)}`,
	);

	log(`${' '.repeat(16)}Run the following command to start linting:`);
	log(`${' '.repeat(16)}${lintCmd}`);

	newline();

	log(
		`${' '.repeat(2)}${pc.gray(
			'For more customization options, refer to the official Stylelint documentation:',
		)}`,
	);

	const docLink = terminalLink(
		'https://stylelint.io/user-guide/configure/',
		'https://stylelint.io/user-guide/configure/',
		{
			fallback: (text) => pc.underline(pc.blue(text)),
		},
	);

	log(`${' '.repeat(2)}${docLink}`);
}
