import chalk from 'chalk';

const CATEGORY_COLORS = {
  'diagnosis': '#3B82F6',
  'treatment': '#10B981',
  'lab-imaging': '#8B5CF6',
  'pharmacy': '#F59E0B',
  'emergency': '#EF4444',
  'surgery': '#EC4899',
  'nursing': '#06B6D4',
  'pediatrics': '#F97316',
  'mental-health': '#A855F7',
  'public-health': '#14B8A6',
  'research': '#6366F1',
  'education': '#84CC16',
  'administrative': '#64748B',
  'clinical-research-summarizing': '#0EA5E9',
};

const EVIDENCE_LABELS = {
  'high': chalk.bold.green('HIGH'),
  'moderate': chalk.bold.yellow('MODERATE'),
  'low': chalk.bold.red('LOW'),
  'expert-opinion': chalk.bold.gray('EXPERT OPINION'),
};

const SAFETY_LABELS = {
  'safe': chalk.bold.green('SAFE'),
  'caution': chalk.bold.yellow('CAUTION'),
  'restricted': chalk.bold.red('RESTRICTED'),
};

export function formatCategory(category) {
  const color = CATEGORY_COLORS[category] || '#64748B';
  return chalk.hex(color)(category);
}

export function formatEvidence(level) {
  return EVIDENCE_LABELS[level] || chalk.gray(level);
}

export function formatSafety(classification) {
  return SAFETY_LABELS[classification] || chalk.gray(classification);
}

export function formatVerified(verified) {
  return verified ? chalk.green('Verified') : chalk.gray('Pending Review');
}

export function formatTags(tags) {
  if (!tags || tags.length === 0) return chalk.gray('none');
  return tags.map(t => chalk.hex('#0D9488')(`#${t}`)).join(' ');
}

export function formatSkillRow(skill, index) {
  const num = chalk.gray(`${String(index + 1).padStart(3)}. `);
  const name = chalk.bold.white(skill.name);
  const cat = formatCategory(skill.category);
  const verified = skill.verified ? chalk.green(' [verified]') : '';
  return `${num}${name}  ${cat}${verified}`;
}

const DIVIDER_WIDTH = 56;

function formatInstallCommands(install) {
  const lines = [];
  lines.push(`  ${chalk.bold.white('Install Commands:')}`);
  if (install.npx) {
    lines.push(`    ${chalk.gray('npx:')}  ${chalk.hex('#0D9488')(install.npx)}`);
  }
  if (install.git) {
    lines.push(`    ${chalk.gray('git:')}  ${chalk.hex('#0D9488')(install.git)}`);
  }
  if (install.wget) {
    lines.push(`    ${chalk.gray('wget:')} ${chalk.hex('#0D9488')(install.wget)}`);
  }
  if (install.docker) {
    lines.push(`    ${chalk.gray('docker:')} ${chalk.hex('#0D9488')(install.docker)}`);
  }
  return lines;
}

export function formatSkillDetail(skill) {
  const divider = chalk.gray('\u2500'.repeat(DIVIDER_WIDTH));
  const lines = [
    '',
    divider,
    `  ${chalk.bold.hex('#0D9488')(skill.display_name)}`,
    divider,
    '',
    `  ${chalk.gray('Name:')}          ${chalk.white(skill.name)}`,
    `  ${chalk.gray('Description:')}   ${chalk.white(skill.description)}`,
    `  ${chalk.gray('Author:')}        ${chalk.white(skill.author)}`,
    `  ${chalk.gray('Category:')}      ${formatCategory(skill.category)}`,
    `  ${chalk.gray('Evidence:')}      ${formatEvidence(skill.evidence_level)}`,
    `  ${chalk.gray('Safety:')}        ${formatSafety(skill.safety_classification)}`,
    `  ${chalk.gray('Verified:')}      ${formatVerified(skill.verified)}`,
    `  ${chalk.gray('Reviewer:')}      ${chalk.white(skill.reviewer || 'Pending Review')}`,
    `  ${chalk.gray('Tags:')}          ${formatTags(skill.tags)}`,
  ];

  if (skill.specialty && skill.specialty.length > 0) {
    lines.push(`  ${chalk.gray('Specialty:')}     ${chalk.white(skill.specialty.join(', '))}`);
  }
  if (skill.version) {
    lines.push(`  ${chalk.gray('Version:')}       ${chalk.white(skill.version)}`);
  }
  if (skill.license) {
    lines.push(`  ${chalk.gray('License:')}       ${chalk.white(skill.license)}`);
  }

  lines.push(`  ${chalk.gray('Date Added:')}    ${chalk.white(skill.date_added)}`);
  lines.push(`  ${chalk.gray('Repository:')}    ${chalk.cyan(skill.repository)}`);

  if (skill.install) {
    lines.push('');
    lines.push(...formatInstallCommands(skill.install));
  }

  lines.push('', divider, '');
  return lines.join('\n');
}
