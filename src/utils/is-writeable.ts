import { access, constants } from 'node:fs/promises';

/**
 * Checks if the given directory is writeable.
 * @see https://nodejs.org/api/fs.html#file-access-constants
 */
export async function checkWritePermissions(filePath: string): Promise<boolean> {
	try {
		await access(filePath, constants.W_OK);
		
		return true;
	} catch (err) {
		return false;
	}
}
