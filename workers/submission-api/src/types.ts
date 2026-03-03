/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  ALLOWED_ORIGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

/**
 * Valid medical categories (14 + "other")
 */
export const VALID_CATEGORIES = [
  'clinical',
  'diagnostic',
  'administrative',
  'research',
  'education',
  'pharmacology',
  'radiology',
  'pathology',
  'surgery',
  'mental-health',
  'pediatrics',
  'emergency-medicine',
  'public-health',
  'telemedicine',
] as const;

export type MedicalCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Submission data from the web form
 */
export interface SubmissionData {
  name: string;
  display_name: string;
  description: string;
  author: string;
  repository: string;
  category: MedicalCategory;
  tags?: string[];
  version?: string;
  license?: string;
  install?: {
    npx?: string;
    wget?: string;
    git?: string;
    docker?: string;
  };
  clinical_evidence?: string;
  safety_guardrails?: string;
}

/**
 * API response
 */
export interface ApiResponse {
  success: boolean;
  pr_url?: string;
  error?: string;
  errors?: string[];
}
