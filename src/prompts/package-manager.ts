import type { PackageManager } from '$/package/helpers.js';
import type { Context } from '$/actions/context.js';
import { yellow, red, green } from 'picocolors';
import { log, newline } from '$/output/format.js';

export async function promptPackageManager(context: Context): Promise<PackageManager> {
	const selectedManagerFromFlags = context.packageManager;

	if (selectedManagerFromFlags) {
		context.prompt.override({ packageManager: selectedManagerFromFlags });

		log(
			`${green(
				'✔',
			)} Select the package manager you'd like to use: » ${selectedManagerFromFlags} (--use-${selectedManagerFromFlags})`,
		);
		newline();

		return selectedManagerFromFlags;
	}

	const defaultPackageManager = context.packageManager || 'npm';
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
			],
			initial: ['npm', 'pnpm', 'yarn', 'bun'].indexOf(defaultPackageManager),
		},
		{
			onCancel: () => {
				newline();
				log(yellow('Operation cancelled by user'));
				context.exit(0);
			},
		},
	);

	if (!response.packageManager) {
		newline();
		log(red('Package manager selection cancelled.'));
		newline();
		context.exit(1);
	}

	return response.packageManager;
}
