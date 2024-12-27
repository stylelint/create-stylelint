import prompts from 'prompts';

export async function promptInstallDependencies(
	pkgManager: string,
	dependencies: string[],
): Promise<boolean> {
	const { installDependencies } = await prompts({
		type: 'confirm',
		name: 'installDependencies',
		message: `The following dependencies will be installed using ${pkgManager}:\n\n  ${dependencies.join(
			'\n  ',
		)}\n\nWould you like to proceed with the installation?`,
		initial: true,
	});

	return installDependencies as boolean;
}
