import prompts from 'prompts';
import detectPackageManager from 'which-pm-runs';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export async function promptPackageManager(): Promise<PackageManager> {
	const detectedPackageManager = detectPackageManager()?.name;

	const { packageManager } = await prompts({
		type: 'select',
		name: 'packageManager',
		message: 'Which package manager do you want to use for installing dependencies?',
		choices: [
			{ title: 'npm', value: 'npm' },
			{ title: 'pnpm', value: 'pnpm' },
			{ title: 'yarn', value: 'yarn' },
		],
		initial: detectedPackageManager === 'pnpm' ? 1 : detectedPackageManager === 'yarn' ? 2 : 0,
	});

	return packageManager;
}
