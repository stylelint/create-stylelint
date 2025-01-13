import type { Context } from '$/actions/context.js';
import { bgYellow, black, yellow, bold } from 'picocolors';
import { log, newline } from '$/output/format.js';

export async function promptForInstallation(context: Context): Promise<boolean> {
	const response = await context.prompt(
		{
			type: 'confirm',
			name: 'proceed',
			message: 'Install Stylelint dependencies?',
			initial: true,
		},
		{
			onCancel: () => {
				newline();
				log(yellow('Operation cancelled by user'));
				context.exit(0);
			},
		},
	);

	if (!response.proceed) {
		log(
			`${' '.repeat(2)}${bgYellow(black(' CANCEL '))}${' '.repeat(6)}${yellow(
				'Dependencies were ',
			)}${bold(yellow('NOT'))}${yellow(' installed.')}`,
		);
		newline();
	}

	return response.proceed;
}
