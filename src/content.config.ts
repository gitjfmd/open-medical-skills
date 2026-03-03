import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const skills = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './content/skills' }),
  schema: z.object({
    name: z.string(),
    display_name: z.string(),
    description: z.string(),
    author: z.string(),
    repository: z.string().url(),
    category: z.enum([
      'diagnosis',
      'treatment',
      'lab-imaging',
      'pharmacy',
      'emergency',
      'surgery',
      'nursing',
      'pediatrics',
      'mental-health',
      'public-health',
      'research',
      'education',
      'administrative',
      'clinical-research-summarizing',
    ]),
    tags: z.array(z.string()).default([]),
    version: z.string().optional(),
    license: z.string().optional(),
    type: z.literal('skill').default('skill'),
    install: z
      .object({
        npx: z.string().optional(),
        wget: z.string().optional(),
        git: z.string().optional(),
        docker: z.string().optional(),
      })
      .optional(),
    evidence_level: z
      .enum(['high', 'moderate', 'low', 'expert-opinion'])
      .default('moderate'),
    safety_classification: z
      .enum(['safe', 'caution', 'restricted'])
      .default('safe'),
    specialty: z.array(z.string()).default([]),
    reviewer: z.string().default('Pending Review'),
    date_added: z.string(),
    verified: z.boolean().default(false),
    script_content: z.string().optional(),
    script_language: z.string().default('python'),
    skill_md: z.string().optional(),
  }),
});

const plugins = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './content/plugins' }),
  schema: z.object({
    name: z.string(),
    display_name: z.string(),
    description: z.string(),
    author: z.string(),
    repository: z.string().url(),
    category: z.enum([
      'diagnosis',
      'treatment',
      'lab-imaging',
      'pharmacy',
      'emergency',
      'surgery',
      'nursing',
      'pediatrics',
      'mental-health',
      'public-health',
      'research',
      'education',
      'administrative',
      'clinical-research-summarizing',
    ]),
    tags: z.array(z.string()).default([]),
    version: z.string().optional(),
    license: z.string().optional(),
    type: z.literal('plugin').default('plugin'),
    install: z
      .object({
        npx: z.string().optional(),
        wget: z.string().optional(),
        git: z.string().optional(),
        docker: z.string().optional(),
      })
      .optional(),
    evidence_level: z
      .enum(['high', 'moderate', 'low', 'expert-opinion'])
      .default('moderate'),
    safety_classification: z
      .enum(['safe', 'caution', 'restricted'])
      .default('safe'),
    specialty: z.array(z.string()).default([]),
    reviewer: z.string().default('Pending Review'),
    date_added: z.string(),
    verified: z.boolean().default(false),
    requires: z.array(z.string()).default([]),
    provides: z.array(z.string()).default([]),
    min_platform_version: z.string().optional(),
  }),
});

export const collections = { skills, plugins };
