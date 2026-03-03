import chalk from 'chalk';

const BANNER = `
${chalk.bold.hex('#0D9488')('  ╔═══════════════════════════════════════════════╗')}
${chalk.bold.hex('#0D9488')('  ║')}  ${chalk.bold.white('Open Medical Skills')}${chalk.gray(' (OMS)')}                   ${chalk.bold.hex('#0D9488')('║')}
${chalk.bold.hex('#0D9488')('  ║')}  ${chalk.gray('Physician-reviewed AI agent skills')}            ${chalk.bold.hex('#0D9488')('║')}
${chalk.bold.hex('#0D9488')('  ╚═══════════════════════════════════════════════╝')}
`;

const BANNER_COMPACT = `${chalk.bold.hex('#0D9488')('OMS')} ${chalk.gray('|')} ${chalk.white('Open Medical Skills')}`;

export function printBanner() {
  console.log(BANNER);
}

export function printBannerCompact() {
  console.log(`\n${BANNER_COMPACT}\n`);
}
