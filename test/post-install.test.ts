import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showNextSteps } from '../src/actions/post-install';
import { type PackageManager } from '../src/utils/helpers';

vi.mock('picocolors', () => ({
	default: {
		green: (text: string) => text,
		dim: (text: string) => text,
	},
}));

describe('showNextSteps', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	it.each([
		['npm', 'npm run stylelint "**/*.css"'],
		['yarn', 'yarn stylelint "**/*.css"'],
		['pnpm', 'pnpm stylelint "**/*.css"'],
		['bun', 'bun run stylelint "**/*.css"'],
	])('should show correct next steps for %s', async (packageManager, expectedCommand) => {
		await showNextSteps(packageManager as PackageManager);

		expect(consoleLogSpy).toHaveBeenCalledTimes(1);

		const output = consoleLogSpy.mock.calls[0][0];

		expect(output).toContain('You can now lint your CSS files by running the command:');
		expect(output).toContain(expectedCommand);

		expect(output).toContain(
			'Please refer to the official Stylelint documentation for more customization options:',
		);
		expect(output).toContain('https://stylelint.io/user-guide/configure/');
	});

	it('should fallback to npm when invalid package manager provided', async () => {
		// @ts-expect-error: Testing invalid input
		await showNextSteps('invalid');

		expect(consoleLogSpy).toHaveBeenCalledTimes(1);
		const output = consoleLogSpy.mock.calls[0][0];
		expect(output).toContain('npm run stylelint "**/*.css"');
	});

	it('should return a promise', () => {
		const result = showNextSteps('npm');
		expect(result).toBeInstanceOf(Promise);
	});
});
