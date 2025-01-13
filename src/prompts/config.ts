import type { Context } from '$/actions/context.js';
import { bgYellow, black, yellow, bold } from 'picocolors';
import * as nodeFs from 'fs/promises'
import * as nodePath from 'path'
import { log, newline } from '$/output/format.js';

export async function promptConfig(context: Context, filepath: string): Promise<boolean> {
  const fileExists = await nodeFs
    .access(filepath)
    .then(() => true)
    .catch(() => false);

	const fileName = nodePath.basename(filepath);

	if (fileExists) {
		const response = await context.prompt(
			{
				type: 'confirm',
				name: 'overwrite',
				message: `Configuration file ${fileName} already exists. Overwrite?`,
				initial: false,
			},
			{
				onCancel: () => {
					newline();
					log(yellow('Operation cancelled by user'));
					context.exit(0);
				},
			},
		);

		if (!response.overwrite) {
			log(
				`${' '.repeat(2)}${bgYellow(black(' SKIP '))}${' '.repeat(8)}${yellow(
					'Keeping existing configuration file.',
				)}`,
			);
			newline();
			return false;
		}

		return true; 
	} else {
		const response = await context.prompt(
			{
				type: 'confirm',
				name: 'proceed',
				message: 'Create Stylelint configuration?',
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
					'Configuration file was ',
				)}${bold(yellow('NOT'))}${yellow(' created.')}`,
			);
			newline();
			return false;
		}

		return true; 
	}
}
