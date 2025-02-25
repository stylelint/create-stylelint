import * as childProcess from 'node:child_process';
import * as dns from 'node:dns/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOnline } from '../../src/utils/is-online.js';
import process from 'node:process'

vi.mock('node:dns/promises');
vi.mock('node:child_process');

describe('is-onilne', () => {
	const mockLookup = vi.spyOn(dns, 'lookup');
	const mockExecSync = vi.spyOn(childProcess, 'execSync');

	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.https_proxy;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('getOnline', () => {
		it('should return true when registry.yarnpkg.com is accessible', async () => {
			mockLookup.mockResolvedValueOnce({ address: '123.123.123.123', family: 4 });

			const result = await getOnline();

			expect(result).toBe(true);
			expect(mockLookup).toHaveBeenCalledWith('registry.yarnpkg.com');
			expect(mockLookup).toHaveBeenCalledTimes(1);
		});

		it('should return true when registry fails but https_proxy env is set and accessible', async () => {
			process.env.https_proxy = 'http://proxy.example.com:8080';

			mockLookup
				.mockRejectedValueOnce(new Error('DNS lookup failed'))
				.mockResolvedValueOnce({ address: '123.123.123.123', family: 4 });

			const result = await getOnline();

			expect(result).toBe(true);
			expect(mockLookup).toHaveBeenCalledTimes(2);
			expect(mockLookup).toHaveBeenCalledWith('proxy.example.com');
		});

		it('should return true when registry fails but npm config proxy is set and accessible', async () => {
			mockExecSync.mockReturnValue(Buffer.from('http://npm-proxy.example.com:8080'));

			mockLookup
				.mockRejectedValueOnce(new Error('DNS lookup failed'))
				.mockResolvedValueOnce({ address: '123.123.123.123', family: 4 });

			const result = await getOnline();

			expect(result).toBe(true);
			expect(mockExecSync).toHaveBeenCalledWith('npm config get https-proxy');
			expect(mockLookup).toHaveBeenCalledWith('npm-proxy.example.com');
		});

		it('should return false when registry fails and no proxy is configured', async () => {
			mockLookup.mockRejectedValueOnce(new Error('DNS lookup failed'));
			mockExecSync.mockReturnValue(Buffer.from('null'));

			const result = await getOnline();

			expect(result).toBe(false);
			expect(mockExecSync).toHaveBeenCalledWith('npm config get https-proxy');
		});

		it('should return false when registry and proxy lookup both fail', async () => {
			process.env.https_proxy = 'http://proxy.example.com:8080';

			mockLookup
				.mockRejectedValueOnce(new Error('Registry DNS lookup failed'))
				.mockRejectedValueOnce(new Error('Proxy DNS lookup failed'));

			const result = await getOnline();

			expect(result).toBe(false);
			expect(mockLookup).toHaveBeenCalledTimes(2);
		});

		it('should handle invalid proxy URL', async () => {
			process.env.https_proxy = 'invalid-url';

			mockLookup.mockRejectedValueOnce(new Error('DNS lookup failed'));

			const result = await getOnline();

			expect(result).toBe(false);
		});
	});
});
