// @ts-ignore
import stylelintConfig from 'eslint-config-stylelint';

export default [
	...stylelintConfig,
	{
		rules: {
			// TODO: Remove when we drop support for Node.js 20
			'n/no-unsupported-features/node-builtins': [
				'error',
				{
					ignores: ['util.styleText', 'test.describe', 'import.meta.dirname'],
				},
			],
		},
	},
];
