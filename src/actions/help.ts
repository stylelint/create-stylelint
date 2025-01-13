import { bold } from 'picocolors';
import { log } from '$/output/format.js';

export function showHelp(): void {
	log(`
${' '.repeat(2)}${bold('Usage: create-stylelint [options]')}

${' '.repeat(2)}${bold('Options:')}
${' '.repeat(2)}  -h, --help           Show help information
${' '.repeat(2)}  -v, --version        Output the version number
${' '.repeat(2)}  --use-npm            Explicitly use npm for installation
${' '.repeat(2)}  --use-pnpm           Explicitly use pnpm for installation
${' '.repeat(2)}  --use-yarn           Explicitly use Yarn for installation
${' '.repeat(2)}  --use-bun            Explicitly use Bun for installation
${' '.repeat(2)}  --dry-run            Run the command without making any changes
${' '.repeat(2)}  --skip-install       Skip installing packages

${' '.repeat(2)}${bold('Example:')}
${' '.repeat(2)}  $ create-stylelint --version
${' '.repeat(2)}  $ create-stylelint --use-yarn --dry-run
`);
}
