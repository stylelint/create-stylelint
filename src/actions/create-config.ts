import * as nodeFS from 'node:fs';
import * as nodePath from 'node:path';
import ora from 'ora';
import type { Context } from './context.js';
import { cosmiconfigSync, type CosmiconfigResult } from 'cosmiconfig';
import picocolors from 'picocolors';

const STYLELINT_CONFIG_FILE_NAME = 'stylelint.config.mjs';
const DEFAULT_STYLELINT_CONFIG_CONTENT = `export default {
  extends: ["stylelint-config-standard"]
};
`;

export function findExistingConfig(): CosmiconfigResult | null {
	try {
		const explorer = cosmiconfigSync('stylelint');
		return explorer.search();
	} catch (error) {
		console.error(picocolors.red('Failed to find existing Stylelint configuration:'));
		console.error(picocolors.red(error instanceof Error ? error.message : String(error)));
		return null;
	}
}

export async function createStylelintConfig(context: Context): Promise<void> {
	const spinner = ora('Creating Stylelint configuration file...').start();

	if (context.dryRun) {
		spinner.info('Creating Stylelint configuration file... (skipped due to --dry-run)');
		spinner.stop();
		return;
	}

	const existingConfig = findExistingConfig();
	if (existingConfig !== null) {
		const basename = nodePath.basename(existingConfig.filepath);
		const failureMessage =
			basename === 'package.json'
				? "A Stylelint configuration is already defined in your project's `package.json` file."
				: `A Stylelint configuration file named "${basename}" already exists in this project.`;

		spinner.fail(
			`Failed to create the Stylelint configuration file.\n${failureMessage} Please remove the existing configuration file and try again.`,
		);
		context.exit(1);
	}

	const configPath = nodePath.join(process.cwd(), STYLELINT_CONFIG_FILE_NAME);

	try {
		nodeFS.writeFileSync(configPath, DEFAULT_STYLELINT_CONFIG_CONTENT);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		spinner.fail(`Failed to create the Stylelint configuration file:\n${errorMessage}`);
		context.exit(1);
	}

	spinner.succeed(
		`Successfully created the Stylelint configuration file: ${STYLELINT_CONFIG_FILE_NAME}`,
	);
}
