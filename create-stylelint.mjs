#!/usr/bin/env node

/* eslint-disable n/prefer-global/process */
 

const currentVersion = process.versions.node;
const requiredMajorVersion = parseInt(currentVersion.split('.')[0], 10);
const minimumMajorVersion = 18;

if (requiredMajorVersion < minimumMajorVersion) {
	process.stderr(`Error: Node.js v${currentVersion} is not supported.`);
	process.stderr(`This tool requires Node.js v${minimumMajorVersion} or higher.`);
    process.stderr('Please update your Node.js installation by following the instructions at https://nodejs.org/en/download');
	process.exit(1)
}

import('./dist/index.js').then(({ main }) => main());
