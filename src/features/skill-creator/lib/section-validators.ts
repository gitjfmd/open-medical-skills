/**
 * section-validators.ts — Client-side validation for each skill section.
 *
 * Validates section content before it can be marked as "accepted" and before
 * the final skill output is generated. Validation rules are based on the
 * content schema in src/content.config.ts and patterns observed in existing skills.
 *
 * TODO: Implement during feature development phase.
 */

import type { SectionId, SkillMetadata } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate a single section's content. */
export function validateSection(
  sectionId: SectionId | string,
  content: string
): ValidationResult {
  // TODO: Implement per-section validation
  // - title: must be non-empty, reasonable length (3-100 chars)
  // - description: must be non-empty, at least 50 chars
  // - quick-install: must contain at least one code block
  // - what-it-does: must contain bullet points (- or *)
  // - clinical-use-cases: must have at least 3 scenarios
  // - safety-evidence: must mention safety classification AND evidence level
  // - example-usage: must contain at least one code block with example
  // - technical-details: must mention category, author, license
  // - references: must have at least 2 references
  throw new Error('Not implemented — placeholder for feature development');
}

/** Validate the complete skill metadata before output generation. */
export function validateMetadata(metadata: SkillMetadata): ValidationResult {
  // TODO: Implement metadata validation matching the Zod schema
  // - name: kebab-case, non-empty
  // - displayName: non-empty
  // - description: non-empty
  // - author: non-empty
  // - repository: valid URL
  // - category: one of 14 valid categories
  // - dateAdded: YYYY-MM-DD format
  // - evidenceLevel: one of 4 valid values
  // - safetyClassification: one of 3 valid values
  throw new Error('Not implemented — placeholder for feature development');
}

/** Validate all sections are complete before generating output. */
export function validateAllSections(
  sections: Array<{ id: string; content: string; required: boolean }>
): ValidationResult {
  // TODO: Check all required sections have content and pass individual validation
  throw new Error('Not implemented — placeholder for feature development');
}
