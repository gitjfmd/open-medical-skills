/**
 * OMS Submission API - Cloudflare Worker
 *
 * Converts web form submissions into GitHub pull requests for the
 * Open Medical Skills marketplace.
 */

import { Octokit } from '@octokit/rest';
import type { Env, SubmissionData, ApiResponse, MedicalCategory } from './types';
import { VALID_CATEGORIES } from './types';

// ---------------------------------------------------------------------------
// Rate limiting (in-memory Map, 5 requests per IP per hour)
// Note: In production, use CF KV for persistence across instances.
// For single-instance MVP this is sufficient.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

interface RateEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 });
  return true;
}

// Periodically clean stale entries to prevent memory leaks
function pruneRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------

function corsHeaders(env: Env, origin: string | null): Headers {
  const headers = new Headers();
  // Only allow the configured origin (or match it against the request origin)
  if (origin && origin === env.ALLOWED_ORIGIN) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN);
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

function handleOptions(env: Env, request: Request): Response {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env, origin),
  });
}

// ---------------------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------------------

const MAX_NAME_LENGTH = 80;
const MAX_DISPLAY_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_URL_LENGTH = 300;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 10;
const MAX_VERSION_LENGTH = 20;
const MAX_LICENSE_LENGTH = 50;
const MAX_EVIDENCE_LENGTH = 2000;
const DEFAULT_SANITIZE_LENGTH = 500;

/** Strip HTML tags and limit string length */
function sanitize(str: string, maxLength = DEFAULT_SANITIZE_LENGTH): string {
  return str
    .replace(/<[^>]*>/g, '')  // strip HTML tags
    .replace(/\r/g, '')
    .trim()
    .slice(0, maxLength);
}

/** Escape a string for safe inclusion in a double-quoted YAML value */
function yamlEscape(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface ValidationResult {
  valid: boolean;
  errors: string[];
  submission?: SubmissionData;
}

function sanitizeInstallCommands(install: Record<string, unknown>): SubmissionData['install'] {
  return {
    npx: typeof install.npx === 'string' ? sanitize(install.npx, MAX_URL_LENGTH) : undefined,
    wget: typeof install.wget === 'string' ? sanitize(install.wget, MAX_URL_LENGTH) : undefined,
    git: typeof install.git === 'string' ? sanitize(install.git, MAX_URL_LENGTH) : undefined,
    docker: typeof install.docker === 'string' ? sanitize(install.docker, MAX_URL_LENGTH) : undefined,
  };
}

function validateSubmission(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const d = data as Record<string, unknown>;

  // Required fields
  const requiredStrings: Array<[string, string]> = [
    ['name', 'Name'],
    ['display_name', 'Display name'],
    ['description', 'Description'],
    ['author', 'Author'],
    ['repository', 'Repository URL'],
    ['category', 'Category'],
  ];

  for (const [field, label] of requiredStrings) {
    if (!d[field] || typeof d[field] !== 'string' || (d[field] as string).trim() === '') {
      errors.push(`${field}: ${label} is required`);
    }
  }

  // Name must be kebab-case
  if (typeof d.name === 'string' && d.name.trim() !== '') {
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(d.name)) {
      errors.push('name: Must be kebab-case (lowercase letters, numbers, hyphens)');
    }
    if (d.name.length > MAX_NAME_LENGTH) {
      errors.push(`name: Must be ${MAX_NAME_LENGTH} characters or fewer`);
    }
  }

  // Category must be one of the allowed values
  if (typeof d.category === 'string' && !VALID_CATEGORIES.includes(d.category as MedicalCategory)) {
    errors.push(`category: Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Repository must look like a URL
  if (typeof d.repository === 'string' && d.repository.trim() !== '') {
    try {
      const url = d.repository.startsWith('http')
        ? d.repository
        : `https://${d.repository}`;
      new URL(url);
    } catch {
      errors.push('repository: Must be a valid URL');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Build sanitized submission
  const installData = d.install as Record<string, unknown> | undefined;
  const submission: SubmissionData = {
    name: sanitize(d.name as string, MAX_NAME_LENGTH),
    display_name: sanitize(d.display_name as string, MAX_DISPLAY_NAME_LENGTH),
    description: sanitize(d.description as string, MAX_DESCRIPTION_LENGTH),
    author: sanitize(d.author as string, MAX_DISPLAY_NAME_LENGTH),
    repository: sanitize(d.repository as string, MAX_URL_LENGTH),
    category: d.category as MedicalCategory,
    tags: Array.isArray(d.tags)
      ? (d.tags as unknown[]).filter((t): t is string => typeof t === 'string').map(t => sanitize(t, MAX_TAG_LENGTH)).slice(0, MAX_TAGS_COUNT)
      : undefined,
    version: typeof d.version === 'string' ? sanitize(d.version, MAX_VERSION_LENGTH) : undefined,
    license: typeof d.license === 'string' ? sanitize(d.license, MAX_LICENSE_LENGTH) : undefined,
    install: typeof d.install === 'object' && d.install !== null && installData
      ? sanitizeInstallCommands(installData)
      : undefined,
    clinical_evidence: typeof d.clinical_evidence === 'string' ? sanitize(d.clinical_evidence, MAX_EVIDENCE_LENGTH) : undefined,
    safety_guardrails: typeof d.safety_guardrails === 'string' ? sanitize(d.safety_guardrails, MAX_EVIDENCE_LENGTH) : undefined,
  };

  return { valid: true, errors: [], submission };
}

// ---------------------------------------------------------------------------
// YAML generation
// ---------------------------------------------------------------------------

function generateYaml(data: SubmissionData): string {
  const today = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push(`name: "${yamlEscape(data.name)}"`);
  lines.push(`display_name: "${yamlEscape(data.display_name)}"`);
  lines.push(`description: "${yamlEscape(data.description)}"`);
  lines.push(`author: "${yamlEscape(data.author)}"`);
  lines.push(`repository: "${yamlEscape(data.repository)}"`);
  lines.push(`category: "${data.category}"`);

  if (data.tags && data.tags.length > 0) {
    lines.push(`tags: [${data.tags.map(t => `"${yamlEscape(t)}"`).join(', ')}]`);
  }

  lines.push(`version: "${data.version || '1.0.0'}"`);
  lines.push(`license: "${data.license || 'MIT'}"`);

  lines.push('install:');
  const install = data.install;
  let hasInstall = false;
  if (install?.npx) { lines.push(`  npx: "${yamlEscape(install.npx)}"`); hasInstall = true; }
  if (install?.wget) { lines.push(`  wget: "${yamlEscape(install.wget)}"`); hasInstall = true; }
  if (install?.git) { lines.push(`  git: "${yamlEscape(install.git)}"`); hasInstall = true; }
  if (install?.docker) { lines.push(`  docker: "${yamlEscape(install.docker)}"`); hasInstall = true; }
  if (!hasInstall) {
    lines.push(`  git: "git clone ${yamlEscape(data.repository)}"`);
  }

  lines.push(`verified: false`);
  lines.push(`reviewer: "Pending Review"`);
  lines.push(`date_added: "${today}"`);

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// GitHub operations via Octokit
// ---------------------------------------------------------------------------

async function createSubmissionPR(
  env: Env,
  submission: SubmissionData,
  yamlContent: string,
): Promise<string> {
  const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const timestamp = Date.now();
  const branchName = `submission/skill/${submission.name}-${timestamp}`;

  // 1. Get the SHA of the main branch
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: 'heads/main',
  });
  const baseSha = ref.object.sha;

  // 2. Create a new branch
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // 3. Create the YAML file on the new branch
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `content/skills/${submission.name}.yaml`,
    message: `Add skill submission: ${submission.display_name}`,
    content: btoa(unescape(encodeURIComponent(yamlContent))),
    branch: branchName,
  });

  // 4. Create the pull request
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    title: `[Skill Submission] ${submission.display_name}`,
    body: [
      '## Skill Submission',
      '',
      `**Name:** ${submission.name}`,
      `**Display Name:** ${submission.display_name}`,
      `**Author:** ${submission.author}`,
      `**Category:** ${submission.category}`,
      `**Repository:** ${submission.repository}`,
      '',
      '---',
      '',
      '*Submitted via the OMS web form. Awaiting physician review.*',
      '',
      '### Review Checklist',
      '- [ ] Automated validation passed',
      '- [ ] Maintainer review',
      '- [ ] Physician review',
      '- [ ] Security review',
      '- [ ] Approved for listing',
    ].join('\n'),
    head: branchName,
    base: 'main',
  });

  // 5. Add labels (best-effort, don't fail if labels don't exist)
  try {
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: pr.number,
      labels: ['submission', 'skill', 'pending-review', `category:${submission.category}`],
    });
  } catch {
    // Labels may not exist yet; non-critical
  }

  return pr.html_url;
}

// ---------------------------------------------------------------------------
// GitHub OAuth handlers
// ---------------------------------------------------------------------------

/**
 * POST /auth/github/callback
 *
 * Receives the authorization code from the client, exchanges it with GitHub
 * for an access token using the client secret (kept server-side), and returns
 * the access token to the client.
 */
async function handleAuthCallback(env: Env, request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(env, origin);
  headers.set('Content-Type', 'application/json');

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers },
      );
    }

    const { code } = body as { code?: string };
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { status: 400, headers },
      );
    }

    // Exchange the code for an access token with GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('GitHub token exchange failed:', tokenResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code with GitHub' }),
        { status: 502, headers },
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error: tokenData.error_description || tokenData.error || 'GitHub denied the token request',
        }),
        { status: 400, headers },
      );
    }

    return new Response(
      JSON.stringify({ access_token: tokenData.access_token }),
      { status: 200, headers },
    );
  } catch (err) {
    console.error('Auth callback error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers },
    );
  }
}

/**
 * GET /auth/user
 *
 * Validates the provided Bearer token against the GitHub API and returns
 * the authenticated user's info. Acts as a proxy so the client can verify
 * a stored token is still valid.
 */
async function handleAuthUser(env: Env, request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(env, origin);
  headers.set('Content-Type', 'application/json');

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid Authorization header' }),
      { status: 401, headers },
    );
  }

  const BEARER_PREFIX_LENGTH = 'Bearer '.length;
  const token = authHeader.slice(BEARER_PREFIX_LENGTH);

  try {
    const ghResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'OMS-Submission-API/1.0',
      },
    });

    if (!ghResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers },
      );
    }

    const userData = (await ghResponse.json()) as {
      login: string;
      id: number;
      avatar_url: string;
      name: string | null;
      html_url: string;
    };

    return new Response(
      JSON.stringify({
        login: userData.login,
        id: userData.id,
        avatar_url: userData.avatar_url,
        name: userData.name,
        html_url: userData.html_url,
      }),
      { status: 200, headers },
    );
  } catch (err) {
    console.error('Auth user error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to verify token' }),
      { status: 500, headers },
    );
  }
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

async function handleSubmission(env: Env, request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(env, origin);
  headers.set('Content-Type', 'application/json');

  try {
    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      const body: ApiResponse = {
        success: false,
        error: 'Rate limit exceeded. Maximum 5 submissions per hour.',
      };
      return new Response(JSON.stringify(body), { status: 429, headers });
    }

    // Parse body
    let data: unknown;
    try {
      data = await request.json();
    } catch {
      const body: ApiResponse = { success: false, error: 'Invalid JSON body' };
      return new Response(JSON.stringify(body), { status: 400, headers });
    }

    // Validate
    const result = validateSubmission(data);
    if (!result.valid) {
      const body: ApiResponse = {
        success: false,
        error: 'Validation failed',
        errors: result.errors,
      };
      return new Response(JSON.stringify(body), { status: 400, headers });
    }

    const submission = result.submission!;

    // Generate YAML and create PR
    const yamlContent = generateYaml(submission);
    const prUrl = await createSubmissionPR(env, submission, yamlContent);

    const body: ApiResponse = { success: true, pr_url: prUrl };
    return new Response(JSON.stringify(body), { status: 201, headers });
  } catch (err) {
    console.error('Submission error:', err);
    const body: ApiResponse = {
      success: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    };
    return new Response(JSON.stringify(body), { status: 500, headers });
  }
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Prune stale rate-limit entries on each request (cheap operation)
    pruneRateLimitMap();

    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(env, request);
    }

    // POST /api/submit
    if (request.method === 'POST' && url.pathname === '/api/submit') {
      return handleSubmission(env, request);
    }

    // POST /auth/github/callback — exchange OAuth code for access token
    if (request.method === 'POST' && url.pathname === '/auth/github/callback') {
      return handleAuthCallback(env, request);
    }

    // GET /auth/user — validate token and return user info
    if (request.method === 'GET' && url.pathname === '/auth/user') {
      return handleAuthUser(env, request);
    }

    // Everything else -> 404
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(env, origin);
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  },
};
