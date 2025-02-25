import { blue, bold, cyan, gray, magenta, underline, white } from 'picocolors'
import prompts, { Answers, PromptObject } from 'prompts';
import { PromptWithOverride } from '../src/actions/context.js';
import { checkWritePermissions } from '../src/utils/is-writeable.js';
import { getInitCommand } from '../src/utils/package-manager-commands.js';
import { getOnline } from '../src/utils/is-online.js';
import { installDependencies } from '../src/actions/install.js';
import { log } from '../src/utils/logger.js';
import path from 'node:path';
import process from 'node:process';
import { setupStylelintConfig } from '../src/actions/config.js';
import { validatePackageJson } from '../src/utils/package-utils.js';
import { vi } from 'vitest';

async function setupFixtureEnvironment(fixtureName: string) {
  const fixturePath = path.join(__dirname, 'fixtures', fixtureName);

  vi.mocked(process.cwd).mockReturnValue(fixturePath);

  switch (fixtureName) {
    case 'no-write-permissions':
      vi.mocked(checkWritePermissions).mockResolvedValueOnce(false);
      break;
    case 'no-internet':
      vi.mocked(getOnline).mockResolvedValueOnce(false);
      break;
    case 'fail-npm-install':
      vi.mocked(installDependencies).mockImplementationOnce(async (context) => {
        log('Failed to install dependencies: npm install failed');
        log('Please check your network connection and try again.\n');
        context.exit(1);
        });
      break;
    case 'no-package-json':
      vi.mocked(validatePackageJson).mockImplementationOnce(async (pm) => {
        const error = new Error('ENOENT') as NodeJS.ErrnoException;

        error.code = 'ENOENT';

        log(
          `${bold('Missing package.json')}\n\n` +
            `${white('Create one with:')}\n` +
            `${cyan('1.')} Run ${bold(getInitCommand(pm ?? 'npm').command)}\n` +
            `${cyan('2.')} Follow prompts\n\n` +
            `${gray('Documentation:')} ${underline(blue(getInitCommand(pm ?? 'npm').docs))}`,
        );

        process.exit(1);
      });
      break;
  }

  // Handle fixtures with existing Stylelint configurations
  if (fixtureName.startsWith('stylelint-config-exists')) {
    // Determine the configuration file path based on fixture name
    let configPath;

    if (fixtureName.includes('package-json')) {
      configPath = path.join(fixturePath, 'package.json');
    } else if (fixtureName.includes('subdir')) {
      configPath = path.join(fixturePath, '.config', 'stylelintrc.json');
    } else if (fixtureName.includes('config-js')) {
      configPath = path.join(fixturePath, 'stylelint.config.js');
    } else if (fixtureName.includes('config-mjs')) {
      configPath = path.join(fixturePath, 'stylelint.config.mjs');
    } else if (fixtureName.includes('config-cjs')) {
      configPath = path.join(fixturePath, 'stylelint.config.cjs');
    } else if (fixtureName.includes('rc-json')) {
      configPath = path.join(fixturePath, '.stylelintrc.json');
    } else if (fixtureName.includes('rc-yaml')) {
      configPath = path.join(fixturePath, '.stylelintrc.yaml');
    } else if (fixtureName.includes('rc-yml')) {
      configPath = path.join(fixturePath, '.stylelintrc.yml');
    } else if (fixtureName.includes('rc-js')) {
      configPath = path.join(fixturePath, '.stylelintrc.js');
    } else if (fixtureName.includes('rc-mjs')) {
      configPath = path.join(fixturePath, '.stylelintrc.mjs');
    } else if (fixtureName.includes('rc-cjs')) {
      configPath = path.join(fixturePath, '.stylelintrc.cjs');
    } else {
      configPath = path.join(fixturePath, '.stylelintrc');
    }

    vi.mocked(setupStylelintConfig).mockImplementationOnce(async (context) => {
      log(
        `${bold('Oops! Configuration file already exists')}\n\n` +
          `${gray('We found:')} ${cyan(configPath)}\n\n` +
          `${white('What to do next?')}\n` +
          `${magenta('›')} ${white('Rename the existing file (e.g. "stylelint.config.old")')}\n` +
          `${magenta('›')} ${white('Or delete it if no longer needed')}\n\n` +
            `${white('Then run this command again to create a new config!')}\n\n` +
            `${gray('🔍 Want to preview changes without writing files? Try')} ${cyan('--dry-run')}`,
        );
        context.exit(1);
      });
    }

  vi.mocked(log).mockClear();

  return { fixturePath };
}

export { setupFixtureEnvironment };

type MockPrompt = PromptWithOverride & {
	mockResolvedValueOnce: (value: Answers<string>) => void;
	mockRejectedValueOnce: (error: Error) => void;
	mockImplementationOnce: (
		implementation: (
			questions: PromptObject | Array<PromptObject>,
			options?: prompts.Options,
		) => Promise<Answers<string>>,
	) => void;
};

export { MockPrompt };
