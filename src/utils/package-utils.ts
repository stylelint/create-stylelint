import { blue, bold, cyan, gray, underline, white } from 'picocolors';
import fs from 'node:fs/promises';
import { getInitCommand } from './package-manager-commands.js';
import { log } from './logger.js';
import path from 'node:path';
import process from 'node:process';
import validate from 'validate-npm-package-name';

const PM_OPTIONS = ['npm', 'pnpm', 'yarn', 'bun', 'deno'] as const;

export type PackageManager = (typeof PM_OPTIONS)[number];

export const getPackageManager = (flags: Record<`--use-${PackageManager}`, boolean>) =>
	PM_OPTIONS.find((pm) => flags[`--use-${pm}`]);

export const validateNpmName = (name: string) => {
	const { validForNewPackages, errors = [], warnings = [] } = validate(name);

	return validForNewPackages
		? { valid: true }
		: { valid: false, problems: [...errors, ...warnings] };
};

export const validatePackageJson = async (pm: PackageManager | null) => {
	const pkgPath = path.join(process.cwd(), 'package.json');

	try {
		await fs.stat(pkgPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;

		const { command, docs } = getInitCommand(pm ?? 'npm');

		log(
			`${bold('Missing package.json')}\n\n` +
				`${white('Create one with:')}\n` +
				`${cyan('1.')} Run ${bold(command)}\n` +
				`${cyan('2.')} Follow prompts\n\n` +
				`${gray('Documentation:')} ${underline(blue(docs))}`,
		);

		process.exit(1);
	}
};
