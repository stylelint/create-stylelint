import detectPackageManager from 'preferred-pm';
import picocolors from 'picocolors';
import { shell } from '../shell.js';

const versionCache = new Map<string, string>();

export async function getLatestVersion(packageName: string): Promise<string> {
	if (versionCache.has(packageName)) {
		return versionCache.get(packageName)!;
	}
	try {
		const registry = await getRegistry();
		const response = await fetch(`${registry}/${packageName}/latest`);
		if (!response.ok) throw new Error(`Failed to fetch version for ${packageName}`);
		const data = await response.json();
		versionCache.set(packageName, data.version);
		return data.version;
	} catch (error) {
		console.warn(picocolors.yellow(`Failed to fetch version for ${packageName}. Using "latest".`));
		return 'latest';
	}
}

let _registry: string;

export async function getRegistry(): Promise<string> {
	if (_registry) return _registry;
	const fallback = 'https://registry.npmjs.org';
	const packageManager = (await detectPackageManager(process.cwd()))?.name || 'npm';
	try {
		const { stdout } = await shell(packageManager, ['config', 'get', 'registry']);
		_registry = stdout?.trim()?.replace(/\/$/, '') || fallback;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		if (!new URL(_registry).host) _registry = fallback;
	} catch {
		_registry = fallback;
	}
	return _registry;
}

export async function getPackageVersionFromRegistry(packageName: string): Promise<string> {
	if (versionCache.has(packageName)) {
		return versionCache.get(packageName)!;
	}
	try {
		const version = await getLatestVersion(packageName);
		versionCache.set(packageName, version);
		return version;
	} catch (error) {
		console.warn(picocolors.yellow(`Failed to fetch version for ${packageName}. Using "unknown".`));
		return 'unknown';
	}
}
