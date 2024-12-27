import ora from 'ora';
import type { UsagePreference } from '../prompts/usage-preference';
import { shell } from '../shell';
import { Context, PackageManager } from './context';

export function getInstallCommand(pkgManager: PackageManager): string {
	return pkgManager === 'npm' ? 'install' : 'add';
}

export async function installProjectDependencies(
	context: Context,
	usagePreference: UsagePreference,
): Promise<void> {
	const spinner = ora('Installing the necessary Stylelint packages...').start();

	if (context.dryRun) {
		spinner.info('Installing the necessary Stylelint packages... (skipped due to --dry-run)');
		spinner.stop();
		return;
	}

	const baseConfig =
		usagePreference === 'errors' ? 'stylelint-config-recommended' : 'stylelint-config-standard';

	const installCommand = getInstallCommand(context.packageManager);

	try {
		await shell(context.packageManager, [installCommand, '-D', 'stylelint', baseConfig], {
			cwd: context.cwd,
		});
	} catch (error) {
		spinner.fail(`Failed to install the packages.:\n${error}`);
		context.exit(1);
	}

	spinner.succeed('Successfully installed the required Stylelint packages.');
}
