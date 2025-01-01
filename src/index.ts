import process from 'node:process';
import picocolors from 'picocolors';
import * as nodePath from 'node:path';
import * as nodeFS from 'node:fs';
import { createStylelintConfig, findExistingConfig } from './actions/create-config.js';
import { installProjectDependencies } from './actions/install.js';
import { getContext } from './actions/context.js';
import { showNextSteps } from './actions/post-install.js';
import { promptInstallDependencies } from './prompts/install-now.js';
import { promptPackageManager } from './prompts/package-manager.js';
import { isWriteable } from './utils/isWriteable.js';
import { getOnline } from './utils/isOnline.js';
import { getPackageManagerValue, PackageManager } from './utils/helpers.js';

process.on('SIGINT', () => {
	console.log('\n');
	console.log(picocolors.yellow('Operation cancelled by user.'));
	process.exit(0);
});

function checkForPackageJson(packageManager: PackageManager): void {
	const packageJsonPath = nodePath.join(process.cwd(), 'package.json');
	if (!nodeFS.existsSync(packageJsonPath)) {
		const initCommand = getPackageManagerValue(packageManager, 'commands', 'init');
		const docsUrl = getPackageManagerValue(packageManager, 'docs', 'initialization');

		console.error(
			picocolors.red(`A package.json file is required. Run \`${initCommand}\` to create one.`),
		);
		console.error(picocolors.dim(`Learn more: ${docsUrl}`));
		process.exit(1);
	}
}

export async function main(): Promise<void> {
	try {
		const context = await getContext(process.argv.slice(2));

		if (!context.dryRun) {
			checkForPackageJson(context.packageManager);
		}

		const currentDir = process.cwd();
		if (!(await isWriteable(currentDir))) {
			console.error(picocolors.red(`No write permissions in directory: ${currentDir}`));
			console.error(picocolors.dim('Please check your permissions and try again.'));
			process.exit(1);
		}

		if (!(await getOnline())) {
			console.error(picocolors.red('You are offline. Please check your internet connection.'));
			process.exit(1);
		}

		if (context.dryRun) {
			console.log(picocolors.yellow('Dry run mode enabled. The following actions would be taken:'));
			console.log(picocolors.yellow('- Detect package manager: npm, yarn, pnpm, or bun'));
			console.log(
				picocolors.yellow('- Install dependencies: stylelint, stylelint-config-standard'),
			);
			console.log(picocolors.yellow('- Create Stylelint configuration file: stylelint.config.mjs'));
			return;
		}

		const existingConfig = findExistingConfig();
		if (existingConfig !== null) {
			const basename = nodePath.basename(existingConfig.filepath);
			const failureMessage =
				basename === 'package.json'
					? "A Stylelint configuration is already defined in your project's `package.json` file."
					: `A Stylelint configuration file named "${basename}" already exists in this project.`;

			console.error(
				picocolors.red(
					`Failed to create the Stylelint configuration file:\n${failureMessage} Please remove the existing configuration file and try again.`,
				),
			);
			context.exit(1);
		}

		if (
			!context['--use-npm'] &&
			!context['--use-pnpm'] &&
			!context['--use-yarn'] &&
			!context['--use-bun'] &&
			!context.skipInstall
		) {
			const selectedPackageManager = await promptPackageManager();
			context.packageManager = selectedPackageManager;
		}

		const dependencies = ['stylelint', 'stylelint-config-standard'];

		if (!context.skipInstall) {
			const installNow = await promptInstallDependencies(context.packageManager, dependencies);
			if (installNow) {
				await installProjectDependencies(context);
			} else {
				console.log(picocolors.yellow('Installation cancelled. No changes were made.'));
				context.exit(0);
			}
		}

		await createStylelintConfig(context);
		await showNextSteps(context.packageManager);
	} catch (error) {
		console.error(picocolors.red(error instanceof Error ? error.message : String(error)));
		process.exit(1);
	}
}
