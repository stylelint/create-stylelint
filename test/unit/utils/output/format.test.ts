import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createBox, createBorder, createPaddedLines, log, newline } from '../../../../src/utils/output/format';
import { stripVTControlCharacters } from 'node:util';

describe('format', () => {
	describe('createBox', () => {
		it('should create a simple box without any options', () => {
			const content = 'Hello, world!';
			const expected = `
╭───────────────╮
│ Hello, world! │
╰───────────────╯
`.trim();
			expect(createBox(content)).toBe(expected);
		});

		it('should handle multiline content correctly', () => {
			const content = ['Line 1', 'Line 2'];
			const expected = `
╭────────╮
│ Line 1 │
│ Line 2 │
╰────────╯
`.trim();
			expect(createBox(content)).toBe(expected);
		});

		it('should handle fileName correctly', () => {
			const content = 'Content';
			const fileName = 'example.txt';
			const expected = `
╭── example.txt ──╮
│ Content         │
╰─────────────────╯
`.trim();
			expect(createBox(content, { fileName })).toBe(expected);
		});

		it('should throw an error if fileNameColor is provided without fileName', () => {
			const content = 'Error test';
			expect(() => createBox(content, { fileNameColor: (text) => text })).toThrow(
				'fileNameColor cannot be used without fileName.',
			);
		});
	});

	it('should apply border color correctly', () => {
		const content = 'Colored border';
		const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
		const result = createBox(content, { borderColor: redColor });

		const stripped = stripVTControlCharacters(result);
		const expected = `
╭────────────────╮
│ Colored border │
╰────────────────╯
`.trim();

		expect(stripped).toBe(expected);
		expect(result).toContain('\x1b[31m');
	});

	it('should apply text color correctly', () => {
		const content = 'Colored text';
		const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`;
		const result = createBox(content, { textColor: blueColor });

		const stripped = stripVTControlCharacters(result);
		const expected = `
╭──────────────╮
│ Colored text │
╰──────────────╯
`.trim();

		expect(stripped).toBe(expected);
		expect(result).toContain('\x1b[34m');
	});

	it('should handle fileName with fileNameColor correctly', () => {
		const content = 'Content';
		const fileName = 'test.js';
		const greenColor = (text: string) => `\x1b[32m${text}\x1b[0m`;
		const result = createBox(content, {
			fileName,
			fileNameColor: greenColor,
		});

		const stripped = stripVTControlCharacters(result);
		const expected = `
╭── test.js ──╮
│ Content     │
╰─────────────╯
`.trim();

		expect(stripped).toBe(expected);
		expect(result).toContain('\x1b[32m');
	});
});

describe('createBorder', () => {
	it('should create top border without fileName', () => {
		const result = createBorder('top', 10);
		expect(result).toBe('╭────────────╮');
	});

	it('should create bottom border', () => {
		const result = createBorder('bottom', 10);
		expect(result).toBe('╰────────────╯');
	});

	it('should create top border with fileName', () => {
		const result = createBorder('top', 15, 'test.js');
		expect(result).toBe('╭── test.js ──────╮');
	});

	it('should apply border color', () => {
		const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
		const result = createBorder('top', 10, undefined, redColor);
		expect(result).toContain('\x1b[31m');
		expect(stripVTControlCharacters(result)).toBe('╭────────────╮');
	});

	it('should apply fileName color', () => {
		const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`;
		const result = createBorder('top', 15, 'test.js', undefined, blueColor);
		expect(result).toContain('\x1b[34m');
		expect(stripVTControlCharacters(result)).toBe('╭── test.js ──────╮');
	});
});

describe('createPaddedLines', () => {
	it('should pad lines to uniform width', () => {
		const lines = ['short', 'longer line'];
		const result = createPaddedLines(
			lines,
			11,
			(x) => x,
			(x) => x,
		);
		expect(result).toEqual(['│ short       │', '│ longer line │']);
	});

	it('should apply border color', () => {
		const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
		const result = createPaddedLines(['test'], 4, redColor, (x) => x);
		expect(result[0]).toContain('\x1b[31m│\x1b[0m');
	});

	it('should apply text color', () => {
		const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`;
		const result = createPaddedLines(['test'], 4, (x) => x, blueColor);
		expect(result[0]).toContain('\x1b[34mtest\x1b[0m');
	});
});

describe('log', () => {
	const mockWrite = vi.fn();

	beforeEach(() => {
		vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		mockWrite.mockClear();
	});

	it('log should write message with newline', () => {
		log('test message');
		expect(mockWrite).toHaveBeenCalledWith('test message\n');
	});

	it('newline should write single newline character', () => {
		newline();
		expect(mockWrite).toHaveBeenCalledWith('\n');
	});
});
