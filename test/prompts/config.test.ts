import type { Answers, PromptObject } from 'prompts';
import type { Context, PromptWithOverride } from '../../src/actions/context.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { log, newline } from '../../src/utils/logger.js';
import { getConfigConfirmation } from '../../src/prompts/config.js';
import prompts from 'prompts';

vi.mock('../../src/utils/logger.js', () => ({
	log: vi.fn(),
	newline: vi.fn(),
}));

type MockPrompt = PromptWithOverride & {
	mockResolvedValueOnce: (value: Answers<string>) => void;
	mockRejectedValueOnce: (error: Error) => void;
	mockImplementationOnce: (
		implementation: (
			questions: PromptObject | Array<PromptObject>,
			options?: prompts.Options,
		) => Promise<Answers<string>>,
	) => void;
};

describe('getConfigConfirmation', () => {
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

	it('should return true when user confirms', async () => {
		mockPrompt.mockResolvedValueOnce({ proceed: true });

		const result = await getConfigConfirmation(mockContext);

		expect(result).toBe(true);
		expect(mockPrompt).toHaveBeenCalledWith(
			{
				type: 'confirm',
				name: 'proceed',
				message: 'Would you like to create a Stylelint configuration file for your project?',
				initial: true,
			},
			expect.any(Object),
		);
		expect(mockContext.exit).not.toHaveBeenCalled();
	});

	it('should exit with code 1 when user declines', async () => {
		mockPrompt.mockResolvedValueOnce({ proceed: false });

		await expect(getConfigConfirmation(mockContext)).rejects.toThrow('Process exited with code 1');
		expect(newline).toHaveBeenCalledTimes(2);
		expect(log).toHaveBeenCalledWith(expect.stringContaining('CANCEL'));
		expect(log).toHaveBeenCalledWith(
			expect.stringContaining('Stylelint configuration setup cancelled'),
		);
		expect(mockContext.exit).toHaveBeenCalledWith(1);
	});

	it('should handle prompt rejection', async () => {
		mockPrompt.mockRejectedValueOnce(new Error('Prompt failed'));
		await expect(getConfigConfirmation(mockContext)).rejects.toThrow('Prompt failed');
	});

	it('should handle cancellation', async () => {
		mockPrompt.mockImplementationOnce(
			(_questions: PromptObject | Array<PromptObject>, options?: prompts.Options) => {
				options?.onCancel?.(
					// prompt
					{ name: 'proceed', type: 'confirm' },
					// answers
					{},
				);

				return Promise.resolve({ proceed: undefined });
			},
		);

		await expect(getConfigConfirmation(mockContext)).rejects.toThrow('Process exited with code 1');

		expect(newline).toHaveBeenCalledTimes(2);
		expect(log).toHaveBeenCalledWith(expect.stringContaining('CANCEL'));
		expect(log).toHaveBeenCalledWith(
			expect.stringContaining('Stylelint configuration setup cancelled'),
		);
		expect(mockContext.exit).toHaveBeenCalledWith(1);
	});
});
