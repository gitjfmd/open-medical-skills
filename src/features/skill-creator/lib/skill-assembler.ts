/**
 * skill-assembler.ts — Assembles completed sections into SKILL.md and content YAML.
 *
 * Takes the user's accepted section content and metadata, then generates:
 * 1. A SKILL.md file with YAML front matter (Claude Code compatible)
 * 2. A content YAML file matching the Zod schema in src/content.config.ts
 *
 * Output format follows the established patterns from the 49 existing skills
 * in the OMS repository.
 *
 * TODO: Implement during feature development phase.
 */

import type { SkillSection, SkillMetadata, SkillOutput } from '../types';

/**
 * Generate the complete SKILL.md file from sections and metadata.
 *
 * Output structure:
 * ---
 * name: skill-name
 * description: >
 *   Multi-line description from the description section.
 * ---
 *
 * # Display Name
 * [description paragraph]
 * ## Quick Install
 * [install commands]
 * ## What It Does
 * [capability list]
 * ...
 * ---
 * *This skill is part of Open Medical Skills...*
 */
export function assembleSkillMd(
  sections: SkillSection[],
  metadata: SkillMetadata
): string {
  // TODO: Implement SKILL.md assembly
  throw new Error('Not implemented — placeholder for feature development');
}

/**
 * Generate the content YAML file matching the Zod schema.
 *
 * Fields are extracted from metadata and section content.
 * Uses js-yaml for proper YAML serialization.
 */
export function assembleContentYaml(
  sections: SkillSection[],
  metadata: SkillMetadata
): string {
  // TODO: Implement content YAML assembly
  throw new Error('Not implemented — placeholder for feature development');
}

/**
 * Generate both output files from the completed skill draft.
 */
export function assembleSkillOutput(
  sections: SkillSection[],
  metadata: SkillMetadata
): SkillOutput {
  return {
    skillMd: assembleSkillMd(sections, metadata),
    contentYaml: assembleContentYaml(sections, metadata),
    skillName: metadata.name,
  };
}
