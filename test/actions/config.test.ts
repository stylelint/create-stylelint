import * as fs from 'node:fs/promises'
import { Context, PromptWithOverride } from "../../src/actions/context.js"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { log, logAction, newline } from '../../src/utils/logger.js'
import { Answers } from "prompts"
import type { CosmiconfigResult } from "cosmiconfig"
import { cosmiconfig } from "cosmiconfig"
import { getConfigConfirmation } from "../../src/prompts/config.js"
import ora from "ora"
import path from "node:path"
import process from 'node:process'
import { setupStylelintConfig } from "../../src/actions/config.js"

vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('node:path', () => ({
  default: {
    join: vi.fn((...args: string[]) => args.join('/')),
  },
  join: vi.fn((...args: string[]) => args.join('/')),
}))

vi.mock('node:process', () => ({
  default: {
    cwd: vi.fn(() => '/mock/cwd'),
  },
}))

interface CosmiconfigExplorer {
  search: () => Promise<CosmiconfigResult | null>
  load: (filepath: string) => Promise<CosmiconfigResult | null>
  clearLoadCache: () => void
  clearSearchCache: () => void
  clearCaches: () => void
}

vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(() => ({
    search: vi.fn().mockResolvedValue(null),
    load: vi.fn(),
    clearLoadCache: vi.fn(),
    clearSearchCache: vi.fn(),
    clearCaches: vi.fn(),
  })),
}))

vi.mock('../../src/utils/logger.js', () => ({
  log: vi.fn(),
  newline: vi.fn(),
  logAction: vi.fn(),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
  })),
}))

vi.mock('../../src/prompts/config.js', () => ({
  getConfigConfirmation: vi.fn(),
}))

interface MockPrompt extends PromptWithOverride {
  mockResolvedValueOnce: (value: Answers<string>) => void
  mockRejectedValueOnce: (error: Error) => void
}

describe('setupStylelintConfig', () => {
  const mockPrompt = vi.fn() as unknown as MockPrompt

  mockPrompt.override = vi.fn()

  const mockContext: Context = {
    isDryRun: false,
    help: false,
    prompt: mockPrompt,
    cwd: new URL('file:///test/'),
    packageManager: undefined,
    shouldSkipInstall: false,
    exit: vi.fn((code: number): never => {
      throw new Error(`Process exited with code ${code}`)
    }),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    vi.mocked(cosmiconfig).mockReturnValue({
      search: vi.fn().mockResolvedValue(null),
      load: vi.fn(),
      clearLoadCache: vi.fn(),
      clearSearchCache: vi.fn(),
      clearCaches: vi.fn(),
    } as CosmiconfigExplorer)

    vi.mocked(process.cwd).mockReturnValue('/mock/cwd')
    vi.mocked(path.join).mockImplementation((...args: string[]) => args.join('/'))
  })

  it('should create config file when no existing config is found', async () => {
    vi.mocked(getConfigConfirmation).mockResolvedValue(true)

    await setupStylelintConfig(mockContext)

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('stylelint.config.mjs'),
      expect.stringContaining('stylelint-config-standard'),
      'utf-8'
    )
    expect(ora).toHaveBeenCalled()
  })

  it('should exit when existing config is found', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined)

    await expect(setupStylelintConfig(mockContext)).rejects.toThrow('Process exited with code 1')
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Configuration file already exists'))
  })

  it('should handle dry run mode', async () => {
    const dryRunContext = { ...mockContext, isDryRun: true }

    vi.mocked(getConfigConfirmation).mockResolvedValue(true)

    await setupStylelintConfig(dryRunContext)

    expect(logAction).toHaveBeenCalledWith('--dry-run', 'Skipping configuration file creation')
    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it('should find existing config using cosmiconfig', async () => {
    vi.mocked(cosmiconfig).mockReturnValue({
      search: vi.fn().mockResolvedValue({
        filepath: '/path/to/existing/config'
      }),
      load: vi.fn(),
      clearLoadCache: vi.fn(),
      clearSearchCache: vi.fn(),
      clearCaches: vi.fn(),
    } as CosmiconfigExplorer)

    await expect(setupStylelintConfig(mockContext)).rejects.toThrow('Process exited with code 1')
    expect(log).toHaveBeenCalledWith(expect.stringContaining('/path/to/existing/config'))
  })

  it('should not create config if user declines confirmation', async () => {
    vi.mocked(getConfigConfirmation).mockResolvedValue(false)

    await setupStylelintConfig(mockContext)

    expect(fs.writeFile).not.toHaveBeenCalled()
  })

  it('should display config preview', async () => {
    vi.mocked(getConfigConfirmation).mockResolvedValue(true)

    await setupStylelintConfig(mockContext)

    expect(newline).toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Creating Stylelint configuration file'))
  })
})
