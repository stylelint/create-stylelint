import esbuild from 'esbuild';
import process from 'node:process';

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		platform: 'node',
		outfile: 'dist/index.js',
		format: 'esm',
		external: [
			'arg',
			'cosmiconfig',
			'ora',
			'package-manager-detector',
			'picocolors',
			'prompts',
			'tinyexec',
			'validate-npm-package-name',
		],
	})
	.catch(() => process.exit(1));
