export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const PACKAGE_MANAGER_CONFIG = {
	npm: {
		commands: {
			init: 'npm init',
			lint: 'npm run stylelint "**/*.css"',
		},
		docs: {
			initialization: 'https://docs.npmjs.com/cli/v11/commands/npm-init',
		},
	},
	yarn: {
		commands: {
			init: 'yarn init',
			lint: 'yarn stylelint "**/*.css"',
		},
		docs: {
			initialization: 'https://yarnpkg.com/cli/init',
		},
	},
	pnpm: {
		commands: {
			init: 'pnpm init',
			lint: 'pnpm stylelint "**/*.css"',
		},
		docs: {
			initialization: 'https://pnpm.io/cli/init',
		},
	},
	bun: {
		commands: {
			init: 'bun init',
			lint: 'bun run stylelint "**/*.css"',
		},
		docs: {
			initialization: 'https://bun.sh/docs/cli/init',
		},
	},
} as const;

type PackageManagerConfig = typeof PACKAGE_MANAGER_CONFIG;
type PackageManagerKey = keyof PackageManagerConfig;
type ConfigSection = keyof PackageManagerConfig[PackageManagerKey];

export function getPackageManagerValue<
	K extends ConfigSection,
	T extends keyof PackageManagerConfig[PackageManagerKey][K],
>(
	packageManager: PackageManager,
	section: K,
	key: T,
): PackageManagerConfig[PackageManagerKey][K][T] {
	const config = PACKAGE_MANAGER_CONFIG[packageManager] ?? PACKAGE_MANAGER_CONFIG.npm;
	return config[section][key];
}
