import pc from 'picocolors';
import { log } from './format.js';

interface Flags {
	'--version'?: boolean;
	'-v'?: boolean;
	'--help'?: boolean;
	'-h'?: boolean;
	'--dry-run'?: boolean;
	'--skip-install'?: boolean;
	'--use-npm'?: boolean;
	'--use-pnpm'?: boolean;
	'--use-yarn'?: boolean;
	'--use-bun'?: boolean;
	exit: (code: number) => never;
}

export function validateFlags(flags: Flags): void {
	if ((flags['--version'] || flags['-v']) && (flags['--help'] || flags['-h'])) {
		log(pc.red('The flags --version and --help cannot be used together.\n'));
		flags.exit(1);
	}

	if (flags['--dry-run'] && flags['--skip-install']) {
		log(pc.red('The flags --dry-run and --skip-install cannot be used together.\n'));
		flags.exit(1);
	}

	const packageManagerFlags = ['--use-npm', '--use-pnpm', '--use-yarn', '--use-bun'] as const;
	const selectedPackageManagers = packageManagerFlags.filter((flag) => flags[flag]);
	if (selectedPackageManagers.length > 1) {
		log(pc.red('Only one package manager can be specified.\n'));
		flags.exit(1);
	}
}
