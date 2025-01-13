import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as nodePath from 'node:path';
import { validatePackageJson } from '../../../../src/utils/fs/package';
import { PackageManager } from '../../../../src/utils/package/helpers';

describe('validatePackageJson', () => {
	const fixturesPath = nodePath.join(__dirname, '../../../fixtures/');

	beforeEach(() => {
		vi.spyOn(process, 'cwd').mockImplementation(() => fixturesPath);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should throw an error if package.json does not exist', async () => {
		const packageManager: PackageManager = 'npm';
		const fixturePath = nodePath.join(fixturesPath, 'no-package-json');

		vi.spyOn(process, 'cwd').mockImplementation(() => fixturePath);

		await expect(validatePackageJson(packageManager)).rejects.toThrow(
			'No package.json found in current directory.',
		);
	});

	it('should not throw an error if package.json exists', async () => {
		const packageManager: PackageManager = 'npm';
		const fixturePath = nodePath.join(fixturesPath, 'valid-env');

		vi.spyOn(process, 'cwd').mockImplementation(() => fixturePath);

		await expect(validatePackageJson(packageManager)).resolves.not.toThrow();
	});

	it('should use default package manager if none is provided', async () => {
		const fixturePath = nodePath.join(fixturesPath, 'no-package-json');

		vi.spyOn(process, 'cwd').mockImplementation(() => fixturePath);

		await expect(validatePackageJson(null)).rejects.toThrow(
			'No package.json found in current directory.',
		);
	});
});
