import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkWritePermissions } from '../../../../src/utils/fs/permissions';
import { join } from 'node:path';
import { chmod, stat } from 'node:fs/promises';

describe('checkWritePermissions', () => {
	const fixturesPath = join(__dirname, '../../../fixtures/');
	const noWriteDir = join(fixturesPath, 'no-write-permissions');

	beforeEach(async () => {
		await chmod(noWriteDir, 0o777);
	});

	afterEach(async () => {
		await chmod(noWriteDir, 0o777);
	});

	it('should return true if directory is writable', async () => {
		const result = await checkWritePermissions(noWriteDir);
		expect(result).toBe(true);
	});

  /**
   * This case is not reliable on Windows due to the way ACLs (Access Control Lists) work.
   * On Windows, even if the directory's mode is set to 0o555 (read-only), the fs.access() function
   * may still report that the directory is writable because it does not check the ACL.
   * @see: https://nodejs.org/api/fs.html#fsaccesspath-mode-callback
   * @see https://github.com/nodejs/node/issues/30019
   */
	it('should return false if directory is not writable', { skip: true }, async () => {
		await chmod(noWriteDir, 0o555);

		// const stats = await stat(noWriteDir);
		// console.log('Current mode:', (stats.mode & 0o777).toString(8));
		const result = await checkWritePermissions(noWriteDir);
		expect(result).toBe(false);
	});
});
