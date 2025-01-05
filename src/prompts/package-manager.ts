import type { PackageManager } from '../utils/package/helpers.js';
import type { Context } from '../actions/context.js';
import pc from 'picocolors';
import { log, newline } from '../utils/output/format.js';
import { handlePromptCancel, logDryRunSkipped } from '../utils/prompts.js';

interface PackageManagerChoice {
	title: string;
	value: PackageManager;
}

const PACKAGE_MANAGER_CHOICES: PackageManagerChoice[] = [
	{ title: 'npm', value: 'npm' },
	{ title: 'pnpm', value: 'pnpm' },
	{ title: 'yarn', value: 'yarn' },
	{ title: 'bun', value: 'bun' },
];

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
	const response = await context.prompt(
		{
			type: 'select',
			name: 'packageManager',
			message: "Select the package manager you'd like to use:",
			choices: PACKAGE_MANAGER_CHOICES,
			initial: 1,
		},
		{
			onCancel: () => handlePromptCancel(context),
		},
	);

	if (!response.packageManager) {
		newline();
		log(pc.red('Package manager selection cancelled.\n'));
		context.exit(1);
	}

	if (context.isDryRun) {
		logDryRunSkipped(`package manager selection (${response.packageManager})`);
	}

	return response.packageManager;
}
