#!/usr/bin/env node

/**
 * generate-cli-index.js
 *
 * Reads all YAML skill files from content/skills/ and generates a lightweight
 * JSON index at cli/data/skills-index.json for use by the OMS CLI.
 *
 * Usage:
 *   node scripts/generate-cli-index.js
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, 'content', 'skills');
const OUTPUT_DIR = join(ROOT, 'cli', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'skills-index.json');

/**
 * Minimal YAML parser for our simple flat skill YAML files.
 * Handles strings, booleans, arrays (both inline and multiline), and nested objects (one level).
 * No external dependency needed for our known YAML structure.
 */
function parseSimpleYaml(text) {
  const result = {};
  const lines = text.split('\n');
  let currentKey = null;
  let currentObj = null;
  let inArray = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      continue;
    }

    // Detect array item (- value)
    const arrayMatch = line.match(/^  - (.+)$/);
    if (arrayMatch && inArray) {
      let val = arrayMatch[1].trim();
      val = val.replace(/^["']|["']$/g, '');
      result[inArray].push(val);
      continue;
    }

    // Detect nested object property (2-space indent key: value)
    const nestedMatch = line.match(/^  (\w+):\s*(.+)$/);
    if (nestedMatch && currentObj) {
      const key = nestedMatch[1];
      let val = nestedMatch[2].trim();
      val = val.replace(/^["']|["']$/g, '');
      result[currentObj][key] = val;
      inArray = null;
      continue;
    }

    // Reset nested state when we hit a top-level key
    if (!line.startsWith(' ')) {
      currentObj = null;
      inArray = null;
    }

    // Top-level key: value
    const topMatch = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (topMatch) {
      const key = topMatch[1];
      let val = topMatch[2].trim();

      // Empty value means start of object or array
      if (val === '') {
        // Peek at next line to determine if array or object
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
        if (nextLine.match(/^  - /)) {
          result[key] = [];
          inArray = key;
          currentObj = null;
        } else {
          result[key] = {};
          currentObj = key;
          inArray = null;
        }
        continue;
      }

      // Remove quotes
      val = val.replace(/^["']|["']$/g, '');

      // Inline array: [item1, item2]
      const inlineArrayMatch = val.match(/^\[(.+)\]$/);
      if (inlineArrayMatch) {
        result[key] = inlineArrayMatch[1]
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        inArray = null;
        currentObj = null;
        continue;
      }

      // Booleans
      if (val === 'true') {
        result[key] = true;
      } else if (val === 'false') {
        result[key] = false;
      } else {
        result[key] = val;
      }

      inArray = null;
      currentObj = null;
    }
  }

  return result;
}

function main() {
  console.log('Generating OMS CLI skills index...\n');

  if (!existsSync(SKILLS_DIR)) {
    console.error(`Error: Skills directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = readdirSync(SKILLS_DIR).filter(
    (f) => f.endsWith('.yaml') || f.endsWith('.yml')
  );

  console.log(`Found ${files.length} skill files.\n`);

  const skills = [];

  for (const file of files) {
    const filePath = join(SKILLS_DIR, file);
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed = parseSimpleYaml(raw);

      // Extract the fields we need for the CLI index
      skills.push({
        name: parsed.name || file.replace(/\.ya?ml$/, ''),
        display_name: parsed.display_name || parsed.name || file.replace(/\.ya?ml$/, ''),
        description: parsed.description || '',
        author: parsed.author || 'Unknown',
        repository: parsed.repository || '',
        category: parsed.category || 'clinical-research-summarizing',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        version: parsed.version || null,
        license: parsed.license || null,
        evidence_level: parsed.evidence_level || 'moderate',
        safety_classification: parsed.safety_classification || 'safe',
        specialty: Array.isArray(parsed.specialty) ? parsed.specialty : [],
        reviewer: parsed.reviewer || 'Pending Review',
        date_added: parsed.date_added || 'Unknown',
        verified: parsed.verified === true,
        install: parsed.install || null,
      });

      console.log(`  + ${parsed.name || file}`);
    } catch (err) {
      console.error(`  ! Failed to parse ${file}: ${err.message}`);
    }
  }

  // Sort by name
  skills.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(OUTPUT_FILE, JSON.stringify(skills, null, 2), 'utf-8');

  console.log(`\nGenerated ${OUTPUT_FILE}`);
  console.log(`Total: ${skills.length} skills indexed.\n`);
}

main();
