import { blue, bold, cyan, gray, underline, white } from 'picocolors';
import { getInitCommand } from './package-manager-commands.js';
import { log } from './logger.js';

import * as path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import validate from 'validate-npm-package-name';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'deno';

export async function getPackageManager(flags: {
	'--use-npm'?: boolean;
	'--use-pnpm'?: boolean;
	'--use-yarn'?: boolean;
	'--use-bun'?: boolean;
	'--use-deno'?: boolean;
}): Promise<PackageManager | undefined> {
	return (['npm', 'pnpm', 'yarn', 'bun', 'deno'] as const).find((pm) => flags[`--use-${pm}`]);
}

type ValidateNpmNameResult =
	| {
			valid: true;
	  }
	| {
			valid: false;
			problems: string[];
	  };

export function validateNpmName(name: string): ValidateNpmNameResult {
	const nameValidation = validate(name);

	if (nameValidation.validForNewPackages) {
		return { valid: true };
	}

	return {
		valid: false,
		problems: [...(nameValidation.errors || []), ...(nameValidation.warnings || [])],
	};
}

export async function validatePackageJson(packageManager: PackageManager | null): Promise<void> {
	const packageJsonPath = path.join(process.cwd(), 'package.json');
	const defaultPackageManager = packageManager ?? 'npm';
	const initConfig = getInitCommand(defaultPackageManager);

	try {
		await fs.stat(packageJsonPath);
	} catch (error) {
		const err = error as NodeJS.ErrnoException;

		if (err.code === 'ENOENT') {
			log(
				`${bold('Hold up! We need a package.json file')}\n\n` +
					`${white("Let's create one with these simple steps:")}\n` +
					`${cyan('1.')} Run ${bold(initConfig.command)}\n` +
					`${cyan('2.')} Follow the prompts to create your package.json\n\n` +
					`${gray('Need help?')}\n` +
					`${white('Check out:')} ${underline(blue(initConfig.docs))}`,
			);

			process.exit(1);
		}
	}
}
