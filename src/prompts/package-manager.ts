import prompts from 'prompts';
import detectPackageManager from 'preferred-pm';

export type PackageManagerChoice = 'npm' | 'pnpm' | 'yarn' | 'bun';

export async function promptPackageManager(): Promise<PackageManagerChoice> {
	const detectedPackageManager = await detectPackageManager(process.cwd());

	const { packageManager } = await prompts({
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
	});

	return packageManager as PackageManagerChoice;
}
