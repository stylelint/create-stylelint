import { PackageManager, getPackageManager } from '../utils/package-utils.js';
import arg from 'arg';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import prompts from 'prompts';

export interface PromptWithOverride {
	(
		questions: prompts.PromptObject | Array<prompts.PromptObject>,
		options?: prompts.Options,
	): Promise<prompts.Answers<string>>;
	override(obj: { packageManager?: PackageManager }): void;
}

export interface Context {
	isDryRun: boolean;
	help: boolean;
	version?: boolean;
	prompt: PromptWithOverride;
	cwd: URL;
	packageManager: PackageManager | undefined;
	shouldSkipInstall: boolean;
	install?: boolean;
	exit(code: number): never;
}

export async function createContext(originalArgv: string[]): Promise<Context> {
	const flags = arg(
		{
			'--help': Boolean,
			'--version': Boolean,
			'-h': '--help',
			'-v': '--version',
			'--use-npm': Boolean,
			'--use-yarn': Boolean,
			'--use-pnpm': Boolean,
			'--use-bun': Boolean,
			'--use-deno': Boolean,
			'--dry-run': Boolean,
			'--no-install': Boolean,
			'--no-color': Boolean,
		},
		{ argv: originalArgv, permissive: true },
	);

	const packageManagerFlags = {
		'--use-npm': flags['--use-npm'] ?? false,
		'--use-yarn': flags['--use-yarn'] ?? false,
		'--use-pnpm': flags['--use-pnpm'] ?? false,
		'--use-bun': flags['--use-bun'] ?? false,
		'--use-deno': flags['--use-deno'] ?? false,
	};

	return {
		help: flags['--help'] || false,
		version: flags['--version'] || false,
		prompt: prompts,
		isDryRun: Boolean(flags['--dry-run']),
		shouldSkipInstall: Boolean(flags['--no-install']),
		cwd: new URL(`${pathToFileURL(process.cwd())}/`),
		packageManager: getPackageManager(packageManagerFlags),
		exit: (code) => process.exit(code),
	};
}
