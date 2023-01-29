#!/usr/bin/env node
/* eslint-disable no-process-exit */
/* eslint-disable no-console */
'use strict';

const currentVersion = process.versions.node;

import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line node/no-unpublished-import
import semver from 'semver';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(dirname, 'package.json').toString()));

if (!semver.satisfies(currentVersion, pkg.engines.node)) {
	console.error(`Node.js v${currentVersion} is out of date and unsupported!`);
	console.error(`Please use a Node.js version within "${pkg.engines.node}".`);
	process.exit(1);
}

// eslint-disable-next-line node/no-unsupported-features/es-syntax
import('./src/index.mjs').then(({ main }) => main());
