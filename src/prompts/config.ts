import { bgYellow, black, yellow } from 'picocolors';

import { log, newline } from '../utils/logger.js';
import type { Context } from '../actions/context.js';

export async function getConfigConfirmation(context: Context): Promise<boolean> {
	const response = await context.prompt({
		type: 'confirm',
		name: 'proceed',
		message: 'Would you like to create a Stylelint configuration file for your project?',
		initial: true,
	}, {
		onCancel: () => {
			newline();
		log(
			`${' '.repeat(2)}${bgYellow(black(' CANCEL '))}${' '.repeat(6)}${yellow(
				'Stylelint configuration setup cancelled. If you change your mind, you can always run the configuration setup again.',
			)}`,
		);
		newline();

		context.exit(1);
		}
	});

	if (!response.proceed) {
		newline();
		log(
			`${' '.repeat(2)}${bgYellow(black(' CANCEL '))}${' '.repeat(6)}${yellow(
				'Stylelint configuration setup cancelled. If you change your mind, you can always run the configuration setup again.',
			)}`,
		);
		newline();

		context.exit(1);
	}

	return true;
}
