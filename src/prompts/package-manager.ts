import type { PackageManager } from '../utils/package/helpers.js';
import type { Context } from '../actions/context.js';
import pc from 'picocolors';
import { log, newline } from '../utils/output/format.js';
import { handlePromptCancel, logDryRunSkipped } from '../utils/prompts.js';

export function determinePackageManagerFromFlags(context: Context): PackageManager | null {
	return context['--use-npm']
		? 'npm'
		: context['--use-pnpm']
		  ? 'pnpm'
		  : context['--use-yarn']
		    ? 'yarn'
		    : context['--use-bun']
		      ? 'bun'
		      : 'npm';
}

export async function promptPackageManager(context: Context): Promise<PackageManager> {
	let flagPM: PackageManager | null = null;
	if (context['--use-npm']) flagPM = 'npm';
	if (context['--use-pnpm']) flagPM = 'pnpm';
	if (context['--use-yarn']) flagPM = 'yarn';
	if (context['--use-bun']) flagPM = 'bun';

	if (flagPM) {
		context.prompt.override({ packageManager: flagPM });
	}

	const defaultPM = context.pkgManager || 'npm';
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
			initial: ['npm', 'pnpm', 'yarn', 'bun'].indexOf(defaultPM),
		},
		{
			onCancel: () => handlePromptCancel(context),
		},
	);

	if (!response.packageManager) {
		newline();
		log(pc.red('Package manager selection cancelled.'));
		newline();
		context.exit(1);
	}

	if (flagPM) {
		log(
			`${pc.green(
				'✔',
			)} Select the package manager you'd like to use: » ${flagPM} (--use-${flagPM})`,
		);
		newline();
	}

	return response.packageManager;
}
