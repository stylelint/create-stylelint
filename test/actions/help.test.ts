import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import process from 'node:process';
import { showHelp } from '../../src/actions/help.js';

import { stripVTControlCharacters } from 'node:util';

describe('showHelp', () => {
	let cleanedOutput: string;
	const stdoutWriteSpy = vi.spyOn(process.stdout, 'write');

	beforeEach(() => {
		stdoutWriteSpy.mockClear();
		let output = '';

		stdoutWriteSpy.mockImplementation((str) => {
			output += str;

			return true;
		});

		showHelp();
		cleanedOutput = stripVTControlCharacters(output);
	});

	afterAll(() => {
		stdoutWriteSpy.mockRestore();
	});

	it('should print help message once', () => {
		expect(stdoutWriteSpy).toHaveBeenCalledTimes(1);
	});

	it.each([
		'--use-npm',
		'--use-pnpm',
		'--use-yarn',
		'--use-bun',
		'--use-deno',
		'--dry-run',
		'--no-install',
		'--no-color',
		'-h, --help',
		'-v, --version',
	])('should include %s option', (option) => {
		expect(cleanedOutput).toContain(option);
	});

	it('should include examples and help link', () => {
		expect(cleanedOutput).toContain('Examples:');
		expect(cleanedOutput).toContain('create-stylelint --use-npm --no-install');
		expect(cleanedOutput).toContain('https://github.com/stylelint/create-stylelint');
	});

	it('should match snapshot', () => {
		expect(cleanedOutput).toMatchSnapshot();
	});
});
