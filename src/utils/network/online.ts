import { execSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';
import { URL } from 'node:url';
import { log } from '$/output/format.js';

/**
 * Retrieves the HTTPS proxy configuration either from env variables or npm config.
 */
function resolveHttpsProxy(): string | undefined {
	const envProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
	if (envProxy) {
		return envProxy;
	}

	try {
		const npmProxy = execSync('npm config get https-proxy', { encoding: 'utf-8' }).trim();
		return npmProxy !== 'null' ? npmProxy : undefined;
	} catch (error) {
		log(`Failed to retrieve proxy from npm config: ${error}\n`);
		return undefined;
	}
}

/**
 * Check if the system is online by attempting DNS lookups
 * @see https://nodejs.org/api/dns.html
 */
export async function checkNetworkConnection(): Promise<boolean> {
	try {
		await lookup('registry.yarnpkg.com');
		return true;
	} catch (dnsError) {
		log(`DNS lookup failed: ${dnsError}\n`);
	}

	const proxy = resolveHttpsProxy();
	if (!proxy) return false;

	try {
		const proxyUrl = new URL(proxy);
		await lookup(proxyUrl.hostname);
		return true;
	} catch (error) {
		log(`Proxy validation failed: ${error}\n`);
		return false;
	}
}
