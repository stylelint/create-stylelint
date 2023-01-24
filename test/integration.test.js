// eslint-disable-next-line node/no-unpublished-import
import { describe, expect, it } from 'vitest';
import { execaSync } from 'execa';

const inputs = {
	stylelintConfigExists: 'test/fixtures/stylelint-config-exists',
};

function getProjectRoot(context) {
	return context.meta.file.filepath.replace(context.meta.file.name, '');
}

function setup(pathToTest, projectRoot, args = []) {
	return execaSync('node', [`${projectRoot}create-stylelint.mjs`, ...args], {
		cwd: `${projectRoot}${pathToTest}`,
	});
}

describe('stylelint-create', () => {
	it('should not proceed if a Stylelint config already exists in the directory', (context) => {
		const projectRoot = getProjectRoot(context);

		try {
			setup(inputs.stylelintConfigExists, projectRoot);
		} catch (error) {
			expect(error.failed).toBe(true);
			expect(error.message).toMatch('config(s) already exist');
		}
	});
});
