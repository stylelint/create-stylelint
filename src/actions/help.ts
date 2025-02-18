import { blue, dim } from 'picocolors';
import { log } from '../utils/logger.js';

export function showHelp(): void {
	const INDENT = {
		SECTION: ' '.repeat(2),
		OPTION: ' '.repeat(2),
	};

	const SPACES = {
		// Alignment for the second line:
		// Calculated as:
		// - "Usage: "          =  7 chars
		// - "create-stylelint" = 15 chars
		// - trailing space     =  2 spaces
		// Total                = 24 spaces
		SECOND_LINE: ' '.repeat(24),
	};

log(`Usage: create-stylelint [-v | --version] [-h | --help] [--dry-run] [--no-install | --no-color]
${SPACES.SECOND_LINE}[--use-npm | --use-pnpm | --use-yarn | --use-bun | --use-deno]

Options:
${INDENT.OPTION}--use-npm         ${dim('Use npm as package manager')}
${INDENT.OPTION}--use-pnpm        ${dim('Use pnpm as package manager')}
${INDENT.OPTION}--use-yarn        ${dim('Use yarn as package manager')}
${INDENT.OPTION}--use-bun         ${dim('Use bun as package manager')}
${INDENT.OPTION}--use-deno        ${dim('Use deno as package manager')}

${INDENT.OPTION}--dry-run         ${dim('Preview changes without applying them')}
${INDENT.OPTION}--no-install      ${dim('Skip dependency installation')}
${INDENT.OPTION}--no-color        ${dim('Disable color')}

${INDENT.OPTION}-h, --help        ${dim('Show this help message')}
${INDENT.OPTION}-v, --version     ${dim('Show version information')}

Examples:
${INDENT.OPTION}create-stylelint
${INDENT.OPTION}create-stylelint --use-npm --no-install

${dim('Need help?')} ${blue('https://github.com/stylelint/create-stylelint')}
`);
}
