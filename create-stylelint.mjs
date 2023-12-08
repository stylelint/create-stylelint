#!/usr/bin/env node
/* eslint no-console: 'off' */
/* eslint n/no-process-exit: 'off' */

import process from 'node:process';
import { readFileSync } from 'node:fs';

import semver from 'semver';

const currentVersion = process.versions.node;
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

if (!semver.satisfies(currentVersion, pkg.engines.node)) {
	console.error(`Unsupported Node.js version (v${currentVersion})`);
	console.error(`Install a Node.js version within "${pkg.engines.node}" and then try again.`);
	process.exit(1);
}

import('./src/index.mjs').then(({ main }) => main());
