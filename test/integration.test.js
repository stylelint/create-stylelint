// eslint-disable-next-line node/no-unpublished-import
import { afterEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';

const inputs = {
	noPackageJson: 'test/fixtures/no-package-json',
	stylelintConfigExists: 'test/fixtures/stylelint-config-exists',
	validEnv: 'test/fixtures/valid-env',
};

function getProjectRoot(context) {
	return context.meta.file.filepath.replace(context.meta.file.name, '');
}

function setup(pathToTest, projectRoot, args = []) {
	return execFileSync('node', [`${projectRoot}create-stylelint.mjs`, ...args], {
		cwd: `${projectRoot}${pathToTest}`,
	});
}

function cleanupGenFiles() {
	const pathsToCleanup = [inputs.validEnv];

	for (let pathToTest of pathsToCleanup) {
		execFileSync('./reset-state.sh', [], {
			// eslint-disable-next-line no-undef
			cwd: `${__dirname}/../${pathToTest}`,
		});
	}
}

vi.mock('execa');

describe('stylelint-create', () => {
	afterEach(() => {
		cleanupGenFiles();
	});

	it('should succeed in a valid env', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(setup(inputs.validEnv, projectRoot)).toMatch(/You can now lint your CSS files using/);
	});

	it('should not proceed if a Stylelint config already exists in the directory', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.stylelintConfigExists, projectRoot)).toThrowError(
			/config\(s\) already exist/,
		);
	});

	it('should not proceed if no package.json exists', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.noPackageJson, projectRoot)).toThrowError(
			/package.json was not found./,
		);
	});
});
