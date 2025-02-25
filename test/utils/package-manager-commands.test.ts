import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	getInitCommand,
	getInstallCommand,
	getLintCommand,
} from './../../src/utils/package-manager-commands.js';
import { resolveCommand } from 'package-manager-detector/commands';

vi.mock('package-manager-detector/commands', () => ({
	resolveCommand: vi.fn(),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe('getInitCommand', () => {
  it('should return correct init command for npm', () => {
    vi.mocked(resolveCommand).mockReturnValue({ command: 'npm', args: [] });

    const result = getInitCommand('npm');

    expect(result).toEqual({
      command: 'npm init',
      docs: 'https://docs.npmjs.com/init',
    });
  });

  it('should return correct init command for other package managers', () => {
    const packageManagers = ['pnpm', 'yarn', 'bun', 'deno'] as const;
    const docsUrls = {
      pnpm: 'https://pnpm.io/cli/init',
      yarn: 'https://yarnpkg.com/cli/init',
      bun: 'https://bun.sh/docs/cli/init',
      deno: 'https://docs.deno.com/runtime/reference/cli/init', // fixed URL
    };

    packageManagers.forEach((pm) => {
      vi.mocked(resolveCommand).mockReturnValue({ command: pm, args: [] });

      const result = getInitCommand(pm);

      expect(result).toEqual({
        command: `${pm} init`,
        docs: docsUrls[pm],
      });
    });
  });

  it('should throw error when command resolution fails', () => {
    vi.mocked(resolveCommand).mockReturnValue(null);

    expect(() => getInitCommand('npm')).toThrow('agent command not found for npm');
  });
});

describe('getLintCommand', () => {
  it('should return correct lint command with default script', () => {
    vi.mocked(resolveCommand).mockReturnValue({
      command: 'npm',
      args: ['run', 'stylelint "**/*.css"'],
    });

    const result = getLintCommand('npm');

    expect(result).toBe('npm run stylelint "**/*.css"');
  });

  it('should return correct lint command with custom script', () => {
    vi.mocked(resolveCommand).mockReturnValue({
      command: 'yarn',
      args: ['custom-lint'],
    });

    const result = getLintCommand('yarn', 'custom-lint');

    expect(result).toBe('yarn custom-lint');
  });

  it('should throw error when command resolution fails', () => {
    vi.mocked(resolveCommand).mockReturnValue(null);

    expect(() => getLintCommand('npm')).toThrow('execute command not found for npm');
  });
});

describe('getInstallCommand', () => {
  it('should return correct install command for single package', () => {
    vi.mocked(resolveCommand).mockReturnValue({
      command: 'npm',
      args: ['install', '-D', 'test-pkg'],
    });

    const result = getInstallCommand('npm', [{ packageName: 'test-pkg' }]);

    expect(result).toBe('npm install -D test-pkg');
  });

  it('should return correct install command for multiple packages', () => {
    vi.mocked(resolveCommand).mockReturnValue({
      command: 'pnpm',
      args: ['add', '-D', 'pkg1@1.0.0', 'pkg2'],
    });

    const result = getInstallCommand('pnpm', [
      { packageName: 'pkg1', requestedVersion: '1.0.0' },
      { packageName: 'pkg2' },
    ]);

    expect(result).toBe('pnpm add -D pkg1@1.0.0 pkg2');
  });

  it('should handle Deno npm: prefix correctly', () => {
    vi.mocked(resolveCommand).mockReturnValue({
      command: 'deno',
      args: ['add', '-D', 'npm:test-pkg@1.0.0'],
    });

    const result = getInstallCommand('deno', [
      { packageName: 'test-pkg', requestedVersion: '1.0.0' },
    ]);

    expect(result).toBe('deno add -D npm:test-pkg@1.0.0');
  });

  it('should throw error when no packages provided', () => {
    expect(() => getInstallCommand('npm', [])).toThrow('At least one package required');
  });

  it('should throw error when command resolution fails', () => {
    vi.mocked(resolveCommand).mockReturnValue(null);

    expect(() => getInstallCommand('npm', [{ packageName: 'test' }])).toThrow(
      'add command not found for npm'
    );
  });
});
