import { Command } from 'package-manager-detector';
import { PackageManager } from './package-utils.js';
import { resolveCommand } from 'package-manager-detector/commands';

const PM_DOCS = {
	npm: 'https://docs.npmjs.com/',
	pnpm: 'https://pnpm.io/cli/',
	yarn: 'https://yarnpkg.com/cli/',
	bun: 'https://bun.sh/docs/cli/',
	deno: 'https://docs.deno.com/runtime/reference/cli/',
} as const;

interface DependencySpecification {
	packageName: string;
	requestedVersion?: string;
}

const resolvePMCommand = (pm: PackageManager, type: Command, args: string[] = []) => {
	const cmd = resolveCommand(pm, type, args);

	if (!cmd) throw new Error(`${type} command not found for ${pm}`);

	return cmd;
};

const formatPkgSpec = (
	{ packageName, requestedVersion }: DependencySpecification,
	pm: PackageManager,
) =>
	`${pm === 'deno' ? `npm:${packageName}` : packageName}${requestedVersion ? `@${requestedVersion}` : ''}`;

export const getInitCommand = (pm: PackageManager) => {
	// Since package-manager-detector doesn't provide a specific command for initialization,
  // we use the base package manager command ('agent') and append 'init' to it
	const { command } = resolvePMCommand(pm, 'agent');

	return { command: `${command} init`, docs: `${PM_DOCS[pm]}init` };
};

export const getLintCommand = (pm: PackageManager, script = 'stylelint "**/*.css"') => {
	const { command, args } = resolvePMCommand(pm, 'execute', [script]);

	return `${command} ${args.join(' ')}`;
};

export const getInstallCommand = (pm: PackageManager, packages: DependencySpecification[]) => {
	if (!packages.length) throw new Error('At least one package required');

	const specs = packages.map((pkg) => formatPkgSpec(pkg, pm));
	const { command, args } = resolvePMCommand(pm, 'add', ['-D', ...specs]);

	return `${command} ${args.join(' ')}`;
};
