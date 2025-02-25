import { type PackageManager, getPackageManager } from '../../src/utils/package-utils.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContext } from './../../src/actions/context.js';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

vi.mock('../../src/utils/package-utils.js', () => ({
	getPackageManager: vi.fn(),
}));

vi.mock('node:process', () => ({
	default: {
		exit: vi.fn((code: number) => {
      throw new Error(`Process exited with code ${code}`);
    }),
    cwd: vi.fn(() => '/fake/path'),
	},
}));

describe('createContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPackageManager).mockClear();
  });

  it('should create default context with correct structure', async () => {
    const context = await createContext([]);

    expect(context).toMatchObject({
      help: false,
      version: false,
      isDryRun: false,
      shouldSkipInstall: false,
      packageManager: undefined,
      cwd: expect.any(URL),
      exit: expect.any(Function),
    });
    expect(context.cwd.toString()).toBe(`${pathToFileURL('/fake/path')}/`);
  });

  it.each([
    ['--help', 'help'],
    ['-h', 'help'],
    ['--version', 'version'],
    ['-v', 'version'],
    ['--dry-run', 'isDryRun'],
    ['--no-install', 'shouldSkipInstall'],
  ])('should handle flag %s correctly', async (flag, prop) => {
    const context = await createContext([flag]);

    expect(context).toHaveProperty(prop, true);
  });

  it.each([
    ['--use-npm', 'npm'],
    ['--use-yarn', 'yarn'],
    ['--use-pnpm', 'pnpm'],
    ['--use-bun', 'bun'],
    ['--use-deno', 'deno'],
  ])('should detect %s package manager', async (flag, expectedPm) => {
    vi.mocked(getPackageManager).mockReturnValue(expectedPm as PackageManager);

    const context = await createContext([flag]);

    expect(getPackageManager).toHaveBeenCalledWith(
      expect.objectContaining({ [flag]: true })
    );
    expect(context.packageManager).toBe(expectedPm);
  });

  it('should prioritize first package manager when multiple specified', async () => {
    await createContext(['--use-npm', '--use-yarn']);

    expect(getPackageManager).toHaveBeenCalledWith({
      '--use-npm': true,
      '--use-yarn': true,
      '--use-pnpm': false,
      '--use-bun': false,
      '--use-deno': false,
    });
  });

  it('should handle exit function properly', async () => {
    const context = await createContext([]);
    const exitCode = 1;

    expect(() => context.exit(exitCode)).toThrow('Process exited with code 1');
    expect(process.exit).toHaveBeenCalledWith(exitCode);
  });

  it('should ignore unknown flags in permissive mode', async () => {
    const context = await createContext(['--unknown', '--flags']);

    expect(context).toMatchObject({
      help: false,
      version: false,
    });
  });
});
