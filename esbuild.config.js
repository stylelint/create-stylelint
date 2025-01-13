import esbuild from 'esbuild';

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
			'picocolors',
			'preferred-pm',
			'prompts',
			'semver',
			'terminal-link',
		],
	})
	.catch(() => process.exit(1));
