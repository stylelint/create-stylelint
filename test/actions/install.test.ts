import { Context, PromptWithOverride } from '../../src/actions/context.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { log, logAction, newline } from '../../src/utils/logger.js'
import { Answers } from 'prompts'
import type { Ora } from 'ora'
import { createBox } from '../../src/utils/terminal-box.js'
import { dim } from 'picocolors'
import { getInstallCommand } from '../../src/utils/package-manager-commands.js'
import { getInstallConfirmation } from '../../src/prompts/install.js'
import { installDependencies } from '../../src/actions/install.js'
import ora from 'ora'
import { resolvePackageVersion } from '../../src/utils/registry.js'
import { x } from 'tinyexec'

vi.mock('picocolors', () => ({
  bgMagenta: vi.fn((str) => str),
  dim: vi.fn((str) => str),
  magenta: vi.fn((str) => str),
  white: vi.fn((str) => str),
}))

vi.mock('../../src/utils/logger.js', () => ({
  log: vi.fn(),
  logAction: vi.fn(),
  newline: vi.fn(),
}))

vi.mock('../../src/utils/terminal-box.js', () => ({
  createBox: vi.fn((lines) => lines.join('\n')),
}))

vi.mock('../../src/utils/package-manager-commands.js', () => ({
  getInstallCommand: vi.fn(),
}))

vi.mock('../../src/prompts/install.js', () => ({
  getInstallConfirmation: vi.fn(),
}))

vi.mock('../../src/utils/registry.js', () => ({
  resolvePackageVersion: vi.fn(),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    fail: vi.fn(),
  })),
}))

vi.mock('tinyexec', () => ({
  x: vi.fn(),
}))

vi.mock('node:process', () => ({
  default: {
    cwd: vi.fn(() => '/mock/cwd'),
  },
}))

interface MockPrompt extends PromptWithOverride {
  mockResolvedValueOnce: (value: Answers<string>) => void
  mockRejectedValueOnce: (error: Error) => void
}

describe('installDependencies', () => {
  const mockPrompt = vi.fn() as unknown as MockPrompt

  const mockSpinner: Partial<Ora> = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    fail: vi.fn(),
  };

  mockPrompt.override = vi.fn()

  const mockContext: Context = {
    isDryRun: false,
    help: false,
    prompt: mockPrompt,
    cwd: new URL('file:///test/'),
    packageManager: 'npm',
    shouldSkipInstall: false,
    exit: vi.fn((code: number): never => {
      throw new Error(`Process exited with code ${code}`)
    }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolvePackageVersion).mockResolvedValue('1.0.0')
    vi.mocked(getInstallCommand).mockReturnValue('npm install --save-dev package@1.0.0')
    vi.mocked(getInstallConfirmation).mockResolvedValue(true)
    vi.mocked(x).mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 })
    vi.mocked(ora).mockReturnValue(mockSpinner as Ora);
  })


  it('should skip installation when shouldSkipInstall is true', async () => {
    const context = { ...mockContext, shouldSkipInstall: true }

    await installDependencies(context)

    expect(logAction).toHaveBeenCalledWith('--skip-install', 'Dependency installation skipped')
    expect(x).not.toHaveBeenCalled()
  })

  it('should display installation preview and execute command', async () => {
    await installDependencies(mockContext)

    expect(newline).toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Stylelint will run the following command'))
    expect(createBox).toHaveBeenCalledWith(['npm install --save-dev package@1.0.0'])
    expect(x).toHaveBeenCalled()
  })

  it('should skip installation in dry run mode', async () => {
    const context = { ...mockContext, isDryRun: true }

    await installDependencies(context)

    expect(logAction).toHaveBeenCalledWith('--dry-run', 'Skipping dependency installation')
    expect(x).not.toHaveBeenCalled()
  })

  it('should handle installation failure', async () => {
    const error = new Error('Installation failed');

    vi.mocked(x).mockRejectedValue(error);

    await expect(installDependencies(mockContext)).rejects.toThrow('Process exited with code 1');

    expect(ora().fail).toHaveBeenCalledWith('Failed to install dependencies: Installation failed');
    expect(log).toHaveBeenCalledWith(dim('Please check your network connection and try again.\n'));
    expect(mockContext.exit).toHaveBeenCalledWith(1);
  });

  it('should not proceed with installation if user declines confirmation', async () => {
    vi.mocked(getInstallConfirmation).mockResolvedValue(false)

    await installDependencies(mockContext)

    expect(x).not.toHaveBeenCalled()
  })

  it('should resolve package versions for all required packages', async () => {
    await installDependencies(mockContext)

    expect(resolvePackageVersion).toHaveBeenCalledWith('stylelint')
    expect(resolvePackageVersion).toHaveBeenCalledWith('stylelint-config-standard')
  })

  it('should show success message after successful installation', async () => {
    await installDependencies(mockContext)

    expect(mockSpinner.succeed).toHaveBeenCalledWith('Successfully installed dependencies')
  })
})
