import { blue, bold, green, yellow } from 'picocolors';
import { log, logAction, newline } from '../utils/logger.js';
import type { Context } from '../actions/context.js';
import { PackageManager } from '../utils/package-utils.js';

const PM_OPTIONS = ['npm', 'pnpm', 'yarn', 'bun', 'deno'] as const;

export async function getPackageManagerConfirmation(context: Context): Promise<PackageManager> {
	const checkmark = green('✔');
	const warning = yellow('⚠');
	const { packageManager: selectedPM } = context;

	if (selectedPM) {
		context.prompt.override({ packageManager: selectedPM });
		log(`${checkmark} Selected package manager: ${selectedPM} (--use-${selectedPM})`);
		newline();

		return selectedPM;
	}

	const defaultPM = context.packageManager ?? 'npm';
	const { packageManager } = await context.prompt(
		{
			type: 'select',
			name: 'packageManager',
			message: "Select the package manager you'd like to use:",
			choices: PM_OPTIONS.map((pm) => ({ title: pm, value: pm })),
			initial: PM_OPTIONS.indexOf(defaultPM),
		},
		{
			onCancel: () => {
				newline();
				log(`${warning} ${bold('Operation cancelled')}
${green('❯')} You can either:
  1. Rerun with ${blue('--help')} for options
  2. Use flags like ${PM_OPTIONS.map((pm) => blue(`--use-${pm}`)).join(' or ')}`);
				context.exit(0);
			},
		},
	);

	if (context.isDryRun) {
		logAction('--dry-run', 'Skipping package manager selection');
	}

	return packageManager;
}
