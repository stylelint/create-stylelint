import { execSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { URL } from 'node:url';

function getProxy(): string | undefined {
	const envProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
	if (envProxy) {
		return envProxy;
	}

	try {
		const npmProxy = execSync('npm config get https-proxy', { encoding: 'utf-8' }).trim();
		return npmProxy !== 'null' ? npmProxy : undefined;
	} catch (error) {
		console.warn('Failed to retrieve proxy from npm config:', error);
		return undefined;
	}
}

export async function getOnline(): Promise<boolean> {
	try {
		await lookup('registry.yarnpkg.com');
		return true;
	} catch (dnsError) {
		console.warn('DNS lookup for failed:', dnsError);
	}

	const proxy = getProxy();
	if (!proxy) return false;

	try {
		const proxyUrl = new URL(proxy);
		await lookup(proxyUrl.hostname);
		return true;
	} catch (error) {
		console.warn('Proxy validation failed:', error);
		return false;
	}
}
