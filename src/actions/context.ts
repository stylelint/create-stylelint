import { pathToFileURL } from 'node:url';
import arg from 'arg';
import detectPackageManager from 'preferred-pm';
import prompts from 'prompts';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface Context {
	help: boolean;
	prompt: typeof prompts;
	dryRun?: boolean;
	cwd: URL;
	packageManager: PackageManager;
	exit: (code: number) => never;
}

export async function getContext(argv: string[]): Promise<Context> {
	const flags = arg(
		{
			'--dry-run': Boolean,
			'--help': Boolean,
			'-h': '--help',
		},
		{ argv, permissive: true },
	);

	const packageManager = (await detectPackageManager(process.cwd()))?.name ?? 'npm';

	const { '--help': help = false, '--dry-run': dryRun } = flags;

	const cwdPath = process.cwd();

	const cwdURL = new URL(`${pathToFileURL(cwdPath)}/`);

	return {
		help,
		prompt: prompts,
		packageManager,
		cwd: cwdURL,
		dryRun,
		exit(code: number): never {
			process.exit(code);
		},
	} satisfies Context;
}
