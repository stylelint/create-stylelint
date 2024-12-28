import picocolors from 'picocolors';
import type { PackageManager } from './context';

function getLintCommand(packageManager: PackageManager): string {
	switch (packageManager) {
		case 'npm':
			return 'npx stylelint "**/*.css"';
		case 'yarn':
			return 'yarn dlx stylelint "**/*.css"';
		case 'pnpm':
			return 'pnpm dlx stylelint "**/*.css"';
		case 'bun':
			return 'bunx stylelint "**/*.css"';
		default:
			return 'npx stylelint "**/*.css"';
	}
}

export async function showNextSteps(packageManager: PackageManager): Promise<void> {
	const lintCommand = getLintCommand(packageManager);

	console.log(`
${picocolors.green('You can now lint your CSS files by running the command:')}
${picocolors.dim(lintCommand)}

${picocolors.dim(
	'Please refer to the official Stylelint documentation for more customization options:',
)}
${picocolors.dim('https://stylelint.io/user-guide/configure/')}
  `);
}
