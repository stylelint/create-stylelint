import { describe, it, expect, vi } from 'vitest';
import { showHelp } from '../../../src/actions/help';

describe('showHelp', () => {
	it('should print the help message', () => {
		const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

		showHelp();

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining('Usage: create-stylelint [options]'),
		);
		expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('Options:'));
		expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('Example:'));
		expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('$ create-stylelint --version'));
		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining('$ create-stylelint --use-yarn --dry-run'),
		);

		writeSpy.mockRestore();
	});
});
