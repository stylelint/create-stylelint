import { describe, it, expect } from 'vitest';
import { getPackageManagerValue, type PackageManager } from '../src/utils/helpers';

describe('getPackageManagerValue', () => {
	const packageManagers: PackageManager[] = ['npm', 'yarn', 'pnpm', 'bun'];

	describe('initialization commands', () => {
		it.each(packageManagers)('should return correct init command for %s', (manager) => {
			const initCommand = getPackageManagerValue(manager, 'commands', 'init');
			expect(initCommand).toBe(`${manager} init`);
		});
	});

	describe('lint commands', () => {
		const expectedLintCommands = {
			npm: 'npm run stylelint "**/*.css"',
			yarn: 'yarn stylelint "**/*.css"',
			pnpm: 'pnpm stylelint "**/*.css"',
			bun: 'bun run stylelint "**/*.css"',
		};

		it.each(packageManagers)('should return correct lint command for %s', (manager) => {
			const lintCommand = getPackageManagerValue(manager, 'commands', 'lint');
			expect(lintCommand).toBe(expectedLintCommands[manager]);
		});
	});

	describe('documentation URLs', () => {
		const expectedDocs = {
			npm: 'https://docs.npmjs.com/cli/v11/commands/npm-init',
			yarn: 'https://yarnpkg.com/cli/init',
			pnpm: 'https://pnpm.io/cli/init',
			bun: 'https://bun.sh/docs/cli/init',
		};

		it.each(packageManagers)('should return correct documentation URL for %s', (manager) => {
			const docUrl = getPackageManagerValue(manager, 'docs', 'initialization');
			expect(docUrl).toBe(expectedDocs[manager]);
		});
	});

	describe('fallback behavior', () => {
		it('should fallback to npm configuration for invalid package manager', () => {
			// @ts-expect-error Testing invalid package manager
			const initCommand = getPackageManagerValue('invalid', 'commands', 'init');
			expect(initCommand).toBe('npm init');
		});
	});
});
