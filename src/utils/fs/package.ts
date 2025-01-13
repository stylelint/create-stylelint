import * as nodePath from 'node:path';
import * as nodeFS from 'node:fs';
import { PackageManager, getInitCommand } from '$/package/helpers.js';

export async function validatePackageJson(packageManager: PackageManager | null): Promise<void> {
	const packageJsonPath = nodePath.join(process.cwd(), 'package.json');

	const defaultPackageManager = packageManager || 'npm';
	const initConfig = getInitCommand(defaultPackageManager);

	if (!nodeFS.existsSync(packageJsonPath)) {
		throw new Error(
			`No package.json found in current directory.\n\n` +
				`Run this command to create one:\n${initConfig.command}\n\n` +
				`Learn more about initializing a package:\n${initConfig.docs}`,
		);
	}
}
