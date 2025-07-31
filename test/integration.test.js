import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const inputs = {
	failNpmInstall: 'test/fixtures/fail-npm-install',
	noPackageJson: 'test/fixtures/no-package-json',
	stylelintConfigExistsConfigCjs: 'test/fixtures/stylelint-config-exists-config-cjs',
	stylelintConfigExistsConfigMjs: 'test/fixtures/stylelint-config-exists-config-mjs',
	stylelintConfigExistsPackageJson: 'test/fixtures/stylelint-config-exists-package-json',
	stylelintConfigExistsRc: 'test/fixtures/stylelint-config-exists-rc',
	stylelintConfigExistsRcCjs: 'test/fixtures/stylelint-config-exists-rc-cjs',
	stylelintConfigExistsRcJson: 'test/fixtures/stylelint-config-exists-rc-json',
	stylelintConfigExistsRcYaml: 'test/fixtures/stylelint-config-exists-rc-yaml',
	stylelintConfigExistsSubdirRcJson: 'test/fixtures/stylelint-config-exists-subdir-rc-json',
	validEnv: 'test/fixtures/valid-env',
};

function getProjectRoot(context) {
	return context.task.file.filepath.replace(context.task.file.name, '');
}

function setup(pathToTest, projectRoot, args = [], input = null) {
	return execFileSync('node', [path.join(projectRoot, 'create-stylelint.mjs'), ...args], {
		cwd: path.join(projectRoot, pathToTest),
		input: input !== null ? input : undefined,
	}).toString();
}

function backupFiles(root) {
	const pathsToBackup = [inputs.failNpmInstall, inputs.validEnv];

	for (const pathToTest of pathsToBackup) {
		fs.copyFileSync(
			path.join(root, pathToTest, 'package.json'),
			path.join(root, pathToTest, 'package.json.bak'),
		);
	}
}

function cleanupGenFiles(root) {
	const pathsToCleanup = [inputs.failNpmInstall, inputs.validEnv];

	for (const pathToTest of pathsToCleanup) {
		for (const file of ['stylelint.config.mjs', 'package-lock.json', 'node_modules']) {
			fs.rmSync(path.join(root, pathToTest, file), {
				recursive: true,
				force: true,
			});
		}

		fs.renameSync(
			path.join(root, pathToTest, 'package.json.bak'),
			path.join(root, pathToTest, 'package.json'),
		);
	}
}

describe('create-stylelint', () => {
	beforeEach((context) => {
		backupFiles(getProjectRoot(context));
	});

	afterEach((context) => {
		cleanupGenFiles(getProjectRoot(context));
	});

	it('should succeed in a valid env with yes prompt', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(setup(inputs.validEnv, projectRoot, [], 'yes\n')).toContain('Setup complete');
	});

	it('should succeed in a valid env with enter prompt', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(setup(inputs.validEnv, projectRoot, [], '\n')).toContain('Setup complete');
	});

	it("should cancel setup if user chooses 'no' at confirmation", (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.validEnv, projectRoot, [], 'no\n')).toThrowError('Setup cancelled');
	});

	it('should not proceed if no package.json exists', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.noPackageJson, projectRoot, [], 'yes\n')).toThrowError(
			'A "package.json" was not found',
		);
	});

	it('should not proceed if the stylelint field exists in package.json', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() =>
			setup(inputs.stylelintConfigExistsPackageJson, projectRoot, [], 'yes\n'),
		).toThrowError('A "stylelint" config in "package.json" already exists.');
	});

	it('should error if npm install fails', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.failNpmInstall, projectRoot, [], 'yes\n')).toThrowError(
			'npm error code ETARGET',
		);
	});
});

describe.each([
	{ file: '.stylelintrc', fixture: inputs.stylelintConfigExistsRc },
	{ file: '.stylelintrc.cjs', fixture: inputs.stylelintConfigExistsRcCjs },
	{ file: '.stylelintrc.json', fixture: inputs.stylelintConfigExistsRcJson },
	{ file: '.stylelintrc.yaml', fixture: inputs.stylelintConfigExistsRcYaml },
	{
		file: 'stylelint.config.cjs',
		fixture: inputs.stylelintConfigExistsConfigCjs,
	},
	{
		file: 'stylelint.config.mjs',
		fixture: inputs.stylelintConfigExistsConfigMjs,
	},
	{
		file: '.config/stylelintrc.json',
		fixture: inputs.stylelintConfigExistsSubdirRcJson,
	},
])('create-stylelint in a directory with $file', ({ file, fixture }) => {
	beforeEach((context) => {
		backupFiles(getProjectRoot(context));
	});

	afterEach((context) => {
		cleanupGenFiles(getProjectRoot(context));
	});

	it(`should not proceed, since a stylelint configuration already exists at ${file}`, (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(fixture, projectRoot, [], 'yes\n')).toThrowError('config already exists');
	});
});
