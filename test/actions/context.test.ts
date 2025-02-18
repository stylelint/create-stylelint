import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext } from './../../src/actions/context.js';
import { getPackageManager } from '../../src/utils/package-utils.js';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import prompts from 'prompts';

vi.mock('../../src/utils/package-utils.js', () => ({
	getPackageManager: vi.fn(),
}));

vi.mock('node:process', () => ({
	default: {
		exit: vi.fn(),
		cwd: vi.fn(),
	},
}));

describe('createContext', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(process.cwd).mockReturnValue('/fake/path');
		vi.mocked(getPackageManager).mockResolvedValue(undefined);
	});

	it('should create default context with no arguments', async () => {
		const context = await createContext([]);

		expect(context).toEqual({
			help: false,
			version: false,
			prompt: prompts,
			isDryRun: false,
			shouldSkipInstall: false,
			cwd: new URL(`${pathToFileURL('/fake/path')}/`),
			packageManager: undefined,
			exit: expect.any(Function),
		});
	});

	it('should handle help flags', async () => {
		const longFlag = await createContext(['--help']);
		const shortFlag = await createContext(['-h']);

		expect(longFlag.help).toBe(true);
		expect(shortFlag.help).toBe(true);
	});

	it('should handle version flags', async () => {
		const longFlag = await createContext(['--version']);
		const shortFlag = await createContext(['-v']);

		expect(longFlag.version).toBe(true);
		expect(shortFlag.version).toBe(true);
	});

	it('should handle package manager flags', async () => {
		vi.mocked(getPackageManager).mockResolvedValue('npm');

		const context = await createContext(['--use-npm']);

		expect(context.packageManager).toBe('npm');
		expect(getPackageManager).toHaveBeenCalledWith({
			'--use-npm': true,
			'--use-yarn': undefined,
			'--use-pnpm': undefined,
			'--use-bun': undefined,
			'--use-deno': undefined,
		});
	});

	it('should handle multiple package manager flags', async () => {
		await createContext(['--use-npm', '--use-yarn']);

		expect(getPackageManager).toHaveBeenCalledWith({
			'--use-npm': true,
			'--use-yarn': true,
			'--use-pnpm': undefined,
			'--use-bun': undefined,
			'--use-deno': undefined,
		});
	});

	it('should handle dry run flag', async () => {
		const context = await createContext(['--dry-run']);

		expect(context.isDryRun).toBe(true);
	});

	it('should handle no-install flag', async () => {
		const context = await createContext(['--no-install']);

		expect(context.shouldSkipInstall).toBe(true);
	});

	it('should handle no-color flag', async () => {
		const context = await createContext(['--no-color']);

		expect(context).toBeDefined();
	});

	it('should handle exit function', async () => {
		const context = await createContext([]);
		const exitCode = 1;

		context.exit(exitCode);

		expect(process.exit).toHaveBeenCalledWith(exitCode);
	});

	it('should handle permissive unknown flags', async () => {
		const context = await createContext(['--unknown-flag']);

		expect(context).toBeDefined();
		expect(context.help).toBe(false);
	});

	it('should maintain correct cwd URL format', async () => {
		const context = await createContext([]);

		expect(context.cwd).toBeInstanceOf(URL);
		expect(context.cwd.toString()).toMatch(/\/$/);
		expect(context.cwd.toString()).toContain('/fake/path');
	});
});
