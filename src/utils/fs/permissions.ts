import { W_OK } from 'node:constants';
import { access } from 'node:fs/promises';

/**
 * Checks if the given directory is writeable.
 * @see https://nodejs.org/api/fs.html#file-access-constants
 */
export async function checkWritePermissions(directory: string): Promise<boolean> {
	try {
		await access(directory, W_OK);
		return true;
	} catch (err) {
		return false;
	}
}
