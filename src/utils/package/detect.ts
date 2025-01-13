import detectPackageManager from 'preferred-pm';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
type Flags = Partial<Record<`use${Capitalize<PackageManager>}`, boolean>>;

export async function detectPackageManagerWithFallback(
    directory: string,
    flags: Flags
): Promise<PackageManager> {
    const flagMap: [keyof Flags, PackageManager][] = [
        ['useNpm', 'npm'],
        ['usePnpm', 'pnpm'],
        ['useYarn', 'yarn'],
        ['useBun', 'bun']
    ];

    for (const [flag, pm] of flagMap) {
        if (flags[flag]) return pm;
    }

	const detected = await detectPackageManager(directory);

	return detected?.name || 'npm'; 
}
