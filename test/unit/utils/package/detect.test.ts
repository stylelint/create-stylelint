import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectPackageManagerWithFallback } from '../../../../src/utils/package/detect.js';
import preferredPM from 'preferred-pm';

vi.mock('preferred-pm', () => ({
	default: vi.fn(),
}));

describe('detectPackageManagerWithFallback', () => {
	const DIRECTORY = '/tmp/dir';

	type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
	type FlagConfig = {
		flag: keyof typeof FLAGS;
		expected: PackageManager;
		description: string;
	};

	const FLAGS = {
		useNpm: 'npm',
		usePnpm: 'pnpm',
		useYarn: 'yarn',
		useBun: 'bun',
	} as const;

	const FLAG_TEST_CASES: FlagConfig[] = Object.entries(FLAGS).map(([flag, pm]) => ({
		flag: flag as keyof typeof FLAGS,
		expected: pm as PackageManager,
		description: `should return ${pm} when ${flag} is true`,
	}));

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('flag-based detection', () => {
		FLAG_TEST_CASES.forEach(({ flag, expected, description }) => {
			it(description, async () => {
				const flags = { [flag]: true };
				const result = await detectPackageManagerWithFallback(DIRECTORY, flags);
				expect(result).toBe(expected);
				expect(preferredPM).not.toHaveBeenCalled();
			});
		});
	});

	describe('automatic detection', () => {
		it('should return detected package manager when no flags are set', async () => {
			const expectedPM = 'pnpm';
			vi.mocked(preferredPM).mockResolvedValue({
				name: expectedPM,
				version: '9.0.0',
			});

			const result = await detectPackageManagerWithFallback(DIRECTORY, {});

			expect(result).toBe(expectedPM);
			expect(preferredPM).toHaveBeenCalledWith(DIRECTORY);
			expect(preferredPM).toHaveBeenCalledTimes(1);
		});

		it('should fallback to npm when no package manager is detected', async () => {
			vi.mocked(preferredPM).mockResolvedValue(undefined);

			const result = await detectPackageManagerWithFallback(DIRECTORY, {});

			expect(result).toBe('npm');
			expect(preferredPM).toHaveBeenCalledWith(DIRECTORY);
			expect(preferredPM).toHaveBeenCalledTimes(1);
		});
	});

	describe('edge cases', () => {
		it('should prioritize first flag if multiple flags are set', async () => {
			const flags = {
				useNpm: true,
				usePnpm: true,
				useYarn: true,
				useBun: true,
			};

			const result = await detectPackageManagerWithFallback(DIRECTORY, flags);

			expect(result).toBe('npm');
			expect(preferredPM).not.toHaveBeenCalled();
		});

		it('should handle empty flags object', async () => {
			vi.mocked(preferredPM).mockResolvedValue({ name: 'yarn', version: '1.22.0' });

			const result = await detectPackageManagerWithFallback(DIRECTORY, {});

			expect(result).toBe('yarn');
			expect(preferredPM).toHaveBeenCalledWith(DIRECTORY);
		});
	});
});
