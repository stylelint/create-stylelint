import { describe, it, expect, vi } from 'vitest';
import { showHelpAction } from '../src/actions/help';

vi.mock('picocolors', () => ({
	default: {
		bold: (text: string) => `\x1B[1m${text}\x1B[22m`,
	},
}));

describe('showHelpAction', () => {
	it('should log help information with correct formatting', () => {
		const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		showHelpAction();

		expect(consoleLogSpy).toHaveBeenCalledTimes(1);
		const output = consoleLogSpy.mock.calls[0][0];

		const expectedOutput = `
\x1B[1mUsage: create-stylelint [options]\x1B[22m

\x1B[1mOptions:\x1B[22m
  -h, --help           Show help information
  --dry-run            Run the command without making any changes
  --use-npm            Explicitly use npm for installation
  --use-pnpm           Explicitly use pnpm for installation
  --use-yarn           Explicitly use Yarn for installation
  --use-bun            Explicitly use Bun for installation
  --skip-install       Skip installing packages
  -v, --version        Output the version number
`;

		expect(output).toBe(expectedOutput);

		consoleLogSpy.mockRestore();
	});
});
