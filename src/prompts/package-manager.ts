import prompts from 'prompts';
import detectPackageManager from 'preferred-pm';
import picocolors from 'picocolors';
import { PackageManager } from '../utils/helpers.js';

export async function promptPackageManager(): Promise<PackageManager> {
	const detectedPackageManager = await detectPackageManager(process.cwd());

	const { packageManager } = await prompts(
		{
			type: 'select',
			name: 'packageManager',
			message: 'Which package manager do you want to use for installing dependencies?',
			choices: [
				{ title: 'npm', value: 'npm' },
				{ title: 'pnpm', value: 'pnpm' },
				{ title: 'yarn', value: 'yarn' },
				{ title: 'bun', value: 'bun' },
			],
			initial: (() => {
				switch (detectedPackageManager?.name) {
					case 'pnpm':
						return 1;
					case 'yarn':
						return 2;
					case 'bun':
						return 3;
					default:
						return 0;
				}
			})(),
		},
		{
			onCancel: () => {
				console.log('\n');
				console.log(picocolors.yellow('Operation cancelled by user.'));
				process.exit(1);
			},
		},
	);

	return packageManager as PackageManager;
}
