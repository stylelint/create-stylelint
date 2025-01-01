import picocolors from 'picocolors';

export function showHelpAction(): void {
    console.log(`
${picocolors.bold('Usage: create-stylelint [options]')}

${picocolors.bold('Options:')}
  -h, --help           Show help information
  --dry-run            Run the command without making any changes
  --use-npm            Explicitly use npm for installation
  --use-pnpm           Explicitly use pnpm for installation
  --use-yarn           Explicitly use Yarn for installation
  --use-bun            Explicitly use Bun for installation
  --skip-install       Skip installing packages
  -v, --version        Output the version number
`);
}
