import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { vol } from 'memfs';
import { createContext } from '../src/actions/context.js';
import { setupConfig } from '../src/actions/config.js';
import { installDependencies } from '../src/actions/install.js';
import { join } from 'node:path';
import { showNextSteps } from '../src/actions/post-setup.js'

vi.mock('node:fs/promises', () => ({
	default: require('memfs').fs.promises,
}));

describe('create-stylelint mainflow', () => {
	const fixturesPath = join(__dirname, '../fixtures');

	afterEach(() => {
		vol.reset();
	});

	describe('Scenario: No package.json', () => {
		const fixturePath = join(fixturesPath, 'no-package-json');

		beforeEach(() => {
			vol.fromJSON({
				[join(fixturePath, '.gitkeep')]: '',
			});
		});

		it('should exit with error if package.json is missing', async () => {
			const context = await createContext([]);
			context.currentWorkingDirectory = new URL(`file://${fixturePath}/`);

			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await expect(setupConfig(context)).rejects.toThrow();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('No package.json found in current directory'),
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Scenario: No write permissions', () => {
		const fixturePath = join(fixturesPath, 'no-write-permissions');

		beforeEach(() => {
			vol.fromJSON({
				[join(fixturePath, 'package.json')]: JSON.stringify({
					name: 'test-project',
					version: '1.0.0',
				}),
			});

			vi.mock('../../src/utils/fs/permissions.js', () => ({
				checkWritePermissions: vi.fn(() => Promise.resolve(false)),
			}));
		});

		it('should exit with error if no write permissions', async () => {
			const context = await createContext([]);
			context.currentWorkingDirectory = new URL(`file://${fixturePath}/`);

			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await expect(setupConfig(context)).rejects.toThrow();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('No write permissions in directory'),
			);

			consoleSpy.mockRestore();
		});
	});

	describe('Scenario: Stylelint config already exists', () => {
		const configFixtures = [
			{ name: 'stylelint.config.cjs', fixture: 'stylelint-config-exists-config-cjs' },
			{ name: 'stylelint.config.mjs', fixture: 'stylelint-config-exists-config-mjs' },
			{ name: '.stylelintrc', fixture: 'stylelint-config-exists-rc' },
			{ name: '.stylelintrc.cjs', fixture: 'stylelint-config-exists-rc-cjs' },
			{ name: '.stylelintrc.json', fixture: 'stylelint-config-exists-rc-json' },
			{ name: '.stylelintrc.yaml', fixture: 'stylelint-config-exists-rc-yaml' },
			{ name: '.stylelintrc.yml', fixture: 'stylelint-config-exists-rc-yml' },
			{ name: 'subdir/.stylelintrc.json', fixture: 'stylelint-config-exists-subdir-rc-json' },
		];

		it.each(configFixtures)(
			'should exit with error if $name already exists',
			async ({ fixture }) => {
				const fixturePath = join(fixturesPath, fixture);

				vol.fromJSON({
					[join(fixturePath, 'package.json')]: JSON.stringify({
						name: 'test-project',
						version: '1.0.0',
					}),
					[join(
						fixturePath,
						fixture.includes('subdir') ? '.config/stylelintrc.json' : fixture.split('-').pop(),
					)]: fixture.includes('json') ? '{}' : '',
				});

				const context = await createContext([]);
				context.currentWorkingDirectory = new URL(`file://${fixturePath}/`);

				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				await expect(setupConfig(context)).rejects.toThrow();

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining('A Stylelint configuration already exists'),
				);

				consoleSpy.mockRestore();
			},
		);
	});

	describe('Scenario: Valid environment', () => {
		const fixturePath = join(fixturesPath, 'valid-env');

		beforeEach(() => {
			vol.fromJSON({
				[join(fixturePath, 'package.json')]: JSON.stringify({
					name: 'test-project',
					version: '1.0.0',
				}),
			});

			vi.mock('../../src/utils/fs/permissions.js', () => ({
				checkWritePermissions: vi.fn(() => Promise.resolve(true)),
			}));

			vi.mock('../../src/utils/output/shell.js', () => ({
				shell: vi.fn(() => Promise.resolve({ stdout: '', stderr: '', exitCode: 0 })),
			}));
		});

		it('should successfully create config and install dependencies', async () => {
			const context = await createContext([]);
			context.currentWorkingDirectory = new URL(`file://${fixturePath}/`);

			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await setupConfig(context);
			await installDependencies(context);
			await showNextSteps(context);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Creating Stylelint configuration file...'),
			);
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Successfully installed dependencies'),
			);

			consoleSpy.mockRestore();
		});
	});
});
