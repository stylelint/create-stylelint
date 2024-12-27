import process from 'node:process';
import picocolors from 'picocolors';
import * as nodePath from 'node:path';
import { createStylelintConfig, findExistingConfig } from './actions/create-config';
import { ensureProjectPackageJson } from './actions/ensure-package-json';
import { installProjectDependencies } from './actions/install';
import { getContext } from './actions/context';
import { showHelpAction } from './actions/help';
import { showNextSteps } from './actions/post-install';
import { promptInstallDependencies } from './prompts/install-now';
import { promptUsagePreference } from './prompts/usage-preference';
import { promptPackageManager } from './prompts/package-manager';

let isCancelled = false;

process.on('SIGINT', () => {
	console.log('\n');
	console.log(picocolors.yellow('Operation cancelled by user.'));
	isCancelled = true;
	process.exit(0);
});

export async function main(): Promise<void> {
	let context = await getContext(process.argv.slice(2));

	if (context.help) {
		showHelpAction();
		return;
	}

	if (context.dryRun) {
		console.log(picocolors.yellow('Running in dry run mode. No changes will be made.'));
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
				`Failed to create the Stylelint configuration file.:\n${failureMessage} Please remove the existing configuration file and try again.`,
			),
		);
		context.exit(1);
	}

	await ensureProjectPackageJson(context);

	if (isCancelled) return;

	const selectedPackageManager = await promptPackageManager();

	context = { ...context, packageManager: selectedPackageManager };

	if (isCancelled) return;

	const usagePreference = await promptUsagePreference();

	if (isCancelled) return;

	const dependencies = [
		'stylelint',
		usagePreference === 'errors' ? 'stylelint-config-recommended' : 'stylelint-config-standard',
	];

	const installNow = await promptInstallDependencies(context.packageManager, dependencies);

	if (isCancelled) return;

	if (installNow) {
		await installProjectDependencies(context, usagePreference);
		await createStylelintConfig(context, usagePreference);
		await showNextSteps();
	} else {
		console.log(picocolors.yellow('Installation cancelled. No changes were made.'));
		context.exit(0);
	}
}

void main();
