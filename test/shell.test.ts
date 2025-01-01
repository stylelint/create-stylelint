import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { shell } from '../src/shell'

vi.mock('node:child_process', () => ({
	spawn: vi.fn(),
}));

function createMockStream(data: string): Readable {
	return new Readable({
		read() {
			this.push(data);
			this.push(null);
		},
	});
}

describe('shell', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('should execute command successfully', async () => {
		const mockStdout = createMockStream('success output');
		const mockStderr = createMockStream('');

		const mockChild = {
			stdout: mockStdout,
			stderr: mockStderr,
			exitCode: 0,
			on: vi.fn((event, cb) => {
				if (event === 'close') {
					setTimeout(cb, 0);
				}
				return mockChild;
			}),
		};

		vi.mocked(spawn).mockReturnValue(mockChild as any);

		const result = await shell('npm', ['install'], { cwd: '/test' });

		expect(result).toEqual({
			stdout: 'success output',
			stderr: '',
			exitCode: 0,
		});
		expect(spawn).toHaveBeenCalledWith('npm', ['install'], {
			cwd: '/test',
			shell: true,
			stdio: undefined,
			timeout: undefined,
		});
	});

	it('should handle command errors', async () => {
		const mockStdout = createMockStream('');
		const mockStderr = createMockStream('error message');

		const mockChild = {
			stdout: mockStdout,
			stderr: mockStderr,
			exitCode: 1,
			on: vi.fn((event, cb) => {
				if (event === 'close') {
					setTimeout(cb, 0);
				}
				return mockChild;
			}),
		};

		vi.mocked(spawn).mockReturnValue(mockChild as any);

		await expect(shell('npm', ['invalid'], {})).rejects.toThrow('Command failed with exit code 1');
	});

	it('should handle timeout', async () => {
		const mockChild = {
			stdout: createMockStream(''),
			stderr: createMockStream(''),
			exitCode: null,
			on: vi.fn((event, cb) => {
				if (event === 'close') {
					setTimeout(cb, 0);
				}
				return mockChild;
			}),
		};

		vi.mocked(spawn).mockReturnValue(mockChild as any);

		await expect(shell('npm', ['install'], { timeout: 1000 })).rejects.toThrow('Timeout');
	});

	it('should handle spawn errors', async () => {
		vi.mocked(spawn).mockImplementation(() => {
			throw new Error('Spawn failed');
		});

		await expect(shell('invalid-command', [])).rejects.toEqual({
			stdout: '',
			stderr: '',
			exitCode: 1,
		});
	});

	it('should handle stream errors', async () => {
		const mockStdout = new Readable({
			read() {
				this.emit('error', new Error('Stream error'));
			},
		});
		const mockStderr = createMockStream('');

		const mockChild = {
			stdout: mockStdout,
			stderr: mockStderr,
			exitCode: 0,
			on: vi.fn((event, cb) => {
				if (event === 'close') {
					setTimeout(cb, 0);
				}
				return mockChild;
			}),
		};

		vi.mocked(spawn).mockReturnValue(mockChild as any);

		await expect(shell('npm', ['install'])).rejects.toThrow();
	});

	it('should handle custom options', async () => {
		const mockChild = {
			stdout: createMockStream('output'),
			stderr: createMockStream(''),
			exitCode: 0,
			on: vi.fn((event, cb) => {
				if (event === 'close') {
					setTimeout(cb, 0);
				}
				return mockChild;
			}),
		};

		vi.mocked(spawn).mockReturnValue(mockChild as any);

		const options = {
			cwd: '/custom/path',
			stdio: 'pipe' as const,
			timeout: 5000,
		};

		await shell('npm', ['test'], options);

		expect(spawn).toHaveBeenCalledWith('npm', ['test'], {
			cwd: '/custom/path',
			shell: true,
			stdio: 'pipe',
			timeout: 5000,
		});
	});
});
