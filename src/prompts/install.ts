import { bgYellow, black, yellow } from 'picocolors';

import { log, newline } from '../utils/logger.js';
import type { Context } from '../actions/context.js';

export async function getInstallConfirmation(context: Context): Promise<boolean> {
	const response = await context.prompt({
		type: 'confirm',
		name: 'proceed',
		message: 'Install Stylelint dependencies?',
		initial: true,
	});

	if (!response.proceed) {
		newline();
		log(
			`${' '.repeat(2)}${bgYellow(black(' CANCEL '))}${' '.repeat(6)}${yellow(
				'Skipping dependency installation for now. You can always run the install command again later.',
			)}`,
		);
		newline();
	}

	return response.proceed;
}
