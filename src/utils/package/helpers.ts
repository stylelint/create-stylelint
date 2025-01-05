export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface PackageManagerCommands {
	init: {
		command: string;
		docs: string;
	};
	lint: string;
	install: (packages: { name: string; version: string }[]) => string;
}

const generateInstallCommand =
	(manager: string) => (packages: { name: string; version: string }[]) =>
		`${manager} add ${packages
			.map((pkg) => `${pkg.name}@^${pkg.version}`)
			.join(' ')}`;

const generateLintCommand = (manager: string) => `${manager} run stylelint "**/*.css"`;

const PACKAGE_MANAGER_COMMANDS: Record<PackageManager, PackageManagerCommands> = {
	npm: {
		init: {
			command: 'npm init',
			docs: 'https://docs.npmjs.com/cli/v11/commands/npm-init',
		},
		lint: generateLintCommand('npm'),
		install: generateInstallCommand('npm'),
	},
	yarn: {
		init: {
			command: 'yarn init',
			docs: 'https://yarnpkg.com/cli/init',
		},
		lint: generateLintCommand('yarn'),
		install: generateInstallCommand('yarn'),
	},
	pnpm: {
		init: {
			command: 'pnpm init',
			docs: 'https://pnpm.io/cli/init',
		},
		lint: generateLintCommand('pnpm'),
		install: generateInstallCommand('pnpm'),
	},
	bun: {
		init: {
			command: 'bun init',
			docs: 'https://bun.sh/docs/cli/init',
		},
		lint: generateLintCommand('bun'),
		install: generateInstallCommand('bun'),
	},
};

export function getCommand(
	packageManager: PackageManager,
	command: keyof PackageManagerCommands,
	packages?: { name: string; version: string }[],
): string | { command: string; docs: string } {
	const commands = PACKAGE_MANAGER_COMMANDS[packageManager] ?? PACKAGE_MANAGER_COMMANDS.npm;

	if (command === 'install') {
		if (!packages) {
			throw new Error('Packages array is required for install command');
		}
		return commands.install(packages);
	}

	if (command === 'init') {
		return commands.init;
	}

	return commands[command];
}

export const getInstallCommand = (
	packageManager: PackageManager,
	packages: { name: string; version: string }[],
): string => getCommand(packageManager, 'install', packages) as string;

export const getLintCommand = (packageManager: PackageManager): string =>
	getCommand(packageManager, 'lint') as string;
