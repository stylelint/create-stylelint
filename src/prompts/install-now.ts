import prompts from 'prompts';
import { messages } from '../messages';

export async function promptInstallDependencies(
	pkgManager: string,
	dependencies: string[],
): Promise<boolean> {
	const { installDependencies } = await prompts({
		type: 'confirm',
		name: 'installDependencies',
		message: messages.installDependenciesConfirmation(pkgManager, dependencies),
		initial: true,
	});

	return installDependencies;
}
