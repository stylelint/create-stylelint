import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWriteable } from '../src/utils/isWriteable';
import { access } from 'node:fs/promises';
import { W_OK } from 'node:constants';

vi.mock('node:fs/promises', () => ({
    access: vi.fn(),
}));

describe('isWriteable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should return true when directory is writeable', async () => {
        vi.mocked(access).mockResolvedValueOnce(undefined);

        const result = await isWriteable('/path/to/writeable/directory');

        expect(result).toBe(true);
        expect(access).toHaveBeenCalledTimes(1);
        expect(access).toHaveBeenCalledWith('/path/to/writeable/directory', W_OK);
    });

    it('should return false when directory is not writeable', async () => {
        vi.mocked(access).mockRejectedValueOnce(new Error('EACCES: permission denied'));

        const result = await isWriteable('/path/to/non-writeable/directory');

        expect(result).toBe(false);
        expect(access).toHaveBeenCalledTimes(1);
        expect(access).toHaveBeenCalledWith('/path/to/non-writeable/directory', W_OK);
    });

    it('should return false when directory does not exist', async () => {
        vi.mocked(access).mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));

        const result = await isWriteable('/path/to/non-existent/directory');

        expect(result).toBe(false);
        expect(access).toHaveBeenCalledTimes(1);
        expect(access).toHaveBeenCalledWith('/path/to/non-existent/directory', W_OK);
    });

    it('should handle various error types correctly', async () => {
        const errorCases = [
            new Error('EPERM: operation not permitted'),
            new Error('ENOSPC: no space left on device'),
            new Error('Unknown error'),
        ];

        for (const error of errorCases) {
            vi.mocked(access).mockRejectedValueOnce(error);

            const result = await isWriteable('/some/path');

            expect(result).toBe(false);
            expect(access).toHaveBeenCalledWith('/some/path', W_OK);
        }

        expect(access).toHaveBeenCalledTimes(errorCases.length);
    });

    it('should handle empty directory path', async () => {
        vi.mocked(access).mockRejectedValueOnce(new Error('Invalid path'));

        const result = await isWriteable('');

        expect(result).toBe(false);
        expect(access).toHaveBeenCalledTimes(1);
        expect(access).toHaveBeenCalledWith('', W_OK);
    });

    it.each([
        ['/absolute/path'],
        ['./relative/path'],
        ['../parent/path'],
        ['C:\\windows\\path'],
        ['folder/subfolder'],
    ])('should handle different path format: %s', async (path) => {
        vi.mocked(access).mockResolvedValueOnce(undefined);

        const result = await isWriteable(path);

        expect(result).toBe(true);
        expect(access).toHaveBeenCalledWith(path, W_OK);
    });
});
