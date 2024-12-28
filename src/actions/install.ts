import ora from 'ora';
import { shell } from '../shell';
import { Context } from './context';

export async function installProjectDependencies(context: Context): Promise<void> {
	const spinner = ora('Installing the necessary Stylelint packages...').start();

	if (context.dryRun) {
		spinner.info('Installing the necessary Stylelint packages... (skipped due to --dry-run)');
		spinner.stop();
		return;
	}

	try {
		await shell(context.packageManager, ['add', '-D', 'stylelint', 'stylelint-config-standard'], {
			cwd: process.cwd(),
		});
	} catch (error) {
		spinner.fail(`Failed to install the packages:\n${error}`);
		context.exit(1);
	}

	spinner.succeed('Successfully installed the required Stylelint packages.');
}
