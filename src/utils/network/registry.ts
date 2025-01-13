import detectPackageManager from 'preferred-pm';
import { red } from 'picocolors';
import { shell } from '$/output/shell.js';
import { log } from '$/output/format.js';

const versionCache = new Map<string, string>();

export async function resolvePackageVersion(packageName: string): Promise<string> {
	if (versionCache.has(packageName)) {
		return versionCache.get(packageName)!;
	}

	try {
		const registry = await detectNpmRegistry();
		const response = await fetch(`${registry}/${packageName}/latest`);
		if (!response.ok) throw new Error(`Failed to fetch version for ${packageName}`);
		const data = await response.json();
		const version = data.version;
		versionCache.set(packageName, data.version);
		return version;
	} catch (error) {
		log(red(`Failed to fetch version for ${packageName}: ${(error as Error).message}\n`));
		throw new Error(
			`Unable to resolve version for ${packageName}. Please check your network connection.`,
		);
	}
}

let _registryUrl: string;

export async function detectNpmRegistry(): Promise<string> {
	if (_registryUrl) return _registryUrl;

	const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
	const packageManager = (await detectPackageManager(process.cwd()))?.name || 'npm';

	try {
		const { stdout } = await shell(packageManager, ['config', 'get', 'registry']);
		_registryUrl = stdout?.trim()?.replace(/\/$/, '') || DEFAULT_REGISTRY;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		if (!new URL(_registryUrl).host) _registryUrl = DEFAULT_REGISTRY;
	} catch {
		_registryUrl = DEFAULT_REGISTRY;
	}
	return _registryUrl;
}
