import * as fs from 'node:fs';
import * as path from 'node:path';
// eslint-disable-next-line node/no-unpublished-import
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const inputs = {
	failNpmInstall: 'test/fixtures/fail-npm-install',
	noPackageJson: 'test/fixtures/no-package-json',
	stylelintConfigExistsPackageJson: 'test/fixtures/stylelint-config-exists-package-json',
	stylelintConfigExistsRc: 'test/fixtures/stylelint-config-exists-rc',
	stylelintConfigExistsRcJson: 'test/fixtures/stylelint-config-exists-rc-json',
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
		for (const file of ['.stylelintrc.json', 'package-lock.json', 'node_modules']) {
			fs.rmSync(path.join(root, pathToTest, file), { recursive: true, force: true });
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

	it('should succeed in a valid env', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(setup(inputs.validEnv, projectRoot)).toMatch(/You can now lint your CSS files using/);
	});

	it('should not proceed if a Stylelint config already exists in the directory: package.json', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.stylelintConfigExistsPackageJson, projectRoot)).toThrowError(
			/config\(s\) already exist/,
		);
	});

	it('should not proceed if a Stylelint config already exists in the directory: .stylelintrc', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.stylelintConfigExistsRc, projectRoot)).toThrowError(
			/config\(s\) already exist/,
		);
	});

	it('should not proceed if a Stylelint config already exists in the directory: .stylelintrc.json', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.stylelintConfigExistsRcJson, projectRoot)).toThrowError(
			/config\(s\) already exist/,
		);
	});

	it('should not proceed if no package.json exists', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.noPackageJson, projectRoot)).toThrowError(
			/package.json was not found./,
		);
	});

	it('should error if npm install fails', (context) => {
		const projectRoot = getProjectRoot(context);

		expect(() => setup(inputs.failNpmInstall, projectRoot)).toThrowError(
			/Failed to install packages/,
		);
	});
});
