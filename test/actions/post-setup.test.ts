import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { log, newline } from '../../src/utils/logger.js';
import type { Context } from '../../src/actions/context.js';
import { PackageManager } from '../../src/utils/package-utils.js';
import { getLintCommand } from '../../src/utils/package-manager-commands.js';
import { showNextSteps } from '../../src/actions/post-setup.js';
import { stripVTControlCharacters } from 'node:util';

vi.mock('picocolors', () => ({
  bgGreen: (str: string) => `\x1b[42m${str}\x1b[49m`,
  gray: (str: string) => `\x1b[90m${str}\x1b[39m`,
  green: (str: string) => `\x1b[32m${str}\x1b[39m`,
  white: (str: string) => `\x1b[37m${str}\x1b[39m`,
}));

vi.mock('../../src/utils/logger.js', () => ({
  log: vi.fn(),
  newline: vi.fn(),
}));

vi.mock('../../src/utils/package-manager-commands.js', () => ({
  getLintCommand: vi.fn().mockReturnValue('pnpm dlx stylelint "**/*.css"'),
}));

describe('showNextSteps', () => {
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = { packageManager: 'npm' } as Context;
  });

  function getCleanedOutput() {
    return (log as Mock).mock.calls
      .map(([msg]) => stripVTControlCharacters(msg))
      .join('\n');
  }

  it('should print correct next steps with formatting', async () => {
    await showNextSteps(mockContext);

    expect(getCleanedOutput()).toMatchInlineSnapshot(`
      "   SUCCESS      Project setup complete!
                      Run the following command to start linting:
                      pnpm dlx stylelint "**/*.css"
        Need to customize?:
        https://stylelint.io/user-guide/configure/"
    `);

    expect(newline).toHaveBeenCalledTimes(2);
  });

  it.each(['npm', 'pnpm', 'yarn', 'bun'])(
    'should handle %s package manager',
    async (pm) => {
      mockContext.packageManager = pm as PackageManager;
      const lintCmd = `${pm} run lint`;

      vi.mocked(getLintCommand).mockReturnValue(lintCmd);

      await showNextSteps(mockContext);

      expect(getCleanedOutput()).toContain(lintCmd);
      expect(getLintCommand).toHaveBeenCalledWith(pm);
    }
  );
});
