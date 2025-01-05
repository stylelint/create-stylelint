import { pathToFileURL } from 'node:url';
import arg from 'arg';
import detectPackageManager from 'preferred-pm';
import prompts from 'prompts';
import pc from 'picocolors';
import ora from 'ora';
import { PackageManager } from '../utils/package/helpers.js';
import { showHelp } from './help.js';
import { resolvePackageVersion } from '../utils/network/registry.js';
import { validatePackageJson } from '../utils/fs/package.js';
import { validateFlags } from '../utils/output/validate.js';
import { log, newline } from '../utils/output/format.js';

export interface Context {
	help: boolean;
	prompt: typeof prompts;
	isDryRun?: boolean;
	cwd: URL;
	pkgManager: PackageManager | null;
	pkgVersions: {
		stylelint: string;
		stylelintConfig: string;
	};
	shouldSkipInstall: boolean;
	exit: (code: number) => never;
	'--use-npm'?: boolean;
	'--use-pnpm'?: boolean;
	'--use-yarn'?: boolean;
	'--use-bun'?: boolean;
}

export function parseFlags(args: string[]): arg.Result<{
	'--dry-run': BooleanConstructor;
	'--help': BooleanConstructor;
	'--use-npm': BooleanConstructor;
	'--use-pnpm': BooleanConstructor;
	'--use-yarn': BooleanConstructor;
	'--use-bun': BooleanConstructor;
	'--skip-install': BooleanConstructor;
	'--version': BooleanConstructor;
	'-h': string;
	'-v': string;
}> {
	return arg(
		{
			'--dry-run': Boolean,
			'--help': Boolean,
			'--use-npm': Boolean,
			'--use-pnpm': Boolean,
			'--use-yarn': Boolean,
			'--use-bun': Boolean,
			'--skip-install': Boolean,
			'--version': Boolean,
			'-h': '--help',
			'-v': '--version',
		},
		{ argv: args, permissive: true },
	);
}

export async function getPackageManager(options: {
	'--use-npm'?: boolean;
	'--use-pnpm'?: boolean;
	'--use-yarn'?: boolean;
	'--use-bun'?: boolean;
}): Promise<PackageManager | null> {
	if (options['--use-npm']) return 'npm';
	if (options['--use-pnpm']) return 'pnpm';
	if (options['--use-yarn']) return 'yarn';
	if (options['--use-bun']) return 'bun';

	const detectedManager = await detectPackageManager(process.cwd());
	return detectedManager?.name as PackageManager | null;
}

export async function getPackageVersions(): Promise<{
	stylelint: string;
	stylelintConfig: string;
}> {
	const loadingSpinner = ora('Resolving packages...').start();
	const [stylelintVer, configVer] = await Promise.all([
		resolvePackageVersion('stylelint'),
		resolvePackageVersion('stylelint-config-standard'),
	]);
	loadingSpinner.succeed('Successfully resolved packages');
	return { stylelint: stylelintVer, stylelintConfig: configVer };
}

export async function createContext(
	args: string[],
	exit: (code: number) => never = process.exit,
): Promise<Context> {
	const flags = parseFlags(args);
	validateFlags({ ...flags, exit });

	if (flags['--help'] || flags['-h']) {
		showHelp();
		exit(0);
	}

	const pkgManager = await getPackageManager(flags);

	if (!flags['--dry-run']) {
		await validatePackageJson(pkgManager);
	}

	const cwd = new URL(`${pathToFileURL(process.cwd())}/`);

	let pkgVersions = { stylelint: 'latest', stylelintConfig: 'latest' };

	if (!flags['--dry-run']) {
		try {
			pkgVersions = await getPackageVersions();
		} catch (error) {
			log(pc.red(`[ERROR] ${error}`));
			log(pc.red('[ERROR] Failed to resolve package versions'));
			newline();
			exit(1);
		}
	}

	return {
		help: flags['--help'] ?? false,
		prompt: prompts,
		pkgManager,
		pkgVersions,
		cwd,
		isDryRun: flags['--dry-run'],
		shouldSkipInstall: flags['--skip-install'] ?? false,
		exit,
		'--use-npm': flags['--use-npm'],
		'--use-pnpm': flags['--use-pnpm'],
		'--use-yarn': flags['--use-yarn'],
		'--use-bun': flags['--use-bun'],
	};
}
