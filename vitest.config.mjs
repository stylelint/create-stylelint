import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.test.{js,mjs,cjs}'],
		watchExclude: ['**/node_modules/**', 'test/fixtures/**'],
	},
});
