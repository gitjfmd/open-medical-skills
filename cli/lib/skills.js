import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let _skillsCache = null;

export function loadSkillsIndex() {
  if (_skillsCache) return _skillsCache;

  const indexPath = join(__dirname, '..', 'data', 'skills-index.json');
  try {
    const raw = readFileSync(indexPath, 'utf-8');
    _skillsCache = JSON.parse(raw);
    return _skillsCache;
  } catch (err) {
    const isFileNotFound = err instanceof Error && 'code' in err && err.code === 'ENOENT';
    if (isFileNotFound) {
      console.error(
        'Skills index not found. Run "npm run generate-index" or "node scripts/generate-cli-index.js" first.'
      );
    } else {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Failed to load skills index:', errorMessage);
    }
    process.exit(1);
  }
}

export function findSkill(name) {
  const skills = loadSkillsIndex();
  return skills.find(
    (s) => s.name === name || s.display_name.toLowerCase() === name.toLowerCase()
  );
}

export function searchSkills(query) {
  const skills = loadSkillsIndex();
  const q = query.toLowerCase();

  return skills.filter((s) => {
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.display_name.toLowerCase().includes(q)) return true;
    if (s.description.toLowerCase().includes(q)) return true;
    if (s.category.toLowerCase().includes(q)) return true;
    if (s.tags && s.tags.some((t) => t.toLowerCase().includes(q))) return true;
    if (s.specialty && s.specialty.some((sp) => sp.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function filterByCategory(category) {
  const skills = loadSkillsIndex();
  return skills.filter((s) => s.category === category);
}

export function getCategories() {
  const skills = loadSkillsIndex();
  const cats = {};
  for (const s of skills) {
    if (!cats[s.category]) {
      cats[s.category] = 0;
    }
    cats[s.category]++;
  }
  return cats;
}
