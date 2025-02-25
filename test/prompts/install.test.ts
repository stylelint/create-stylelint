import { beforeEach, describe, expect, it, vi } from 'vitest';
import { log, newline } from '../../src/utils/logger.js';
import type { Context } from '../../src/actions/context.js';
import { MockPrompt } from '../helpers.js';
import { getInstallConfirmation } from '../../src/prompts/install.js';

vi.mock('../../src/utils/logger.js', () => ({
	log: vi.fn(),
	newline: vi.fn(),
}));

describe('getInstallConfirmation', () => {
	const mockPrompt = vi.fn() as unknown as MockPrompt;

	mockPrompt.override = vi.fn();

	const mockContext: Context = {
		isDryRun: false,
		help: false,
		prompt: mockPrompt,
		cwd: new URL('file:///test/'),
		packageManager: 'npm',
		shouldSkipInstall: false,
		exit: vi.fn((code: number) => {
			throw new Error(`Process exited with code ${code}`);
		}),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true when user confirms installation', async () => {
		mockPrompt.mockResolvedValueOnce({ proceed: true });

		const result = await getInstallConfirmation(mockContext);

		expect(result).toBe(true);
		expect(mockPrompt).toHaveBeenCalledWith({
			type: 'confirm',
			name: 'proceed',
			message: 'Install Stylelint dependencies?',
			initial: true,
		});
		expect(log).not.toHaveBeenCalled();
		expect(newline).not.toHaveBeenCalled();
	});

	it('should return false and show skip message when user declines', async () => {
		mockPrompt.mockResolvedValueOnce({ proceed: false });

		const result = await getInstallConfirmation(mockContext);

		expect(result).toBe(false);
		expect(newline).toHaveBeenCalledTimes(2);
		expect(log).toHaveBeenCalledWith(expect.stringContaining('CANCEL'));
		expect(log).toHaveBeenCalledWith(
			expect.stringContaining(
				'Skipping dependency installation for now. You can always run the install command again later.',
			),
		);
	});

	it('should handle prompt rejection', async () => {
		mockPrompt.mockRejectedValueOnce(new Error('Prompt failed'));
		await expect(getInstallConfirmation(mockContext)).rejects.toThrow('Prompt failed');
	});
});
