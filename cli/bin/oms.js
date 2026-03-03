#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { printBanner, printBannerCompact } from '../lib/banner.js';
import {
  formatSkillRow,
  formatSkillDetail,
  formatCategory,
  formatEvidence,
  formatSafety,
} from '../lib/format.js';
import {
  loadSkillsIndex,
  findSkill,
  searchSkills,
  filterByCategory,
  getCategories,
} from '../lib/skills.js';

const REPO = 'gitjfmd/open-medical-skills';
const DEFAULT_AGENT = 'claude-code';
const MAX_DESCRIPTION_WIDTH = 72;

const program = new Command();

program
  .name('oms')
  .description('Open Medical Skills CLI — install physician-reviewed AI agent skills')
  .version('1.0.0')
  .hook('preAction', () => {});

// ──────────────────────────────────────────────────────────────────
// oms install <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('install <skill-name>')
  .description('Install a physician-reviewed medical AI skill')
  .option('-a, --agent <agent>', 'Target agent (claude-code, cursor, windsurf, *)', DEFAULT_AGENT)
  .option('--dry-run', 'Show the install command without executing it')
  .action((skillName, opts) => {
    printBannerCompact();

    const skill = findSkill(skillName);
    if (!skill) {
      console.error(chalk.red(`  Error: Skill "${skillName}" not found.`));
      console.log(chalk.gray(`  Run ${chalk.white('oms list')} to see available skills.\n`));
      process.exit(1);
    }

    // Safety warning for restricted skills
    if (skill.safety_classification === 'restricted') {
      console.log(
        chalk.red.bold('  WARNING: ') +
          chalk.red('This skill has a RESTRICTED safety classification.')
      );
      console.log(
        chalk.red('  It should only be used under direct physician supervision.\n')
      );
    } else if (skill.safety_classification === 'caution') {
      console.log(
        chalk.yellow.bold('  NOTICE: ') +
          chalk.yellow('This skill has a CAUTION safety classification.')
      );
      console.log(
        chalk.yellow('  Review outputs carefully before clinical application.\n')
      );
    }

    const agent = opts.agent === '*' ? "'*'" : opts.agent;
    const cmd = `npx skills add ${REPO} --skill ${skill.name} -a ${agent}`;

    console.log(`  ${chalk.gray('Skill:')}   ${chalk.bold.white(skill.display_name)}`);
    console.log(`  ${chalk.gray('Agent:')}   ${chalk.white(opts.agent)}`);
    console.log(`  ${chalk.gray('Command:')} ${chalk.hex('#0D9488')(cmd)}`);
    console.log('');

    if (opts.dryRun) {
      console.log(chalk.gray('  (dry run — command not executed)\n'));
      return;
    }

    console.log(chalk.gray('  Installing...\n'));

    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log('');
      console.log(chalk.green.bold('  Installed successfully.'));
      console.log(
        chalk.gray(`  Skill "${skill.name}" is now available in ${opts.agent}.\n`)
      );
    } catch (err) {
      console.error('');
      console.error(chalk.red('  Installation failed.'));
      console.error(
        chalk.gray('  You can try manually: ') + chalk.white(cmd) + '\n'
      );
      process.exit(1);
    }
  });

// ──────────────────────────────────────────────────────────────────
// oms list
// ──────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all available OMS skills')
  .option('-c, --category <category>', 'Filter by medical category')
  .option('--json', 'Output as JSON')
  .action((opts) => {
    printBannerCompact();

    let skills;
    if (opts.category) {
      skills = filterByCategory(opts.category);
      if (skills.length === 0) {
        console.error(
          chalk.red(`  No skills found in category "${opts.category}".`)
        );
        console.log(
          chalk.gray(`  Run ${chalk.white('oms categories')} to see valid categories.\n`)
        );
        process.exit(1);
      }
      console.log(
        chalk.gray(`  Category: `) + formatCategory(opts.category) + '\n'
      );
    } else {
      skills = loadSkillsIndex();
    }

    if (opts.json) {
      console.log(JSON.stringify(skills, null, 2));
      return;
    }

    console.log(
      chalk.gray(`  ${skills.length} skill${skills.length !== 1 ? 's' : ''} available\n`)
    );

    for (let i = 0; i < skills.length; i++) {
      console.log(`  ${formatSkillRow(skills[i], i)}`);
      console.log(`       ${chalk.gray(truncateText(skills[i].description, MAX_DESCRIPTION_WIDTH))}`);
    }

    console.log('');
    console.log(
      chalk.gray(`  Use ${chalk.white('oms info <skill-name>')} for details.`)
    );
    console.log(
      chalk.gray(
        `  Use ${chalk.white('oms install <skill-name>')} to install.\n`
      )
    );
  });

// ──────────────────────────────────────────────────────────────────
// oms search <query>
// ──────────────────────────────────────────────────────────────────
program
  .command('search <query>')
  .description('Search skills by name, description, category, or tag')
  .option('--json', 'Output as JSON')
  .action((query, opts) => {
    printBannerCompact();

    const results = searchSkills(query);

    if (results.length === 0) {
      console.log(chalk.yellow(`  No skills matched "${query}".`));
      console.log(
        chalk.gray(`  Try a broader search or run ${chalk.white('oms list')}.\n`)
      );
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log(
      chalk.gray(
        `  ${results.length} result${results.length !== 1 ? 's' : ''} for "${chalk.white(query)}"\n`
      )
    );

    for (let i = 0; i < results.length; i++) {
      console.log(`  ${formatSkillRow(results[i], i)}`);
      console.log(`       ${chalk.gray(truncateText(results[i].description, MAX_DESCRIPTION_WIDTH))}`);
    }

    console.log('');
    console.log(
      chalk.gray(`  Use ${chalk.white('oms info <skill-name>')} for details.\n`)
    );
  });

// ──────────────────────────────────────────────────────────────────
// oms info <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('info <skill-name>')
  .description('Show detailed information about a skill')
  .option('--json', 'Output as JSON')
  .action((skillName, opts) => {
    printBannerCompact();

    const skill = findSkill(skillName);
    if (!skill) {
      console.error(chalk.red(`  Error: Skill "${skillName}" not found.`));
      console.log(chalk.gray(`  Run ${chalk.white('oms search <query>')} to find skills.\n`));
      process.exit(1);
    }

    if (opts.json) {
      console.log(JSON.stringify(skill, null, 2));
      return;
    }

    console.log(formatSkillDetail(skill));
  });

// ──────────────────────────────────────────────────────────────────
// oms categories
// ──────────────────────────────────────────────────────────────────
program
  .command('categories')
  .description('List all medical skill categories')
  .action(() => {
    printBannerCompact();

    const cats = getCategories();
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);

    console.log(chalk.gray(`  ${sorted.length} categories\n`));

    const maxLen = Math.max(...sorted.map(([c]) => c.length));

    for (const [category, count] of sorted) {
      const padded = category.padEnd(maxLen + 2);
      const bar = chalk.hex('#0D9488')('\u2588'.repeat(count));
      console.log(`  ${formatCategory(padded)} ${bar} ${chalk.gray(count)}`);
    }

    console.log('');
    console.log(
      chalk.gray(
        `  Use ${chalk.white('oms list --category <name>')} to filter.\n`
      )
    );
  });

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

/** Truncate a string to maxLength, appending ellipsis if needed. */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ──────────────────────────────────────────────────────────────────
// Parse
// ──────────────────────────────────────────────────────────────────
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  printBanner();
  program.outputHelp();
  console.log('');
}
