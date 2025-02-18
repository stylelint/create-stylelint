import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import process from 'node:process';
import { showHelp } from '../../src/actions/help.js';

import { stripVTControlCharacters } from 'node:util';

describe('showHelp', () => {
	let output = '';
	const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation((str) => {
		output += str;

		return true;
	});

	afterEach(() => {
		stdoutWriteSpy.mockClear();
		output = '';
	});

	afterAll(() => {
		stdoutWriteSpy.mockRestore();
	});

	it('should print help message to stdout', () => {
		showHelp();

		expect(stdoutWriteSpy).toHaveBeenCalledTimes(1);
		expect(output).toBeTruthy();
	});

	it('should include all package manager options', () => {
		showHelp();

		const cleaned = stripVTControlCharacters(output);

		const packageManagers = ['--use-npm', '--use-pnpm', '--use-yarn', '--use-bun', '--use-deno'];

		packageManagers.forEach((manager) => {
			expect(cleaned).toContain(manager);
		});
	});

	it('should include all general options', () => {
		showHelp();

		const cleaned = stripVTControlCharacters(output);

		const generalOptions = [
			'--dry-run',
			'--no-install',
			'--no-color',
			'-h, --help',
			'-v, --version',
		];

		generalOptions.forEach((option) => {
			expect(cleaned).toContain(option);
		});
	});

	it('should include usage examples', () => {
		showHelp();

		const cleaned = stripVTControlCharacters(output);

		expect(cleaned).toContain('Examples:');
		expect(cleaned).toContain('create-stylelint');
		expect(cleaned).toContain('create-stylelint --use-npm --no-install');
	});

	it('should include help link', () => {
		showHelp();

		const cleaned = stripVTControlCharacters(output);

		expect(cleaned).toContain('https://github.com/stylelint/create-stylelint');
	});

	it('should match snapshot', () => {
		showHelp();

		const cleaned = stripVTControlCharacters(output);

		expect(cleaned).toMatchSnapshot();
	});
});
