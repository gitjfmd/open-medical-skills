/**
 * Chat-to-Create-Skill — TypeScript Interfaces
 *
 * Defines the data structures used throughout the skill creator feature.
 */

/** The 14 valid medical categories from the OMS content schema. */
export type MedicalCategory =
  | 'diagnosis'
  | 'treatment'
  | 'lab-imaging'
  | 'pharmacy'
  | 'emergency'
  | 'surgery'
  | 'nursing'
  | 'pediatrics'
  | 'mental-health'
  | 'public-health'
  | 'research'
  | 'education'
  | 'administrative'
  | 'clinical-research-summarizing';

/** Evidence level classifications. */
export type EvidenceLevel = 'high' | 'moderate' | 'low' | 'expert-opinion';

/** Safety classifications. */
export type SafetyClassification = 'safe' | 'caution' | 'restricted';

/** Identifiers for the standard skill sections. */
export type SectionId =
  | 'title'
  | 'description'
  | 'quick-install'
  | 'what-it-does'
  | 'clinical-use-cases'
  | 'safety-evidence'
  | 'example-usage'
  | 'technical-details'
  | 'references'
  | 'custom';

/** A single section in the skill being authored. */
export interface SkillSection {
  id: SectionId | string;
  displayName: string;
  required: boolean;
  content: string;
  status: 'empty' | 'draft' | 'refined' | 'accepted';
  customTitle?: string;
}

/** A message in the chat interface. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sectionId: SectionId | string;
  timestamp: number;
}

/** LLM provider configuration. */
export interface LLMProviderConfig {
  name: string;
  endpoint: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/** The full state of a skill being created. */
export interface SkillDraft {
  id: string;
  skillName: string;
  sections: SkillSection[];
  messages: ChatMessage[];
  provider: LLMProviderConfig;
  metadata: SkillMetadata;
  createdAt: number;
  updatedAt: number;
}

/** Metadata fields that map to the content YAML schema. */
export interface SkillMetadata {
  name: string;
  displayName: string;
  description: string;
  author: string;
  repository: string;
  category: MedicalCategory;
  tags: string[];
  version: string;
  license: string;
  evidenceLevel: EvidenceLevel;
  safetyClassification: SafetyClassification;
  specialty: string[];
  dateAdded: string;
}

/** Request payload sent to the LLM proxy. */
export interface LLMRequest {
  sectionId: SectionId | string;
  userContent: string;
  systemPrompt: string;
  previousSections: Record<string, string>;
  provider: LLMProviderConfig;
}

/** Response from the LLM proxy. */
export interface LLMResponse {
  refinedContent: string;
  tokensUsed: number;
  model: string;
}

/** Generated output files. */
export interface SkillOutput {
  skillMd: string;
  contentYaml: string;
  skillName: string;
}
