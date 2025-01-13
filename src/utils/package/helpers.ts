export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type CommandType = 'init' | 'lint' | 'install';

export type Package = { name: string; version: string };

interface CommandConfig {
    init: { command: string; docs: string };
    lint: string;
    install: (packages: Package[]) => string;
}

const PACKAGE_MANAGER_COMMANDS: Record<PackageManager, CommandConfig> = {
	npm: {
		init: { command: 'npm init', docs: 'https://docs.npmjs.com/cli/v11/commands/npm-init' },
		lint: 'npm run stylelint "**/*.css"',
		install: (packages) => `npm add -D ${packages.map((p) => `${p.name}@${p.version}`).join(' ')}`,
	},
	yarn: {
		init: { command: 'yarn init', docs: 'https://yarnpkg.com/cli/init' },
		lint: 'yarn run stylelint "**/*.css"',
		install: (packages) => `yarn add -D ${packages.map((p) => `${p.name}@${p.version}`).join(' ')}`,
	},
	pnpm: {
		init: { command: 'pnpm init', docs: 'https://pnpm.io/cli/init' },
		lint: 'pnpm run stylelint "**/*.css"',
		install: (packages) => `pnpm add -D ${packages.map((p) => `${p.name}@${p.version}`).join(' ')}`,
	},
	bun: {
		init: { command: 'bun init', docs: 'https://bun.sh/docs/cli/init' },
		lint: 'bun run stylelint "**/*.css"',
		install: (packages) => `bun add -D ${packages.map((p) => `${p.name}@${p.version}`).join(' ')}`,
	},
};

export function getInitCommand(packageManager: PackageManager = 'npm'): { command: string; docs: string } {
	return PACKAGE_MANAGER_COMMANDS[packageManager].init;
}

export function getLintCommand(packageManager: PackageManager = 'npm'): string {
	return PACKAGE_MANAGER_COMMANDS[packageManager].lint;
}

export function getInstallCommand(packageManager: PackageManager = 'npm', packages: Package[]): string {
	if (!packages.length) {
					throw new Error('Packages array is required for install command and must not be empty');
	}
	return PACKAGE_MANAGER_COMMANDS[packageManager].install(packages);
}
