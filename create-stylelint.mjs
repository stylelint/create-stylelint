#!/usr/bin/env node
/* eslint-disable no-process-exit */
/* eslint-disable no-console */
'use strict';

const currentVersion = process.versions.node;
const requiredMajorVersion = parseInt(currentVersion.split('.')[0], 10);
const minimumMajorVersion = 14;

if (requiredMajorVersion < minimumMajorVersion) {
	console.error(`Node.js v${currentVersion} is out of date and unsupported!`);
	console.error(`Please use Node.js v${minimumMajorVersion} or higher.`);
	process.exit(1);
}

// eslint-disable-next-line node/no-unsupported-features/es-syntax
import('./src/index.mjs').then(({ main }) => main());
