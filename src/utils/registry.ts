import { detect } from 'package-manager-detector/detect';
import { x } from 'tinyexec';

export async function resolvePackageVersion(packageName: string): Promise<string> {
	return fetchFromNpmRegistry(packageName);
}

async function fetchFromNpmRegistry(packageName: string): Promise<string> {
	try {
		const registry = await detectPackageRegistry();
		const encodedName = encodeURIComponent(packageName).replace(/^%40/, '@');
		// eslint-disable-next-line n/no-unsupported-features/node-builtins
		const response = await fetch(`${registry}/${encodedName}/latest`);

		if (!response.ok) {
			throw new Error(`HTTP Error ${response.status}: Version resolve failed for ${packageName}`);
		}

		const data = await response.json();

		if (typeof data?.version !== 'string') {
			throw new Error(`Invalid version response: ${JSON.stringify(data)}`);
		}

		return data.version;
	} catch (error) {
		throw new Error(
			`Failed to resolve version for ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

let _registryUrl: string;

export async function detectPackageRegistry(): Promise<string> {
	if (_registryUrl) return _registryUrl;

	const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
	const packageManagerInfo = await detect();
	const packageManager = packageManagerInfo?.agent ?? 'npm';

	try {
		const { stdout } = await x(packageManager, ['config', 'get', 'registry']);

		_registryUrl = stdout?.trim()?.replace(/\/$/, '') || DEFAULT_REGISTRY;

		// Validate URL format
		try {
			new URL(_registryUrl);
		} catch {
			_registryUrl = DEFAULT_REGISTRY;
		}
	} catch {
		_registryUrl = DEFAULT_REGISTRY;
	}

	return _registryUrl;
}
