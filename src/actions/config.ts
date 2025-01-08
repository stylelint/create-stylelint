import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import pc from 'picocolors';
import ora from 'ora';
import { cosmiconfigSync } from 'cosmiconfig';
import { Context } from './context.js';
import { createBox, log, newline } from '../utils/output/format.js';
import { promptConfigCreation } from '../prompts/config.js';
import { logDryRunSkipped } from '../utils/prompts.js';

const DEFAULT_STYLELINT_CONFIG_CONTENT = `export default {
  extends: ['stylelint-config-standard']
};`;

export interface ConfigResult {
	filepath: string;
	exists: boolean;
}

export function findConfig(): ConfigResult | null {
	const explorer = cosmiconfigSync('stylelint');
	const result = explorer.search();

	if (result) {
		return { filepath: result.filepath, exists: true };
	}

	return null;
}

export async function writeConfig(configPath: string, content: string): Promise<void> {
	await fs.writeFile(configPath, content, 'utf8');
}

export function showConfig(configContent: string): void {
	newline();
	log(
		`${' '.repeat(2)}${pc.bgMagenta(pc.white(' INFO '))}${' '.repeat(8)}${pc.magenta(
			'Creating Stylelint configuration file...',
		)}`,
	);
	log(`${' '.repeat(16)}The following configuration will be added to your project:`);
	newline();

	const fileName = 'stylelint.config.mjs';
	const contentLines = configContent.split('\n');

	log(
		createBox(contentLines, {
			fileName,
			fileNameColor: pc.cyan,
			borderColor: pc.gray,
			textColor: pc.white,
		}) + '\n',
	);
}

export function checkConfig(existingConfig: ConfigResult | null, context: Context): void {
	if (!existingConfig) return;

	const basename = path.basename(existingConfig.filepath);
	const message =
		basename === 'package.json'
			? "A Stylelint configuration is already defined in your project's `package.json` file."
			: `A Stylelint configuration file named "${basename}" already exists in this project.`;

	newline();
	log(
		`${' '.repeat(2)}${pc.bgRed(pc.white(' ERROR '))}${' '.repeat(7)}${pc.red(
			`Failed to create the Stylelint configuration file:\n${message}`,
		)}`,
	);
	newline();
	context.exit(1);
}

async function createConfig(context: Context): Promise<void> {
	if (context.isDryRun) {
		logDryRunSkipped('configuration file creation');
		return;
	}

	const spinner = ora('Creating Stylelint configuration file...').start();

	try {
		const configPath = path.join(process.cwd(), 'stylelint.config.mjs');
		await writeConfig(configPath, DEFAULT_STYLELINT_CONFIG_CONTENT);
		spinner.succeed(`Successfully created configuration file: ${pc.cyan('stylelint.config.mjs')}`);
	} catch (error) {
		spinner.fail(
			`${' '.repeat(2)}${pc.bgRed(pc.white(' ERROR '))}${' '.repeat(
				4,
			)}Failed to create configuration file`,
		);
		log(pc.dim('Please check your file permissions and try again.\n'));
		context.exit(1);
	}
}

export async function setupConfig(context: Context): Promise<void> {
	const existingConfig = findConfig();
	checkConfig(existingConfig, context);

	showConfig(DEFAULT_STYLELINT_CONFIG_CONTENT);

	const proceed = await promptConfigCreation(context);
	if (!proceed) return;

	await createConfig(context);
}
