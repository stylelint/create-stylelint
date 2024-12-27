import process from 'node:process';
import { execa } from 'execa';
import ora from 'ora';
import { messages } from '../messages';
import { PackageManager } from '../prompts/package-manager';
import { UsagePreference } from '../prompts/usage-preference';

export function getInstallCommand(pkgManager: PackageManager): string {
	return pkgManager === 'npm' ? 'install' : 'add';
}

export async function installProjectDependencies(
	cwd: string,
	pkgManager: PackageManager,
	usagePreference: UsagePreference,
): Promise<void> {
	const spinner = ora(messages.installingPackages).start();
	const baseConfig =
		usagePreference === 'errors' ? 'stylelint-config-recommended' : 'stylelint-config-standard';

	try {
		await execa(pkgManager, [`${getInstallCommand(pkgManager)}`, '-D', 'stylelint', baseConfig], {
			cwd,
		});
	} catch (error: any) {
		spinner.fail(`${messages.failedToInstallPackages}:\n${error}`);
		process.exit(1);
	}

	spinner.succeed(messages.installedPackages);
}
