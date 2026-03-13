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
