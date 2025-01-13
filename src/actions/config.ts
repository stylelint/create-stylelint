import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { bgMagenta, magenta, white, gray, cyan, green, red, bgRed, dim } from 'picocolors';
import ora from 'ora';
import { cosmiconfigSync } from 'cosmiconfig';
import { Context } from '$/actions/context.js';
import { createBox, log, newline } from '$/output/format.js';
import { promptConfig } from '$/prompts/config.js';

const DEFAULT_STYLELINT_CONFIG_CONTENT = `export default {
  extends: ['stylelint-config-standard']
};`;

type ConfigResult = { filepath: string; exists: boolean } | null;

function findConfig(): ConfigResult {
	const explorer = cosmiconfigSync('stylelint');
	const result = explorer.search();
	return result ? { filepath: result.filepath, exists: true } : null;
}

async function writeConfig(configPath: string, content: string): Promise<void> {
	await fs.writeFile(configPath, content, 'utf8');
}

function showConfig(configContent: string): void {
	newline();
	log(
		`${' '.repeat(2)}${bgMagenta(white(' INFO '))}${' '.repeat(8)}${magenta(
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
			fileNameColor: cyan,
			borderColor: gray,
			textColor: white,
		}) + '\n',
	);
}

async function createConfig(context: Context, configPath: string): Promise<void> {
	if (context.isDryRun) {
		log(
			'\n' +
				' '.repeat(2) +
				green('◼') +
				'  ' +
				green('--dry-run') +
				` Skipping configuration file creation.\n`,
		);
		return;
	}

	const spinner = ora('Creating Stylelint configuration file...').start();

	try {
		await writeConfig(configPath, DEFAULT_STYLELINT_CONFIG_CONTENT);
		spinner.succeed(`Successfully created configuration file: ${cyan('stylelint.config.mjs')}`);
	} catch (error) {
		spinner.fail(`Failed to create configuration file`);
		log(dim('Please check your file permissions and try again.\n'));
		context.exit(1);
	}
}

export async function setupConfig(context: Context): Promise<void> {
	const existingConfig = findConfig();
	if (existingConfig?.exists) {
		log(
			`${' '.repeat(2)}${bgRed(white(' ERROR '))}${' '.repeat(7)}${red(
				`A Stylelint configuration already exists: ${existingConfig.filepath}`,
			)}`,
		);
		newline();
		context.exit(1);
	}

	showConfig(DEFAULT_STYLELINT_CONFIG_CONTENT);

	const configPath = path.join(process.cwd(), 'stylelint.config.mjs');
	const proceed = await promptConfig(context, configPath);

	if (proceed) {
		await createConfig(context, configPath);
	}
}
