import * as fs from 'node:fs/promises';
import {
	PackageManager,
	getPackageManager,
	validateNpmName,
	validatePackageJson,
} from '../../src/utils/package-utils.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Stats } from 'node:fs';
import { getInitCommand } from '../../src/utils/package-manager-commands.js';
import { log } from '../../src/utils/logger.js';
import process from 'node:process';

vi.mock('node:fs/promises');
vi.mock('../../src/utils/logger.js');
vi.mock('../../src/utils/package-manager-commands.ts');

describe('getPackageManager', () => {
	it.each([
		['npm', { '--use-npm': true }],
		['pnpm', { '--use-pnpm': true }],
		['yarn', { '--use-yarn': true }],
		['bun', { '--use-bun': true }],
		['deno', { '--use-deno': true }],
		[undefined, {}],
		['npm', { '--use-npm': true, '--use-yarn': true }],
	])('should return %s for flags %o', async (expected, flags) => {
		expect(await getPackageManager(flags)).toBe(expected);
	});
});

describe('validateNpmName', () => {
	it.each([
		['valid-package', { valid: true }],
		['Invalid@Package', { valid: false, problems: expect.any(Array) }],
		['', { valid: false, problems: ['name length must be greater than zero'] }],
	])('should validate "%s" as %o', (input, expected) => {
		expect(validateNpmName(input)).toMatchObject(expected);
	});

	it('should handle both errors and warnings', () => {
		const result = validateNpmName('_invalid_name_');

		expect(result.valid).toBe(false);

		if (!result.valid) {
			expect(result.problems.length).toBeGreaterThan(0);
		}
	});
});

describe('validatePackageJson', () => {
	const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
	const mockLog = vi.mocked(log);
	const mockGetInitCommand = vi.mocked(getInitCommand);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each([['npm'], [null]])(
		'should handle package.json existence with %s package manager',
		async (packageManager) => {
			vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as Stats);
			await validatePackageJson(packageManager as PackageManager);
			expect(mockExit).not.toHaveBeenCalled();
			expect(mockGetInitCommand).toHaveBeenCalledWith(packageManager ?? 'npm');
		},
	);

	it('should handle missing package.json', async () => {
		const error = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });

		vi.mocked(fs.stat).mockRejectedValue(error);
		mockGetInitCommand.mockReturnValue({
			command: 'npm init -y',
			docs: 'https://docs.npmjs.com/cli/v10/commands/npm-init',
		});

		await validatePackageJson('npm');

		expect(mockLog).toHaveBeenCalled();
		expect(mockExit).toHaveBeenCalledWith(1);
	});
});
