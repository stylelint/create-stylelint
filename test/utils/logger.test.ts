import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { error, log, logAction, newline } from '../../src/utils/logger.js';
import process from 'node:process';

describe('logger', () => {
	const mockStdout = {
		write: vi.fn(),
	};
	const mockStderr = {
		write: vi.fn(),
	};

	beforeEach(() => {
		vi.spyOn(process.stdout, 'write').mockImplementation(mockStdout.write);
		vi.spyOn(process.stderr, 'write').mockImplementation(mockStderr.write);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('log', () => {
		it('should write message to stdout with newline', () => {
			const message = 'test message';

			log(message);

			expect(mockStdout.write).toHaveBeenCalledTimes(1);
			expect(mockStdout.write).toHaveBeenCalledWith('test message\n');
		});
	});

	describe('error', () => {
		it('should write string message to stderr with error prefix', () => {
			const message = 'error message';

			error(message);

			expect(mockStderr.write).toHaveBeenCalledTimes(1);
			expect(mockStderr.write).toHaveBeenCalledWith('error: error message\n');
		});

		it('should write Error stack to stderr if available', () => {
			const testError = new Error('test error');

			error(testError);

			expect(mockStderr.write).toHaveBeenCalledTimes(1);
			expect(mockStderr.write).toHaveBeenCalledWith(`error: ${testError.stack}\n`);
		});

		it('should write Error message if stack is not available', () => {
			const testError = new Error('test error');

			testError.stack = undefined;
			error(testError);

			expect(mockStderr.write).toHaveBeenCalledTimes(1);
			expect(mockStderr.write).toHaveBeenCalledWith('error: test error\n');
		});
	});

	describe('newline', () => {
		it('should write single newline character to stdout', () => {
			newline();

			expect(mockStdout.write).toHaveBeenCalledTimes(1);
			expect(mockStdout.write).toHaveBeenCalledWith('\n');
		});
	});

	describe('logAction', () => {
		it('should write formatted action message with green color', () => {
			const flag = 'TEST';
			const message = 'action message';

			logAction(flag, message);

			expect(mockStdout.write).toHaveBeenCalledTimes(1);
			expect(mockStdout.write).toHaveBeenCalledWith(expect.stringContaining('◼'));
			expect(mockStdout.write).toHaveBeenCalledWith(expect.stringContaining('TEST'));
			expect(mockStdout.write).toHaveBeenCalledWith(expect.stringContaining('action message'));
		});
	});
});
