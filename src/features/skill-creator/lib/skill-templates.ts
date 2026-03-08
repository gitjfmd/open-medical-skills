/**
 * skill-templates.ts — Default section templates and structure definitions.
 *
 * Defines the standard SKILL.md sections, their order, display names, and
 * placeholder content that guides users on what to write in each section.
 *
 * Based on analysis of 49 existing skills in the OMS repository.
 * See: .internal/research/skill-structure.md
 */

import type { SkillSection, SectionId, MedicalCategory } from '../types';

/** Standard skill sections in canonical order. */
export const DEFAULT_SECTIONS: SkillSection[] = [
  {
    id: 'title',
    displayName: 'Title',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'description',
    displayName: 'Description',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'quick-install',
    displayName: 'Quick Install',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'what-it-does',
    displayName: 'What It Does',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'clinical-use-cases',
    displayName: 'Clinical Use Cases',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'safety-evidence',
    displayName: 'Safety & Evidence',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'example-usage',
    displayName: 'Example Usage',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'technical-details',
    displayName: 'Technical Details',
    required: true,
    content: '',
    status: 'empty',
  },
  {
    id: 'references',
    displayName: 'References',
    required: true,
    content: '',
    status: 'empty',
  },
];

/** Placeholder/guide text shown in the input for each section. */
export const SECTION_PLACEHOLDERS: Record<SectionId, string> = {
  title:
    'Enter a clear, descriptive name for your skill (e.g., "Drug Interaction Safety Checker")',
  description:
    'Describe what this skill does in 1-2 paragraphs. What problem does it solve? Who is it for?',
  'quick-install':
    'Provide install commands. What package name will this use? (e.g., npx skills add owner/repo --skill name)',
  'what-it-does':
    'List 4-6 key capabilities as bullet points. What specific things can this skill do?',
  'clinical-use-cases':
    'Describe 3-4 real-world clinical scenarios where this skill would be used. Include specific patient contexts.',
  'safety-evidence':
    'What is the safety classification (safe/caution/restricted)? What is the evidence level (high/moderate/low/expert-opinion)? Justify each.',
  'example-usage':
    'Show 1-2 concrete examples with input commands and expected output. Include realistic clinical data.',
  'technical-details':
    'Category, author name, license (MIT recommended), version, specialty areas.',
  references:
    'List academic references: journal articles, clinical guidelines, textbooks, databases.',
  custom: 'Describe what this custom section should contain.',
};

/** Valid medical categories for the category selector. */
export const MEDICAL_CATEGORIES: { value: MedicalCategory; label: string }[] = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'lab-imaging', label: 'Lab & Imaging' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'public-health', label: 'Public Health' },
  { value: 'research', label: 'Research' },
  { value: 'education', label: 'Education' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'clinical-research-summarizing', label: 'Clinical Research Summarizing' },
];

/** Create a new custom section with a user-provided title. */
export function createCustomSection(title: string): SkillSection {
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id,
    displayName: title,
    required: false,
    content: '',
    status: 'empty',
    customTitle: title,
  };
}
