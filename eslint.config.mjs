// @ts-expect-error -- No declaration file
import stylelintConfig from 'eslint-config-stylelint';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';

export default [
	...stylelintConfig,
	...tseslint.configs.recommended,
	{
		files: ['tests/**'],
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
	},

	{
		rules: {
			'n/no-process-exit': 'off',
		},
	},
];
