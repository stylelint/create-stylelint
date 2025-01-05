import { Context } from '../actions/context.js';
import pc from 'picocolors';
import { log, newline } from './output/format.js';

export function handlePromptCancel(context: Context): void {
	newline();
	log(pc.yellow('Operation cancelled by user'));
	log(pc.yellow('You can run the command again to restart the setup.'));
	context.exit(0);
}

export function logDryRunSkipped(action: string): void {
	log(
		'\n' + ' '.repeat(2) + pc.green('◼') + '  ' + pc.green('--dry-run') + ` Skipping ${action}.\n`,
	);
}
