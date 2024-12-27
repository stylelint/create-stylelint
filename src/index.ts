import process from 'node:process';
import picocolors from 'picocolors';
import path from 'node:path';
import { findExistingConfig } from './actions/create-config';
import { promptPackageManager } from './prompts/package-manager';
import { createStylelintConfig } from './actions/create-config';
import { installProjectDependencies } from './actions/install-dependencies';
import { ensureProjectPackageJson } from './actions/ensure-package-json';
import { messages } from './messages';
import { promptUsagePreference } from './prompts/usage-preference';
import { promptInstallDependencies } from './prompts/install-now';
import { setupProcessHandlers } from './utils/process-handlers';

async function showNextSteps(): Promise<void> {
	console.log(`
${picocolors.green(messages.lintCommandRecommendation)}

${picocolors.dim(messages.customizationRecommendation)}
    `);
}

export async function main(): Promise<void> {
	setupProcessHandlers();

	const cwd = process.cwd();

	const existingConfig = findExistingConfig();
	if (existingConfig !== null) {
		const basename = path.basename(existingConfig.filepath);
		const failureMessage =
			basename === 'packageon'
				? messages.configExistsInPackageJson
				: messages.configExists(basename);

		console.error(
			picocolors.red(
				`${messages.failedToCreateConfig}:\n${failureMessage} ${messages.removeAndTryAgain}`,
			),
		);
		process.exit(1);
	}

	await ensureProjectPackageJson(cwd);

	const usagePreference = await promptUsagePreference();
	const pkgManager = await promptPackageManager();

	const dependencies = [
		'stylelint',
		usagePreference === 'errors' ? 'stylelint-config-recommended' : 'stylelint-config-standard',
	];

	const installNow = await promptInstallDependencies(pkgManager, dependencies);

	if (installNow) {
		await installProjectDependencies(cwd, pkgManager, usagePreference);
		await createStylelintConfig(cwd, usagePreference);
		await showNextSteps();
	} else {
		console.log(picocolors.yellow('Installation cancelled. No changes were made.'));
		process.exit(0);
	}
}

main()
