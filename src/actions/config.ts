import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { bgMagenta, bold, cyan, gray, magenta, white } from 'picocolors';
import { log, logAction, newline } from '../utils/logger.js';
import { Context } from './context.js';
import { cosmiconfig } from 'cosmiconfig';
import { createBox } from '../utils/terminal-box.js';
import { getConfigConfirmation } from '../prompts/config.js';
import ora from 'ora';
import process from 'node:process';

const CONFIG_FILE = 'stylelint.config.mjs';
const DEFAULT_CONFIG_CONTENT = `export default {
  extends: ['stylelint-config-standard']
};`;

async function findExistingConfig(): Promise<string | null> {
	const localConfigPath = path.join(process.cwd(), CONFIG_FILE);

	try {
		await fs.access(localConfigPath);

		return localConfigPath;
	} catch {
		const { filepath } = (await cosmiconfig('stylelint').search()) || {};

		return filepath ?? null;
	}
}

function displayConfigPreview(): void {
	newline();
	log(
		`  ${bgMagenta(white(' INFO '))}${' '.repeat(8)}${magenta('Creating Stylelint configuration file...')}`,
	);
	log(`  ${' '.repeat(14)}The following configuration will be added to your project:`);
	newline();

	const boxContent = createBox(DEFAULT_CONFIG_CONTENT.split('\n'), {
		fileName: CONFIG_FILE,
		fileNameColor: cyan,
		borderColor: gray,
		textColor: white,
	});

	log(`${boxContent}\n`);
}

export async function setupStylelintConfig(context: Context): Promise<void> {
	if (!context.isDryRun) {
		const existingConfig = await findExistingConfig();

		if (existingConfig) {
			log(
				`${bold('Oops! Configuration file already exists')}\n\n` +
					`${gray('We found:')} ${cyan(existingConfig)}\n\n` +
					`${white('What to do next?')}\n` +
					`${magenta('›')} ${white('Rename the existing file (e.g. "stylelint.config.old")')}\n` +
					`${magenta('›')} ${white('Or delete it if no longer needed')}\n\n` +
					`${white('Then run this command again to create a new config!')}\n\n` +
					`${gray('🔍 Want to preview changes without writing files? Try')} ${cyan('--dry-run')}`,
			);
			context.exit(1);
		}
	}

	displayConfigPreview();

	const configPath = path.join(process.cwd(), CONFIG_FILE);

	if (!(await getConfigConfirmation(context))) return;

	if (context.isDryRun) {
		logAction('--dry-run', 'Skipping configuration file creation');

		return;
	}

	const spinner = ora('Creating Stylelint configuration...').start();

	await fs.writeFile(configPath, DEFAULT_CONFIG_CONTENT, 'utf-8');
	spinner.succeed(`${cyan(CONFIG_FILE)} was added to your project`);
}
