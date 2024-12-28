import picocolors from 'picocolors';
import * as nodeFS from 'node:fs';
import * as nodePath from 'node:path';
import type { PackageManager } from './context.js';

function getLintCommand(packageManager: PackageManager): string {
	switch (packageManager) {
		case 'npm':
			return 'npm run stylelint';
		case 'yarn':
			return 'yarn stylelint';
		case 'pnpm':
			return 'pnpm stylelint';
		case 'bun':
			return 'bun run stylelint';
		default:
			return 'npm run stylelint';
	}
}

function addStylelintScript(): void {
	const packageJsonPath = nodePath.join(process.cwd(), 'package.json');

	try {
		const packageJson = JSON.parse(nodeFS.readFileSync(packageJsonPath, 'utf-8'));

		if (!packageJson.scripts) {
			packageJson.scripts = {};
		}

		if (!packageJson.scripts.stylelint) {
			packageJson.scripts.stylelint = 'stylelint "**/*.css"';
			nodeFS.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
			console.log(picocolors.green('Added "stylelint" script to package.json.'));
		} else {
			console.log(picocolors.yellow('The "stylelint" script already exists in package.json.'));
		}
	} catch (error) {
		console.error(
			picocolors.red(
				`Failed to update package.json: ${error instanceof Error ? error.message : String(error)}`,
			),
		);
		process.exit(1);
	}
}

export async function showNextSteps(packageManager: PackageManager): Promise<void> {
	addStylelintScript();

	const lintCommand = getLintCommand(packageManager);

	console.log(`
${picocolors.green('You can now lint your CSS files by running the command:')}
${picocolors.green(lintCommand)}

${picocolors.dim(
	'Please refer to the official Stylelint documentation for more customization options:',
)}
${picocolors.dim('https://stylelint.io/user-guide/configure/')}
  `);
}
