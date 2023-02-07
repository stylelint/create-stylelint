// eslint-disable-next-line node/no-unpublished-import
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const inputs = {
	noPackageJson: 'test/fixtures/no-package-json',
	stylelintConfigExists: 'test/fixtures/stylelint-config-exists',
};

function getProjectRoot(context) {
	return context.meta.file.filepath.replace(context.meta.file.name, '');
}

function setup(pathToTest, projectRoot, args = []) {
	return execFileSync('node', [`${projectRoot}create-stylelint.mjs`, ...args], {
		cwd: `${projectRoot}${pathToTest}`,
	});
}

describe('stylelint-create', () => {
	it('should not proceed if a Stylelint config already exists in the directory', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.stylelintConfigExists, projectRoot)).toThrowError(
			/config\(s\) already exist/,
		);
	});

	it('should not proceed if no package.json exists', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.noPackageJson, projectRoot)).toThrowError(
			/The package.json was not found./,
		);
	});
});
