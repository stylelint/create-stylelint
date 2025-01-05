import * as nodePath from 'node:path';
import * as nodeFS from 'node:fs';
import { PackageManager, getCommand } from '../package/helpers.js';

export async function validatePackageJson(packageManager: PackageManager | null): Promise<void> {
	const packageJsonPath = nodePath.join(process.cwd(), 'package.json');

	if (!nodeFS.existsSync(packageJsonPath)) {
		const pm = packageManager || 'npm';
		const initConfig = getCommand(pm, 'init');

		if (typeof initConfig !== 'object' || !initConfig.command || !initConfig.docs) {
			throw new Error('Invalid init command configuration');
		}

		throw new Error(
			`No package.json found in current directory.\n\n` +
				`Run this command to create one:\n${initConfig.command}\n\n` +
				`Learn more about initializing a package:\n${initConfig.docs}`,
		);
	}
}
