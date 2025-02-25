import { createBottomBorder, createBox, createContentLines, createTopBorder } from '../../src/utils/terminal-box.js';
import { describe, expect, it } from 'vitest';
import { stripVTControlCharacters } from 'node:util';

describe('createBox()', () => {
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
            'fileNameColor requires fileName',
        );
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

describe('createTopBorder()', () => {
    it('should create top border without fileName', () => {
        const result = createTopBorder(10);

        expect(result).toBe('╭────────────╮');
    });

    it('should create top border with fileName', () => {
        const result = createTopBorder(15, 'test.js');

        expect(result).toBe('╭── test.js ──────╮');
    });

    it('should apply border color', () => {
        const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
        const result = createTopBorder(10, undefined, redColor);

        expect(result).toContain('\x1b[31m');
        expect(stripVTControlCharacters(result)).toBe('╭────────────╮');
    });

    it('should apply fileName color', () => {
        const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`;
        const result = createTopBorder(15, 'test.js', (x) => x, blueColor);

        expect(result).toContain('\x1b[34m');
        expect(stripVTControlCharacters(result)).toBe('╭── test.js ──────╮');
    });
});

describe('createBottomBorder()', () => {
    it('should create bottom border', () => {
        const result = createBottomBorder(10, (x) => x);

        expect(result).toBe('╰────────────╯');
    });

    it('should apply border color', () => {
        const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
        const result = createBottomBorder(10, redColor);
        const stripped = stripVTControlCharacters(result);

        expect(stripped).toBe('╰────────────╯');
        expect(result).toContain('\x1b[31m');
    });
});

describe('createContentLines()', () => {
    it('should pad lines to uniform width', () => {
        const lines = ['short', 'longer line'];
        const result = createContentLines(lines, 11, (x) => x, (x) => x);

        expect(result).toEqual([
            '│ short       │',
            '│ longer line │',
        ]);
    });

    it('should apply border color', () => {
        const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`;
        const result = createContentLines(['test'], 4, redColor, (x) => x);

        expect(result[0]).toContain('\x1b[31m│\x1b[0m');
    });

    it('should apply text color', () => {
        const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`;
        const result = createContentLines(['test'], 4, (x) => x, blueColor);

        expect(result[0]).toContain('\x1b[34mtest\x1b[0m');
    });
});
