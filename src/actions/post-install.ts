import picocolors from 'picocolors';
import { getPackageManagerValue, PackageManager } from '../utils/helpers.js';

export async function showNextSteps(packageManager: PackageManager): Promise<void> {
	const lintCommand = getPackageManagerValue(packageManager, 'commands', 'lint');
	const docsUrl = 'https://stylelint.io/user-guide/configure/';

	console.log(`
${picocolors.green('You can now lint your CSS files by running the command:')}
${picocolors.green(lintCommand)}

${picocolors.dim(
	'Please refer to the official Stylelint documentation for more customization options:',
)}
${picocolors.dim(docsUrl)}
    `);
}
