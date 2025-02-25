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
  it('should return the correct package manager based on flags', () => {
    const testCases: [PackageManager | undefined, Record<string, boolean>][] = [
      ['npm', { '--use-npm': true }],
      ['pnpm', { '--use-pnpm': true }],
      ['yarn', { '--use-yarn': true }],
      ['bun', { '--use-bun': true }],
      ['deno', { '--use-deno': true }],
      [undefined, {}],
      ['npm', { '--use-npm': true, '--use-yarn': true }],
    ];

    testCases.forEach(([expected, flags]) => {
      expect(getPackageManager(flags as Record<`--use-${PackageManager}`, boolean>))
        .toBe(expected);
    });
  });
});

describe('validateNpmName', () => {
  it('should validate correct package names', () => {
    expect(validateNpmName('valid-package')).toEqual({ valid: true });
  });

  it('should invalidate empty package names', () => {
    expect(validateNpmName('')).toEqual({
      valid: false,
      problems: ['name length must be greater than zero'],
    });
  });

  it('should handle invalid package names with both errors and warnings', () => {
    const result = validateNpmName('Invalid@Package');

    expect(result).toEqual({
      valid: false,
      problems: expect.arrayContaining([
        'name can only contain URL-friendly characters',
        'name can no longer contain capital letters'
      ]),
    });
  });
});

describe('validatePackageJson', () => {
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockLog = vi.mocked(log);
  const mockGetInitCommand = vi.mocked(getInitCommand);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not exit when package.json exists', async () => {
    vi.mocked(fs.stat).mockResolvedValue({} as Stats);

    await validatePackageJson('npm');

    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should handle missing package.json with default npm', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;

    error.code = 'ENOENT';
    vi.mocked(fs.stat).mockRejectedValue(error);

    mockGetInitCommand.mockReturnValue({
      command: 'npm init',
      docs: 'https://docs.npmjs.com/init',
    });

    await validatePackageJson(null);

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Missing package.json'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should handle missing package.json with specified package manager', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;

    error.code = 'ENOENT';
    vi.mocked(fs.stat).mockRejectedValue(error);

    mockGetInitCommand.mockReturnValue({
      command: 'pnpm init',
      docs: 'https://pnpm.io/cli/init',
    });

    await validatePackageJson('pnpm');

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Missing package.json'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should throw error for non-ENOENT errors', async () => {
    const error = new Error('Different error');

    vi.mocked(fs.stat).mockRejectedValue(error);

    await expect(validatePackageJson('npm')).rejects.toThrow('Different error');
  });
});
