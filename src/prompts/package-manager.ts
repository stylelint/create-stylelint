import { blue, bold, green, yellow } from 'picocolors';

import { log, logAction, newline } from '../utils/logger.js';
import type { Context } from '../actions/context.js';
import type { PackageManager } from '../utils/package-utils.js';

export async function getPackageManagerConfirmation(context: Context): Promise<PackageManager> {
	const selectedPM = context.packageManager;

	if (selectedPM) {
		context.prompt.override({ packageManager: selectedPM });
		log(`${green('✔')} Selected package manager: ${selectedPM} (--use-${selectedPM})`);
		newline();

		return selectedPM;
	}

	const defaultPackageManager = context.packageManager ?? 'npm';
	const response = await context.prompt(
		{
			type: 'select',
			name: 'packageManager',
			message: "Select the package manager you'd like to use:",
			choices: [
				{ title: 'npm', value: 'npm' },
				{ title: 'pnpm', value: 'pnpm' },
				{ title: 'yarn', value: 'yarn' },
				{ title: 'bun', value: 'bun' },
				{ title: 'deno', value: 'deno' },
			],
			initial: ['npm', 'pnpm', 'yarn', 'bun', 'deno'].indexOf(defaultPackageManager),
		},
		{
			onCancel: () => {
				newline();
				log(`${yellow('⚠')} ${bold('Operation cancelled')}`);
				log(`${green('❯')} You can either:`);
				log(`  1. Rerun with ${blue('--help')} for options`);
				log(`  2. Use flags like ${blue('--use-npm')} or ${blue('--use-pnpm')}`);
				context.exit(0);
			},
		},
	);

	if (context.isDryRun) {
		logAction('--dry-run', 'Skipping package manager selection');
	}

	return response.packageManager;
}
