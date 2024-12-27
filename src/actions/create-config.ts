import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';
import ora from 'ora';
import { messages } from '../messages';
import type { UsagePreference } from '../prompts/usage-preference';
import { type CosmiconfigResult, cosmiconfigSync } from 'cosmiconfig';

const DEFAULT_CONFIG_FILE = '.stylelintrc.json';

export function findExistingConfig(): CosmiconfigResult | null {
	const explorer = cosmiconfigSync('stylelint');
	return explorer.search();
}

export async function createStylelintConfig(
	cwd: string,
	usagePreference: UsagePreference,
): Promise<void> {
	const spinner = ora(messages.creatingConfig).start();
	const existingConfig = findExistingConfig();

	if (existingConfig !== null) {
		const basename = path.basename(existingConfig.filepath);
		const failureMessage =
			basename === 'package.json'
				? messages.configExistsInPackageJson
				: messages.configExists(basename);

		spinner.fail(
			`${messages.failedToCreateConfig}:\n${failureMessage} ${messages.removeAndTryAgain}`,
		);
		process.exit(1);
	}

	const extendsConfig =
		usagePreference === 'errors' ? 'stylelint-config-recommended' : 'stylelint-config-standard';

	try {
		fs.writeFileSync(
			path.join(cwd, DEFAULT_CONFIG_FILE),
			JSON.stringify({ extends: [extendsConfig] }, null, 2),
		);
	} catch (error: any) {
		spinner.fail(`${messages.failedToCreateConfig}:\n${error}`);
		process.exit(1);
	}

	spinner.succeed(messages.createdConfig(DEFAULT_CONFIG_FILE));
}
