import { pathToFileURL } from 'node:url';
import arg from 'arg';
import detectPackageManager from 'preferred-pm';
import prompts from 'prompts';
import picocolors from 'picocolors';
import { PackageManager } from '../utils/helpers.js';
import { showHelpAction } from './help.js';
import { getPackageVersionFromRegistry } from '../utils/registry.js';

export interface Context {
	help: boolean;
	prompt: typeof prompts;
	dryRun?: boolean;
	cwd: URL;
	packageManager: PackageManager;
	skipInstall: boolean;
	exit: (code: number) => never;
	'--use-npm'?: boolean;
	'--use-pnpm'?: boolean;
	'--use-yarn'?: boolean;
	'--use-bun'?: boolean;
}

export async function getContext(
	argv: string[],
	exitFn: (code: number) => never = process.exit,
): Promise<Context> {
	const argSpec = {
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
	} as const;

	const flags = arg(argSpec, { argv, permissive: true });

	if ((flags['--version'] || flags['-v']) && (flags['--help'] || flags['-h'])) {
		console.error(picocolors.red('The flags --version and --help cannot be used together.'));
		exitFn(1);
	}

	if (flags['--version'] || flags['-v']) {
		const version = await getPackageVersionFromRegistry('create-stylelint');
		console.log(version);
		exitFn(0);
	}

	if (flags['--help'] || flags['-h']) {
		showHelpAction();
		exitFn(0);
	}

	if (flags['--dry-run'] && flags['--skip-install']) {
		console.error(
			picocolors.red('The flags --dry-run and --skip-install cannot be used together.'),
		);
		exitFn(1);
	}

	if (
		flags['--dry-run'] &&
		(flags['--use-npm'] || flags['--use-pnpm'] || flags['--use-yarn'] || flags['--use-bun'])
	) {
		console.error(
			picocolors.red(
				'The flag --dry-run cannot be used with --use-npm, --use-pnpm, --use-yarn, or --use-bun.',
			),
		);
		exitFn(1);
	}

	const packageManagerFlags = ['--use-npm', '--use-pnpm', '--use-yarn', '--use-bun'] as const;
	const selectedPackageManagers = packageManagerFlags.filter((flag) => flags[flag]);
	if (selectedPackageManagers.length > 1) {
		console.error(picocolors.red('Only one package manager can be specified.'));
		exitFn(1);
	}

	let packageManager: PackageManager = 'npm';
	if (flags['--use-npm']) {
		packageManager = 'npm';
	} else if (flags['--use-pnpm']) {
		packageManager = 'pnpm';
	} else if (flags['--use-yarn']) {
		packageManager = 'yarn';
	} else if (flags['--use-bun']) {
		packageManager = 'bun';
	} else {
		try {
			const detected = await detectPackageManager(process.cwd());
			packageManager = detected?.name ?? 'npm';
		} catch (error) {
			console.warn(picocolors.yellow('Failed to detect package manager. Defaulting to npm.'));
		}
	}

	const cwdPath = process.cwd();
	const cwdURL = new URL(`${pathToFileURL(cwdPath)}/`);

	return {
		help: flags['--help'] ?? false,
		prompt: prompts,
		packageManager,
		cwd: cwdURL,
		dryRun: flags['--dry-run'],
		skipInstall: flags['--skip-install'] ?? false,
		exit: exitFn,
		'--use-npm': flags['--use-npm'],
		'--use-pnpm': flags['--use-pnpm'],
		'--use-yarn': flags['--use-yarn'],
		'--use-bun': flags['--use-bun'],
	} satisfies Context;
}
