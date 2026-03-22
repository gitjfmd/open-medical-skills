# Open Medical Skills (OMS)

> A curated marketplace of medical AI skills and plugins, compiled and maintained by physicians for physicians and the healthcare industry.

## Purpose

Open Medical Skills is a trusted hub for discovering, sharing, and installing medical AI agent skills and plugins. Unlike general-purpose skill marketplaces, every skill here is:

- **Physician-reviewed** - Vetted by medical professionals before listing
- **Evidence-informed** - Based on clinical guidelines and best practices
- **Safely designed** - With appropriate guardrails for medical use
- **Open source** - Transparent and auditable by the community

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 5 (static output, islands architecture) |
| **UI** | React 19 islands (interactive), `.astro` (static) |
| **Styling** | TailwindCSS 4 via `@tailwindcss/vite` |
| **Search** | Pagefind (client-side, build-time index) |
| **Content** | YAML files in `content/skills/` and `content/plugins/` |
| **Submission API** | Cloudflare Worker (`workers/submission-api/`) |
| **CLI** | Node.js CLI tool (`cli/`) |
| **Package Manager** | pnpm 10.x |
| **Deployment** | Cloudflare Pages (static) + CF Workers (API) |

## Content Schema

### 14 Medical Categories

`diagnosis`, `treatment`, `lab-imaging`, `pharmacy`, `emergency`, `surgery`, `nursing`, `pediatrics`, `mental-health`, `public-health`, `research`, `education`, `administrative`, `clinical-research-summarizing`

### Evidence Levels

`high` (green), `moderate` (amber), `low` (red), `expert-opinion` (gray)

### Safety Classifications

`safe` (green), `caution` (amber), `restricted` (red)

## Content Format (Skills)

Each skill is defined as a YAML file in `content/skills/`:

```yaml
name: "skill-name"
display_name: "Skill Display Name"
description: "Brief description"
author: "author-name"
repository: "github.com/owner/repo"
category: "diagnosis|treatment|lab-imaging|pharmacy|emergency|..."
tags: ["tag1", "tag2"]
evidence_level: "high|moderate|low|expert-opinion"
safety: "safe|caution|restricted"
install:
  npx: "npx skills add owner/repo@skill"
  wget: "wget https://..."
  git: "git clone https://..."
verified: true
reviewer: "Dr. Name, MD"
date_added: "2026-03-02"
```

## Directory Structure

```
open-medical-skills/
├── .github/                     # GitHub Actions, issue/PR templates
│   ├── workflows/
│   │   ├── deploy.yml           # CF Pages auto-deploy
│   │   └── validate-submission.yml  # PR validation
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE/
├── cli/                         # Node.js CLI tool
│   ├── bin/                     # CLI entrypoint
│   ├── lib/                     # CLI commands
│   ├── data/                    # CLI data files
│   └── package.json
├── content/                     # Content data (YAML)
│   ├── skills/                  # Skill definitions (.yaml)
│   └── plugins/                 # Plugin definitions (.yaml)
├── logo/                        # Brand assets (SVG)
├── plugins/                     # Full plugin source code
│   ├── aws-healthlake-fhir/
│   ├── healthcare-mcp-comprehensive/
│   ├── holy-bio-research-suite/
│   ├── medikode-medical-coding-platform/
│   └── openemr-integration/
├── public/                      # Static assets (favicon, logos, wordmark)
├── scripts/                     # Build & pipeline automation
├── skills/                      # Full skill source code (SKILL.md each)
├── src/                         # Website source code
│   ├── components/              # UI components (Astro + React islands)
│   ├── content.config.ts        # Astro Content Layer API (Zod schemas)
│   ├── features/                # Feature modules (skill creator, etc.)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/                     # Utilities, API helpers
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── about.astro
│   │   ├── submit.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── skills/              # Skills listing + detail pages
│   │   ├── plugins/             # Plugins listing
│   │   └── auth/                # Auth callback pages
│   └── styles/
│       └── global.css           # TailwindCSS 4 @theme, design tokens
├── workers/                     # Cloudflare Workers
│   └── submission-api/          # Submission form -> GitHub PR
│       └── src/index.ts
├── CLAUDE.md                    # THIS FILE
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Website Navigation

| Page | Purpose |
|------|---------|
| **Home** | Browse all skills & plugins, search, featured items, category filters |
| **About** | Mission statement, physician-maintained curation, legitimacy & trust |
| **Skills** | Filter and browse standalone agent skills only |
| **Plugins** | Filter and browse full plugins only |
| **How to Submit** | Submission pipeline for technical & non-technical users |
| **Privacy** | Privacy policy (IntelMedica.ai) |
| **Terms** | Terms of use (IntelMedica.ai) |

## Installation Methods Supported

- `npx` install
- `wget` / `curl` download
- Direct GitHub clone
- One-click install buttons on web

## Submission Workflow

1. **Technical (GitHub users)**: Use the issue template or submit a direct PR with a properly formatted YAML file and skill source directory.
2. **Non-Technical (Web form)**: Fill out the guided submission form on the website. The form auto-generates a correctly formatted PR for review.

All submissions are reviewed by physician maintainers before being listed.

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Contributing

### Submitting a Skill

1. Fork the repository
2. Create a new YAML file in `content/skills/` following the content format above
3. Create a matching directory in `skills/` with a `SKILL.md` file
4. Submit a pull request

### Submitting a Plugin

1. Fork the repository
2. Create a new YAML file in `content/plugins/`
3. Create a matching directory in `plugins/` with full source code, README, and LICENSE
4. Submit a pull request

### Content Guidelines

- All medical content must include evidence-level and safety classifications
- Clinical claims should reference published guidelines or peer-reviewed literature
- Skills should include a disclaimer about not replacing professional medical judgment
- Follow the existing YAML schema defined in `src/content.config.ts`

## Maintained By

Compiled and maintained by a physician, for physicians and the healthcare industry.
**Organization**: IntelMedica.ai

<!-- GSD:project-start source:PROJECT.md -->
## Project

**OMS Repository Split & CI/CD Infrastructure**

Open Medical Skills is a curated marketplace of physician-reviewed medical AI skills and plugins, built on Astro 5 with React 19 islands and deployed to Cloudflare Pages. This project restructures the monorepo into two separate GitHub repositories (public content + private website) with strict CI/CD pipelines, branch protection, auto-deployment, and proper orchestration documentation following IntelMedica/SECSOLS company standards.

**Core Value:** The content catalog (skills, plugins, CLI) must be publicly accessible and contribution-friendly, while the website infrastructure remains private and secure — with strict CI gates preventing broken deploys and unauthorized merges.

### Constraints

- **Tech stack**: Astro 5 + React 19 + TailwindCSS 4 + CF Pages/Workers — no changes to core stack
- **Security**: No secrets in public repo. OAuth tokens, CF API keys stay in private repo only
- **Compliance**: Medical content validation (disclaimers, safety, CDS claims) must run on every PR to main in public repo
- **Deployment**: Auto-deploy only through CI on merge to main in private repo — no manual `wrangler deploy`
- **Branch model**: `main` ← `dev` ← `feature/*` in both repos, enforced by GitHub Actions + branch protection
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- **TypeScript** 5.x - Main language for Cloudflare Workers and source code
- **JavaScript (ES2020+)** - Astro framework, Node.js CLI, GitHub Actions scripts
- **Python** 3.13 - Build validation, YAML parsing in GitHub workflows
- **YAML** - Content definitions (skills, plugins) in `content/skills/` and `content/plugins/`
- **Bash** - Shell scripts for automation
## Runtime
- **Node.js** 22.x (primary development and CLI runtime)
- **Cloudflare Workers** (Edge runtime for submission-api and search-api)
- **Browser** (Astro static output + React islands)
- **pnpm** 10.29.3 (monorepo package manager)
- **Lockfile:** `pnpm-lock.yaml` present
## Frameworks
- **Astro** 5.18.0 - Static site generation with islands architecture
- **React** 19.2.4 - Interactive islands (form components, skill creator)
- **React DOM** 19.2.4 - DOM rendering
- **@tailwindcss/vite** 4.2.1 - Vite plugin for Tailwind CSS 4 (not @astrojs/tailwind)
- **@astrojs/react** 4.4.2 - React integration for Astro
- **@astrojs/sitemap** 3.7.0 - Auto-generated sitemap at build time
- **Zod** (via Astro Content Layer) - Schema validation for skills/plugins YAML files
- **js-yaml** 4.1.1 - YAML parsing (client-side in skill creator)
- **react-markdown** 10.1.0 - Markdown rendering in UI components
- **Pagefind** 1.4.0 - Client-side full-text search (build-time indexed)
- **Commander** 13.1.0 - CLI argument parsing
- **Chalk** 5.4.1 - Terminal color output
## Workers & Serverless
- **Framework:** Cloudflare Workers (edge computing runtime)
- **Main language:** TypeScript 5
- **Package:** `workers/submission-api/`
- **Entry:** `src/index.ts`
- **Configuration:** `wrangler.toml`
- **Dependencies:**
- **Framework:** Cloudflare Workers (edge computing runtime)
- **Main language:** TypeScript 5
- **Package:** `workers/search-api/`
- **Entry:** `src/index.ts`
- **Configuration:** `wrangler.toml`
- **Dependencies:**
## Key Dependencies
- `astro` 5.18.0 - Why it matters: Core SSG framework for the website
- `react` 19.2.4 - Why it matters: Interactive UI islands (skill creator, forms)
- `tailwindcss` 4.2.1 - Why it matters: CSS framework via `@tailwindcss/vite` plugin
- `@octokit/rest` 21.x - Why it matters: GitHub API integration for skill submissions (PR creation)
- `wrangler` 4.x - Why it matters: Cloudflare Workers deployment CLI
- `pagefind` 1.4.0 - Client-side search indexing at build time
- `js-yaml` 4.1.1 - YAML parsing for skill definitions and CLI operations
- `zod` (Astro built-in) - Schema validation for content collections
- `commander` 13.1.0 - CLI argument parsing for the OMS CLI tool
- `chalk` 5.4.1 - Terminal color output for CLI
- `@types/react` 19.2.14 - TypeScript types for React
- `@types/react-dom` 19.2.3 - TypeScript types for React DOM
- `@types/js-yaml` 4.0.9 - TypeScript types for js-yaml
## Configuration
- **Local dev:** Uses `.env` (see `.env.example` for template)
- **Production:** Secrets via Wrangler (`wrangler secret put`)
- **Build environment:** `NODE_ENV=production` set in CI/CD
- `GITHUB_OWNER` - Repository owner (default: `gitjfmd`)
- `GITHUB_REPO` - Repository name (default: `open-medical-skills`)
- `GITHUB_TOKEN` - GitHub PAT (secret, required for PR creation)
- `GITHUB_CLIENT_ID` - GitHub OAuth App client ID (secret)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret (secret)
- `ALLOWED_ORIGIN` - CORS origin (dev: `http://localhost:4321`, prod: `https://openmedica.us`)
- `OAUTH_REDIRECT_URI` - OAuth callback URL
- `QDRANT_URL` - Qdrant vector database endpoint (default: `http://localhost:6333`)
- `SURREALDB_URL` - SurrealDB graph database endpoint (default: `http://localhost:8000`)
- `SUPABASE_URL` - Supabase REST API endpoint (default: `http://localhost:8000`)
- `OLLAMA_URL` - Ollama embeddings server (default: `http://localhost:11434`)
- `QDRANT_COLLECTION` - Qdrant collection name (default: `tu_tools_nomic`)
- `EMBED_MODEL` - Embedding model (default: `nomic-embed-text`)
- `ALLOWED_ORIGIN` - CORS origin
- `astro.config.mjs` - Astro configuration
- `tsconfig.json` - TypeScript strict config (extends `astro/tsconfigs/strict`)
- `tailwind.config.ts` - NOT used; Tailwind 4 uses CSS `@theme {}` instead
- `wrangler.toml` - Cloudflare Workers configuration (submission-api and search-api)
- `tsconfig.json` per worker - TypeScript configuration
## Platform Requirements
- **Node.js** ≥ 18.0.0 (CLI), 22.x recommended for dev server
- **pnpm** 10.29.3
- **Python** 3.x (for YAML validation in GitHub Actions)
- **PostgreSQL** 17 (optional, for local testing against K8s database)
- **Qdrant** 1.x (optional, for local semantic search testing)
- **Ollama** (optional, for local embeddings testing)
- **Deployment targets:**
- **Static site:** Cloudflare Pages (auto-deploys on push to `main` or `dev`)
- **APIs:** Cloudflare Workers with environment bindings for Qdrant, Supabase, Ollama
- **Database:** PostgreSQL 17 on K8s (namespace: `oms`, NodePort: 30500)
- **MCP Toolbox:** K8s service for database queries (NodePort: 30500)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase with `.tsx` extension (e.g., `SearchBar.tsx`, `ThemeToggle.tsx`, `SkillOutputModal.tsx`)
- Utility/utility functions: camelCase with `.ts` extension (e.g., `llm-proxy.ts`, `skill-assembler.ts`, `auth.ts`)
- Astro components: PascalCase with `.astro` extension (e.g., `Header.astro`, `SkillGrid.astro`, `BaseLayout.astro`)
- YAML content files: kebab-case with `.yaml` or `.yml` extension (e.g., `skill-name.yaml`)
- Config files: camelCase with `.ts` (e.g., `tsconfig.json`, `astro.config.mjs`)
- Exported functions: camelCase (e.g., `exchangeCode()`, `fetchUser()`, `saveAuth()`, `handleSemanticSearch()`)
- Internal/private functions: camelCase with leading underscore prefix for cache/state management (e.g., `_skillsCache`, `_apiAvailable`)
- Component event handlers: camelCase with prefix `handle` (e.g., `handleKeyDown()`, `handleClick()`, `toggleTheme()`)
- Async functions that fetch data: `fetch*` or `handle*` prefix (e.g., `fetchUser()`, `handleValidate()`)
- State variables: camelCase (e.g., `isDarkMode`, `isLoggedIn`, `submitted`, `submitting`)
- Type/interface names: PascalCase (e.g., `GitHubUser`, `SkillSection`, `LLMProviderConfig`)
- Constants: UPPER_SNAKE_CASE for configuration values (e.g., `STORAGE_KEY_TOKEN`, `API_BASE_URL`, `GITHUB_CLIENT_ID`)
- Array/collection names: plural or suffixed (e.g., `results`, `skills`, `sections`, `messages`)
- Local identifiers: single letters acceptable in loops (e.g., `s`, `i`, `h`)
- Interfaces: PascalCase with `I` prefix optional (e.g., `GitHubUser`, `SkillSection`, `ChatMessage`)
- Type aliases: PascalCase (e.g., `MedicalCategory`, `EvidenceLevel`, `SafetyClassification`)
- Union type literals: kebab-case (e.g., `'lab-imaging'`, `'clinical-research-summarizing'`)
- Record/map types: Record<string, Type> pattern (e.g., `Record<Category, string>`)
## Code Style
- No ESLint/Prettier config in repository (not enforced)
- Implied style: 2-space indentation, single quotes for strings, semicolons
- JSX: Attributes on same line or new lines for readability
- Trailing commas: Observed in multi-line arrays/objects
- No linting framework configured or enforced
- TypeScript strict mode enabled in `tsconfig.json`: `extends: "astro/tsconfigs/strict"`
- JSX import source configured: `jsxImportSource: "react"`
- TSDoc/JSDoc style for exported functions and types: `/** ... */`
- Section dividers used: `// ---------------------------------------------------------------------------`
- Single-line comments: `//` for inline explanations
- No automatic documentation generation observed
- Consistent use of destructuring for imports and function parameters (e.g., `const { query, setQuery } = ...`)
- Object destructuring with type annotations in interfaces (e.g., `{ id: string; display_name: string }`)
## Import Organization
- Not explicitly configured in `tsconfig.json`
- Relative paths used throughout: `../layouts`, `../lib`, `./components`
- Explicit `import type` syntax used for type-only imports (e.g., `import type { LLMProviderConfig } from '../types'`)
- Preserves runtime vs. type-level distinction clearly
## Error Handling
- Try-catch blocks used for async operations and file I/O
- Error type narrowing: `err instanceof Error ? err.message : String(err)`
- Error code checking: `'code' in err && err.code === 'ENOENT'`
- JSON parse errors caught silently with fallback: `.catch(() => ({}))`
- Custom error messages passed to constructors: `throw new Error("message")`
- HTTP error checking: `if (!response.ok) { ... throw new Error(...) }`
- JSON extraction from error responses: `const data = await response.json().catch(() => ({}))`
- Errors logged with context: `console.error('Context:', err)`
- Conditional checks before operations (e.g., `if (!q.trim())`, `if (!data.access_token)`)
- Default/fallback values in parsing: `parseInt(..., 10)` with base argument, `Math.min(value, max)`
## Logging
- Error logging: `console.error('operation failed:', err)` with context
- No info/debug/warn variants observed
- Only errors logged in user-facing code
- `console.error()` for request processing errors (e.g., `console.error('Search API error:', err)`)
- No structured logging observed
## Comments and Documentation
- Complex algorithms or non-obvious logic (e.g., OAuth flow explanation in `auth.ts`)
- Configuration constants explained with rationale
- Security considerations noted (e.g., "client secret never touches browser")
- Flow diagrams for multi-step processes
- Used for exported functions with parameters and return types documented
- Example: `/** Generate a random state parameter to prevent CSRF attacks. */`
- Not used for private functions or obvious helpers
- Files divided with section dividers: `// ---------------------------------------------------------------------------`
- Sections labeled: `// Configuration`, `// Types`, `// Persistence`, `// Error Handling`
## Function Design
- Average function: 10-30 lines
- Helper functions extracted: `generateState()`, `verifyState()`, `corsHeaders()`
- Prefer object parameter for multiple arguments (e.g., `{ category, domain, limit, offset }`)
- Props interfaces for React components: `interface Props { skills: SkillEntry[] }`
- Functions return data directly or async Promises
- Void return for side-effect functions (e.g., `saveAuth()`, `toggleTheme()`)
- Type annotations explicit: `Promise<string>`, `boolean`, `SkillEntry[]`
## Module Design
- Named exports for utility functions: `export function getToken()`, `export const CATEGORIES`
- Default export for React components: `export default function SearchBar(...)`
- Type exports: `export type MedicalCategory = ...`
- Mixed: Some modules export both default and named (React island + helper)
- Minimal use; content schemas in single file `src/content.config.ts`
- No `index.ts` re-exports observed
- Auth module (`auth.ts`): Logical grouping by feature (token, user, state, persistence)
- Categories module (`categories.ts`): Constants + styling maps together
- Skill creator types (`types.ts`): All interfaces in one file
- Handler modules: One function per file (`handlers/semantic.ts`, `handlers/graph.ts`)
## Astro-Specific Patterns
- Import statements in YAML front matter (between `---` markers)
- Const declarations for computed data
- Async operations allowed (e.g., `getCollection()`)
- `client:load` for interactive islands that must hydrate on page load (SearchBar, CategoryFilter, ThemeToggle)
- `client:only="react"` for client-only features (chat interface, forms)
- Islands architecture: mix `.astro` (static) and `.tsx` (interactive)
## Framework-Specific (React)
- `useState` for simple state (query, results, open, highlighted)
- `useEffect` for side effects (localStorage, event listeners, debouncing)
- `useRef` for DOM access (input focus, container refs)
- `useCallback` for memoized functions to optimize re-renders
- Interface-based prop typing: `interface Props { ... }`
- Destructuring in function signature: `function Component({ prop1, prop2 }: Props)`
- Ternary operators for simple cases: `isDarkMode ? <sun /> : <moon />`
- Short-circuit with `&&`: `{query && <button>Clear</button>}`
- JSX inline or extracted to variables
## TypeScript
- Strict mode enabled (`astro/tsconfigs/strict`)
- Explicit return type annotations on functions: `(): Promise<Response>`, `(): boolean`
- Generic types used: `<HTMLInputElement>`, `<HTMLDivElement>`, `Record<string, number>`
- `instanceof Error` checks in catch blocks
- Property existence checks: `'code' in err`
- Type assertions minimal but used: `as Record<string, string>`, `as CustomEvent<GitHubUser>`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Static site generation (Astro 5 with React island components)
- Content-driven (YAML-based skill/plugin definitions in `content/`)
- Client-side rendering for interactive features (search, filtering, form submission)
- Serverless APIs for dynamic operations (GitHub OAuth, skill submission, semantic search)
- Edge-deployed on Cloudflare Pages + Workers
## Layers
- Purpose: Render skill/plugin marketplace with filtering, search, and skill creation UI
- Location: `src/pages/`, `src/components/`, `src/layouts/`
- Contains: Astro pages, React islands, static components
- Depends on: Content collections (Astro Content Layer API), auth library, category utilities
- Used by: Web browsers, crawlers (for SEO via sitemap)
- Purpose: Define skills and plugins as queryable YAML data with schema validation
- Location: `content/skills/`, `content/plugins/`
- Contains: YAML files (49 skills, 5 plugins) loaded via glob loader
- Depends on: Zod schema definitions (`src/content.config.ts`)
- Used by: Astro pages (via `getCollection()`), CLI (dynamic index generation)
- Purpose: Handle dynamic operations (OAuth, form submission, search, validation)
- Location: `workers/submission-api/src/index.ts`, `workers/search-api/src/index.ts`
- Contains: Cloudflare Worker functions (request routing, validation, GitHub API calls)
- Depends on: Environment variables (secrets, GitHub token, auth config)
- Used by: Client-side code (fetch requests), GitHub API, LLM backends
- Purpose: Distribute skills locally, manage installations, index generation
- Location: `cli/bin/oms.js`, `cli/lib/`
- Contains: Commander.js command definitions, skill fetching, formatting
- Depends on: NPM packages, GitHub raw content
- Used by: Terminal users, IDEs (Cursor, VS Code)
- **Skill Creator**: Interactive chat-based skill authoring in `src/features/skill-creator/`
- **Search**: Full-text + semantic search proxy in `workers/search-api/`
- **FDA Tools**: Drug shortage tracker, enforcement tracking in `src/features/fda-tools/`
## Data Flow
- Homepage filters: URL query params (`?category=diagnosis`) + client-side DOM filtering
- Skill Creator: React useReducer state + localStorage auto-save by skill name
- Auth: localStorage tokens (`oms_github_token`, `oms_github_user`)
## Key Abstractions
- Purpose: Define and validate skill/plugin metadata with a shared Zod schema
- Examples: `content/skills/prior-authorization-review.yaml`, `content/plugins/healthcare-mcp-comprehensive/index.yaml`
- Pattern: Glob loader (`glob({ pattern: '**/*.{yaml,yml}', base: './content/skills' })`) + Zod validation in `src/content.config.ts`
- Shared schema fields: `name`, `display_name`, `description`, `author`, `repository`, `category` (14 enums), `evidence_level`, `safety_classification`, `status` (published/draft/coming-soon), `verified`
- Purpose: Organize skills across 14 medical domains and provide consistent styling
- Location: `src/lib/categories.ts`
- Maps: category slug → display label, TailwindCSS color classes (bg, text, border), evidence styles, safety styles
- Used by: Content schema (enum), filtering UI, skill cards, category badges
- Purpose: Abstract away LLM provider differences (OpenAI, DeepSeek, local Ollama, etc.)
- Location: `src/features/skill-creator/lib/llm-proxy.ts`
- Pattern: Config object with `baseUrl`, `apiKey`, `modelId`; functions `refineSection()` and `streamRefineSection()` send POST to `/v1/chat/completions` (OpenAI-compatible API)
- Purpose: Authenticate users without exposing client secrets
- Location: `src/lib/auth.ts`, `workers/submission-api/src/index.ts` (POST `/auth/github/callback`)
- Pattern: Client obtains authorization code from GitHub → sends to Worker → Worker exchanges code for access token using client secret (never exposed to browser) → Worker returns token to client → client stores in localStorage
- Purpose: Client-side validation of skill creator sections before submission
- Location: `src/features/skill-creator/lib/section-validators.ts`
- Pattern: Zod schemas per section, validates structure/length/format before sending to LLM or generating output
- Purpose: Combine section content into final SKILL.md and content YAML artifacts
- Location: `src/features/skill-creator/lib/skill-assembler.ts`
- Pattern: Takes AppState (all sections + metadata) → generates SKILL.md with YAML front matter + generates content/skills/[name].yaml
## Entry Points
- Location: `src/pages/index.astro`
- Triggers: User visits `/` or domain root
- Responsibilities: Fetch all skills/plugins, render hero + stats, featured grid, search/filter UI, display all items
- Location: `src/pages/skills/[slug].astro`
- Triggers: User visits `/skills/prior-authorization-review` (dynamic route)
- Responsibilities: Fetch individual skill, render metadata + install instructions + links
- Location: `src/pages/submit.astro`
- Triggers: User clicks "Submit a Skill" or visits `/submit`
- Responsibilities: Render submission form (React island), handle validation errors, show success with PR link
- Location: `src/pages/create-skill.astro`
- Triggers: User visits `/create-skill`
- Responsibilities: Render `SkillCreatorApp` in full-screen, manage state, generate output files
- Location: `workers/submission-api/src/index.ts`
- Triggers: POST to `api.openmedicalskills.org/api/submit` or `https://api.openmedicalskills.org/auth/github/callback`
- Responsibilities: Validate skill submission, sanitize input, generate YAML, create GitHub PR, exchange OAuth code for token
- Location: `workers/search-api/src/index.ts`
- Triggers: GET `/api/search?q=term`, `/api/search/graph?tool=id`, `/api/dedup?q=description`, `/api/validate?skill=name`
- Responsibilities: Route search requests to backend services (Qdrant, SurrealDB, Supabase), return results
- Location: `cli/bin/oms.js`
- Triggers: `oms list`, `oms search query`, `oms install owner/skill-name`
- Responsibilities: List available skills, search by category/tag, fetch and display skill details, provide install instructions
## Error Handling
- Form validation: Display field-level errors on submit (Submission Worker returns `{ success: false, errors: [...] }`)
- API failures: JSON error response with HTTP status code and `error` message (Search/Submission Workers)
- Client-side: Try-catch with fallback UI (SearchBar catches fetch errors, displays "Search unavailable")
- LLM refinement: Show error message in chat interface, allow user to retry or manually edit
- GitHub operations: Octokit throws on auth failure or API errors; Worker catches and returns 400/502/500 with message
## Cross-Cutting Concerns
- Server-side (Workers): `console.error()` for unexpected errors (caught by Cloudflare dashboard)
- Client-side: Browser console; no sensitive data logged
- GitHub API errors: Logged in Worker
- Input validation in Submission Worker: Sanitization (HTML strip, length limits), regex (kebab-case names, URLs), schema (category enum)
- Content validation in Skill Creator: Zod schemas per section, required field checks
- Rate limiting: In-memory Map in Submission Worker (5 requests per IP per hour for MVP)
- GitHub OAuth with CSRF protection (state parameter generated/verified per RFC 6749)
- Submission Worker validates code format before GitHub exchange
- Auth tokens stored in browser localStorage, sent via Authorization header (Bearer scheme)
- Submission/Search Workers respond with `Access-Control-Allow-Origin` from env var `ALLOWED_ORIGIN`
- Preflight (OPTIONS) requests handled explicitly
- All responses include CORS headers even on error
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
