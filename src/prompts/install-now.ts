import picocolors from 'picocolors';
import prompts from 'prompts';
import { getLatestVersion } from '../utils/registry.js';

export async function promptInstallDependencies(
	pkgManager: string,
	dependencies: string[],
): Promise<boolean> {
	const versions = await Promise.all(
		dependencies.map(async (dep) => {
			const version = await getLatestVersion(dep);
			return `${dep}@${version}`;
		}),
	);

	const { installDependencies } = await prompts(
		{
			type: 'confirm',
			name: 'installDependencies',
			message: `The following dependencies will be installed using ${pkgManager}:\n\n  ${versions.join(
				'\n  ',
			)}\n\nWould you like to proceed with the installation?`,
			initial: true,
		},
		{
			onCancel: () => {
				console.log('\n');
				console.log(picocolors.yellow('Operation cancelled by user.'));
				process.exit(1);
			},
		},
	);

	return installDependencies as boolean;
}
