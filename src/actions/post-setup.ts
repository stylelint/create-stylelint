import { bgGreen, gray, green, white } from 'picocolors';

import { log, newline } from '../utils/logger.js';
import type { Context } from './context.js';
import { getLintCommand } from '../utils/package-manager-commands.js';

async function showNextSteps(context: Context): Promise<void> {
	const packageManager = context.packageManager;
	const lintCommand = getLintCommand(packageManager!);

	newline();

	log(
		`${' '.repeat(2)}${bgGreen(white(' SUCCESS '))}${' '.repeat(5)}${green(
			'Project setup complete!',
		)}`,
	);

	log(`${' '.repeat(16)}Run the following command to start linting:`);
	log(`${' '.repeat(16)}${lintCommand}`);

	newline();

	log(
		`${' '.repeat(2)}${gray(
			'Need to customize?:',
		)}`,
	);

	log(`${' '.repeat(2)}${'https://stylelint.io/user-guide/configure/'}`);
}

export { showNextSteps };
