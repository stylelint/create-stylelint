#!/usr/bin/env node

/* eslint-disable n/prefer-global/process */
/* eslint-disable n/no-process-exit */

const currentVersion = process.versions.node;
const requiredMajorVersion = parseInt(currentVersion.split('.')[0], 10);
const minimumMajorVersion = 18;

if (requiredMajorVersion < minimumMajorVersion) {
	process.stderr(`Error: Node.js v${currentVersion} is not supported.`);
	process.stderr(`This tool requires Node.js v${minimumMajorVersion} or higher.`);
    process.stderr('Please update your Node.js installation:');
    process.stderr('- Visit: https://nodejs.org/');
    process.stderr('- Or use a version manager like nvm: https://github.com/nvm-sh/nvm');
	process.exit(1)
}

import('./dist/index.js').then(({ main }) => main());
