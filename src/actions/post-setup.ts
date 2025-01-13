import { bgGreen, blue, gray, green, underline, white } from 'picocolors';
import { getLintCommand } from '$/package/helpers.js';
import terminalLink from 'terminal-link';
import type { Context } from '$/actions/context.js';
import { log, newline } from '$/output/format.js';

async function showNextSteps(context: Context): Promise<void> {
	const packageManager = context.packageManager;
	const lintCommand = getLintCommand(packageManager)

	newline();

	log(
		`${' '.repeat(2)}${bgGreen(white(' SUCCESS '))}${' '.repeat(5)}${green(
			'Start linting your CSS files:',
		)}`,
	);

	log(`${' '.repeat(16)}Run the following command to start linting:`);
	log(`${' '.repeat(16)}${lintCommand}`);

	newline();

	log(
		`${' '.repeat(2)}${gray(
			'For more customization options, refer to the official Stylelint documentation:',
		)}`,
	);

	const docLink = terminalLink(
		'https://stylelint.io/user-guide/configure/',
		'https://stylelint.io/user-guide/configure/',
		{
			fallback: (text) => underline(blue(text)),
		},
	);

	log(`${' '.repeat(2)}${docLink}`);
}

export { showNextSteps };
