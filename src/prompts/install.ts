import { Context } from '../actions/context.js';
import pc from 'picocolors';
import { log, newline } from '../utils/output/format.js';
import { handlePromptCancel, logDryRunSkipped } from '../utils/prompts.js';

export async function promptForInstallation(context: Context): Promise<boolean> {
	const response = await context.prompt(
		{
			type: 'confirm',
			name: 'proceed',
			message: 'Continue?',
			initial: true,
		},
		{
			onCancel: () => handlePromptCancel(context), 
		},
	);

	if (!response.proceed) {
		log(
			`${' '.repeat(2)}${pc.bgYellow(pc.black(' CANCEL '))}${' '.repeat(6)}${pc.yellow(
				'Dependency installation ',
			)}${pc.bold(pc.yellow('NOT'))}${pc.yellow(' completed.')}`,
		);
		newline();
		context.exit(0);
	}

	if (context.isDryRun) {
		logDryRunSkipped('dependency installation'); 
	}

	if (context.shouldSkipInstall) {
		log(
			'\n' +
				' '.repeat(2) +
				pc.green('◼') +
				'  ' +
				pc.green('--skip-install') +
				' Skipping dependency installation.\n',
		);
	}

	return response.proceed;
}
