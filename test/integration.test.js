import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test'; // eslint-disable-line n/no-unsupported-features/node-builtins
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

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

const projectRoot = path.join(import.meta.dirname, '..'); // eslint-disable-line n/no-unsupported-features/node-builtins
const generatedFixtures = [inputs.failNpmInstall, inputs.validEnv];

function assertIncludes(actual, expected) {
	assert.ok(
		actual.includes(expected),
		`Expected output to include ${JSON.stringify(expected)}.\nReceived:\n${actual}`,
	);
}

function setup(pathToTest, args = [], input = null) {
	return execFileSync('node', [path.join(projectRoot, 'create-stylelint.mjs'), ...args], {
		cwd: path.join(projectRoot, pathToTest),
		input: input !== null ? input : undefined,
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'pipe'],
	});
}

function setupError(pathToTest, args = [], input = null) {
	try {
		execFileSync('node', [path.join(projectRoot, 'create-stylelint.mjs'), ...args], {
			cwd: path.join(projectRoot, pathToTest),
			input: input !== null ? input : undefined,
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		throw new Error('Expected process to exit with non-zero code');
	} catch (error) {
		return error.stdout + error.stderr;
	}
}

function backupFiles() {
	for (const pathToTest of generatedFixtures) {
		fs.copyFileSync(
			path.join(projectRoot, pathToTest, 'package.json'),
			path.join(projectRoot, pathToTest, 'package.json.bak'),
		);
	}
}

function cleanupGenFiles() {
	for (const pathToTest of generatedFixtures) {
		for (const file of ['stylelint.config.mjs', 'package-lock.json', 'node_modules']) {
			fs.rmSync(path.join(projectRoot, pathToTest, file), {
				recursive: true,
				force: true,
			});
		}

		fs.renameSync(
			path.join(projectRoot, pathToTest, 'package.json.bak'),
			path.join(projectRoot, pathToTest, 'package.json'),
		);
	}
}

beforeEach(backupFiles);
afterEach(cleanupGenFiles);

describe('create-stylelint', () => {
	it('should succeed in a valid env with yes prompt', { timeout: 15000 }, () => {
		assertIncludes(setup(inputs.validEnv, [], 'yes\n'), 'Done!');
	});

	it('should generate a valid config file', { timeout: 15000 }, () => {
		setup(inputs.validEnv, [], 'yes\n');

		const configPath = path.join(projectRoot, inputs.validEnv, 'stylelint.config.mjs');
		const content = fs.readFileSync(configPath, 'utf8');

		assertIncludes(content, 'extends: ["stylelint-config-standard"]');

		execFileSync('node', ['--check', configPath], { encoding: 'utf8' });
	});

	it('should succeed in a valid env with y prompt', { timeout: 15000 }, () => {
		assertIncludes(setup(inputs.validEnv, [], 'y\n'), 'Done!');
	});

	it("should cancel setup if user chooses 'no' at confirmation", () => {
		assertIncludes(setup(inputs.validEnv, [], 'no\n'), 'Canceled');
	});

	it('should not proceed if no package.json exists', () => {
		assertIncludes(setupError(inputs.noPackageJson, [], 'yes\n'), 'was not found');
	});

	it('should not proceed if the stylelint field exists in package.json', () => {
		assertIncludes(
			setupError(inputs.stylelintConfigExistsPackageJson, [], 'yes\n'),
			'already exists.',
		);
	});

	it('should error if npm install fails', { timeout: 15000 }, () => {
		assertIncludes(setupError(inputs.failNpmInstall, [], 'yes\n'), 'npm error code ETARGET');
	});
});

const configExistsCases = [
	{ file: '.stylelintrc', fixture: inputs.stylelintConfigExistsRc },
	{ file: '.stylelintrc.cjs', fixture: inputs.stylelintConfigExistsRcCjs },
	{ file: '.stylelintrc.json', fixture: inputs.stylelintConfigExistsRcJson },
	{ file: '.stylelintrc.yaml', fixture: inputs.stylelintConfigExistsRcYaml },
	{ file: 'stylelint.config.cjs', fixture: inputs.stylelintConfigExistsConfigCjs },
	{ file: 'stylelint.config.mjs', fixture: inputs.stylelintConfigExistsConfigMjs },
	{ file: '.config/stylelintrc.json', fixture: inputs.stylelintConfigExistsSubdirRcJson },
];

for (const { file, fixture } of configExistsCases) {
	describe(`create-stylelint in a directory with ${file}`, () => {
		it(`should not proceed, since a stylelint configuration already exists at ${file}`, () => {
			assertIncludes(setupError(fixture, [], 'yes\n'), 'already exists.');
		});
	});
}
