import ora from 'ora';
import { shell } from '../shell.js';
import { Context } from './context.js';
import picocolors from 'picocolors';

const STYLELINT_DEPENDENCIES = ['stylelint', 'stylelint-config-standard'];

export async function installProjectDependencies(context: Context): Promise<void> {
	const spinner = ora('Installing the necessary Stylelint packages...').start();

	if (context.dryRun) {
		spinner.info('Installing the necessary Stylelint packages... (skipped due to --dry-run)');
		spinner.stop();
		return;
	}

	try {
		await shell(context.packageManager, ['add', '-D', ...STYLELINT_DEPENDENCIES], {
			cwd: process.cwd(),
		});
	} catch (error) {
		spinner.fail(`Failed to install the packages:\n${error}`);
		console.error(picocolors.red('Ensure your package manager is installed and try again.'));
		context.exit(1);
	}

	spinner.succeed('Successfully installed the required Stylelint packages.');
}
