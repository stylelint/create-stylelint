import { blue, dim } from 'picocolors';
import { log } from '../utils/logger.js';

const INDENT = '  ';
const PM_OPTIONS = ['npm', 'pnpm', 'yarn', 'bun', 'deno'] as const;

export function showHelp(): void {
    const usageLine = 'Usage: create-stylelint [-v | --version] [-h | --help] [--dry-run] [--no-install | --no-color]';
    const pmOptions = PM_OPTIONS.map(pm => `--use-${pm}`).join(' | ');

log(`${usageLine}
${' '.repeat(24)}[${pmOptions}]

Options:
${createPMOptions()}

${createOption('--dry-run', 'Preview changes without applying them')}
${createOption('--no-install', 'Skip dependency installation')}
${createOption('--no-color', 'Disable color')}

${createOption('-h, --help', 'Show this help message')}
${createOption('-v, --version', 'Show version information')}

Examples:
${INDENT}create-stylelint
${INDENT}create-stylelint --use-npm --no-install

${dim('Need help?')} ${blue('https://github.com/stylelint/create-stylelint')}
`);
}

function createOption(flags: string, description: string) {
    return `${INDENT}${flags.padEnd(16)} ${dim(description)}`;
}

function createPMOptions() {
    return PM_OPTIONS.map(pm =>
        createOption(`--use-${pm}`, `Use ${pm} as package manager`)
    ).join('\n');
}
