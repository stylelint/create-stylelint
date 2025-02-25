import { bgYellow, black, yellow } from 'picocolors';
import { log, newline } from '../utils/logger.js';
import type { Context } from '../actions/context.js';

export async function getInstallConfirmation(context: Context): Promise<boolean> {
	const { proceed } = await context.prompt({
		type: 'confirm',
		name: 'proceed',
		message: 'Install Stylelint dependencies?',
		initial: true,
	});

	if (!proceed) {
		const cancelPrefix = `${'  '}${bgYellow(black(' CANCEL '))}${' '.repeat(6)}`;

		newline();
		log(
			`${cancelPrefix}${yellow('Skipping dependency installation for now. You can always run the install command again later.')}`,
		);
		newline();
	}

	return proceed;
}
