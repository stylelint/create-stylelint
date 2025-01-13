import { pathToFileURL } from 'node:url';
import arg from 'arg';
import prompts from 'prompts';
import { red, dim } from 'picocolors';
import ora from 'ora';
import { PackageManager } from '../utils/package/helpers.js';
import { showHelp } from './help.js';
import { resolvePackageVersion } from '../utils/network/registry.js';
import { validatePackageJson } from '../utils/fs/package.js';
import { log, newline } from '../utils/output/format.js';

export interface Context {
	help: boolean;
	prompt: typeof prompts;
	isDryRun?: boolean;
	currentWorkingDirectory: URL;
	packageManager: PackageManager;
	packageVersions: {
		stylelint: string;
		stylelintConfig: string;
	};
	shouldSkipInstall: boolean;
	exit: (code: number) => never;
	useNpm?: boolean;
	usePnpm?: boolean;
	useYarn?: boolean;
	useBun?: boolean;
}

export type Flags = arg.Result<{
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
}>;

export function parseFlags(args: string[]): Flags {
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

export function validateFlags(flags: Flags, exit: (code: number) => never): void {
	if ((flags['--version'] || flags['-v']) && (flags['--help'] || flags['-h'])) {
		log(red('The flags --version and --help cannot be used together.\n'));
		exit(1);
	}

	if (flags['--dry-run'] && flags['--skip-install']) {
		log(red('The flags --dry-run and --skip-install cannot be used together.\n'));
		exit(1);
	}

	const packageManagerFlags = ['--use-npm', '--use-pnpm', '--use-yarn', '--use-bun'] as const;
	const selectedPackageManagers = packageManagerFlags.filter((flag) => flags[flag]);
	if (selectedPackageManagers.length > 1) {
		log(red('Only one package manager can be specified.\n'));
		exit(1);
	}
}

export function determinePackageManagerFromFlags(flags: Flags): PackageManager | null {
	if (flags['--use-npm']) return 'npm';
	if (flags['--use-pnpm']) return 'pnpm';
	if (flags['--use-yarn']) return 'yarn';
	if (flags['--use-bun']) return 'bun';

	return null;
}

async function resolvePackageVersions(): Promise<{ stylelint: string; stylelintConfig: string }> {
	const loadingSpinner = ora('Resolving package versions...').start();
	try {
		const [stylelintVersion, stylelintConfigVersion] = await Promise.all([
			resolvePackageVersion('stylelint'),
			resolvePackageVersion('stylelint-config-standard'),
		]);
		loadingSpinner.succeed('Successfully resolved package versions');
		return { stylelint: stylelintVersion, stylelintConfig: stylelintConfigVersion };
	} catch (error) {
		loadingSpinner.fail('Failed to resolve package versions');
		throw error;
	}
}

async function handleSpecialFlags(flags: Flags, exit: (code: number) => never): Promise<void> {
	if (flags['--help'] || flags['-h']) {
		showHelp();
		exit(0);
	}

	if (flags['--version'] || flags['-v']) {
		try {
			const version = await resolvePackageVersion('create-stylelint');
			log(`create-stylelint v${version}`);
			exit(0);
		} catch (error) {
			log(red('Failed to fetch package version'));
			log(dim('Please check your network connection and try again.\n'));
			exit(1);
		}
	}
}

export async function createContext(
	args: string[],
	exit: (code: number) => never = process.exit,
): Promise<Context> {
	const flags = parseFlags(args);
	validateFlags(flags, exit);
	await handleSpecialFlags(flags, exit);

	let packageManager: PackageManager | null = null;
	if (flags['--use-npm']) packageManager = 'npm';
	if (flags['--use-pnpm']) packageManager = 'pnpm';
	if (flags['--use-yarn']) packageManager = 'yarn';
	if (flags['--use-bun']) packageManager = 'bun';

	if (!flags['--dry-run']) {
		await validatePackageJson(packageManager);
	}

	const currentWorkingDirectory = new URL(`${pathToFileURL(process.cwd())}/`);

	let packageVersions = { stylelint: '', stylelintConfig: '' };

	if (!flags['--dry-run']) {
		try {
			packageVersions = await resolvePackageVersions();
		} catch (error) {
			log(red(`[ERROR] ${error}`));
			log(red('[ERROR] Failed to resolve package versions'));
			newline();
			exit(1);
		}
	}

	return {
		currentWorkingDirectory,
		exit,
		help: flags['--help'] ?? false,
		isDryRun: flags['--dry-run'],
		packageManager: packageManager || 'npm',
		packageVersions,
		prompt: prompts,
		shouldSkipInstall: flags['--skip-install'] ?? false,
		useBun: flags['--use-bun'],
		useNpm: flags['--use-npm'],
		usePnpm: flags['--use-pnpm'],
		useYarn: flags['--use-yarn'],
	};
}
