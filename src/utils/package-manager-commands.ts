import { Command, ResolvedCommand } from 'package-manager-detector';
import { resolveCommand } from 'package-manager-detector/commands';

import type { PackageManager } from './package-utils.js';

export type DependencySpecification = { packageName: string; requestedVersion?: string };

const DOCS_URLS = {
	npm: 'https://docs.npmjs.com/',
	pnpm: 'https://pnpm.io/cli/',
	yarn: 'https://yarnpkg.com/cli/',
	bun: 'https://bun.sh/docs/cli/',
	deno: 'https://docs.deno.com/runtime/reference/cli/init/',
} as const;

function resolveCommandHelper(
	pm: PackageManager,
	commandType: Command,
	args: string[],
): ResolvedCommand {
	const resolved = resolveCommand(pm, commandType, args);

	if (!resolved) {
		throw new Error(`${commandType} command not found for ${pm}`);
	}

	return resolved;
}

function formatPackageSpec(packageSpec: DependencySpecification, packageManager: PackageManager) {
	const { packageName, requestedVersion } = packageSpec;
	const basePackageName = packageManager === 'deno' ? `npm:${packageName}` : packageName;

	return requestedVersion ? `${basePackageName}@${requestedVersion}` : basePackageName;
}

export function getInitCommand(pm: PackageManager) {
	const resolved = resolveCommandHelper(pm, 'agent', []);

	return {
		command: `${resolved.command} init`,
		docs: `${DOCS_URLS[pm]}init`,
	};
}

export function getLintCommand(
	packageManager: PackageManager,
	lintScript = 'stylelint "**/*.css"',
) {
	const resolved = resolveCommandHelper(packageManager, 'execute', [lintScript]);

	return `${resolved.command} ${resolved.args.join(' ')}`;
}

export function getInstallCommand(
	packageManager: PackageManager,
	packages: DependencySpecification[],
) {
	if (!packages.length) throw new Error('At least one package is required');

	const formattedPackages = packages.map((pkg) => formatPackageSpec(pkg, packageManager));
	const args = ['-D', ...formattedPackages];
	const resolved = resolveCommandHelper(packageManager, 'add', args);

	return `${resolved.command} ${resolved.args.join(' ')}`;
}
