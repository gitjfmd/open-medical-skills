# OMS Repository Split & CI/CD Infrastructure

## What This Is

Open Medical Skills is a curated marketplace of physician-reviewed medical AI skills and plugins, built on Astro 5 with React 19 islands and deployed to Cloudflare Pages. This project restructures the monorepo into two separate GitHub repositories (public content + private website) with strict CI/CD pipelines, branch protection, auto-deployment, and proper orchestration documentation following IntelMedica/SECSOLS company standards.

## Core Value

The content catalog (skills, plugins, CLI) must be publicly accessible and contribution-friendly, while the website infrastructure remains private and secure — with strict CI gates preventing broken deploys and unauthorized merges.

## Requirements

### Validated

<!-- Existing capabilities inferred from codebase map -->

- ✓ Astro 5 static website with React 19 islands — existing
- ✓ 49 skill YAML definitions + 5 plugin YAML definitions — existing
- ✓ Skill/plugin detail pages with evidence levels, safety classifications — existing
- ✓ Client-side Pagefind search — existing
- ✓ Dark mode toggle with localStorage persistence — existing
- ✓ Web-based submission form (CF Worker → GitHub PR) — existing
- ✓ Issue-based submission templates (skill + plugin) — existing
- ✓ Submission validation workflow (YAML schema, dupes, repo check) — existing
- ✓ Branch guard workflow (dev → main only) — existing
- ✓ Compliance gate workflow (medical disclaimers, safety, CDS claims) — existing
- ✓ Deploy workflow (CF Pages) — existing
- ✓ Node.js CLI tool (`@openmedicalskills/cli`) — existing
- ✓ Search API CF Worker (Qdrant, SurrealDB, Ollama) — existing
- ✓ GitHub OAuth integration for authenticated submissions — existing
- ✓ 14 medical categories with Zod schema validation — existing
- ✓ Physician review flagging workflow — existing

### Active

<!-- New work for this milestone -->

- [x] **REPO-01**: Split monorepo into public content repo (`Open-Medica/open-medical-skills`) and private website repo (`gitjfmd/oms-site`) — Validated in Phase 1
- [x] **REPO-02**: Public repo contains: content YAML, skill/plugin source, CLI, docs, issue/PR templates, submission workflows — Validated in Phase 1
- [x] **COM-01–05**: Public repo has LICENSE (MIT), DISCLAIMER.md, issue templates, PR templates, .gitignore — Validated in Phase 2
- [ ] **REPO-03**: Private repo contains: Astro site source, React components, CF Workers, deployment config
- [ ] **SYNC-01**: Private repo consumes public content via git submodule at `content-repo/`
- [ ] **SYNC-02**: Auto-update submodule on public repo push to main (repository_dispatch + CI workflow)
- [ ] **CI-01**: Public repo CI: YAML validation, schema check, auto-label, physician review flagging on PR to dev
- [ ] **CI-02**: Public repo compliance gate on PR to main (medical disclaimers, safety, CDS claims, license, physician-review-approved label)
- [ ] **CI-03**: Private repo CI: type-check (`astro check`), build, security scan on PR to dev
- [ ] **CI-04**: Private repo auto-deploy to CF Pages on merge to main
- [ ] **CI-05**: Both repos enforce branch guard (dev → main only)
- [ ] **BP-01**: Public repo `main` branch protection: PR required, 1 approval, status checks, block force push, admins only
- [ ] **BP-02**: Public repo `dev` branch protection: PR required, 0 approvals, status checks, block force push
- [ ] **BP-03**: Private repo `main` and `dev` branch protection (same pattern)
- [ ] **DOC-01**: Public repo README.md — comprehensive community documentation (mission, install, contribute, categories)
- [ ] **DOC-02**: Public repo CLAUDE.md — auto-generated public overview (no infra details)
- [ ] **DOC-03**: Private repo CLAUDE.md — tech stack, dev setup, deployment, content sync
- [ ] **DOC-04**: Private repo CLAUDE.local.md — orchestration rules, agent routing, infrastructure details
- [ ] **DOC-05**: Private repo README.md — internal dev documentation
- [ ] **SUB-01**: Submission API Worker updated: GITHUB_OWNER → "Open-Medica" (PRs target public repo dev branch)
- [ ] **SUB-02**: Form-based submissions create PRs to public repo dev branch
- [ ] **SUB-03**: Issue-to-PR workflow creates PRs to public repo dev branch
- [ ] **SUB-04**: GitHub-experienced users: direct PR to public repo dev → review → dev-to-main PR for release

### Out of Scope

- npm package publishing for content — git submodule is simpler and sufficient
- Third worker repo — workers stay in private repo for simplicity
- Monorepo tooling (Turborepo, Nx) — only 2 repos, unnecessary complexity
- Public repo auto-deploy — only private repo deploys to CF Pages
- Content history migration to public repo — fresh start acceptable, history preserved in private repo

## Context

- **Current state**: Single monorepo at `gitjfmd/oms-site` with everything (website + content + CLI + workers)
- **Existing sync**: `scripts/sync-to-public.sh` manually rsyncs content to a public worktree — fragile, one-directional, being retired
- **GitHub orgs**: `Open-Medica` (empty, exists), `IntelMedica` (has rn-scribe, pa-generator)
- **Company patterns**: SECSOLS and IntelMedica both use dev → main branch model with strict CI, CLAUDE.md + CLAUDE.local.md orchestration docs, and companion agent workflows
- **Critical file**: `src/content.config.ts` lines 5 and 60 — glob base paths change from `./content/skills` to `./content-repo/content/skills`
- **Submission API**: Already targets `dev` branch for PRs (correct), but `GITHUB_OWNER` must change from `gitjfmd` to `Open-Medica`

## Constraints

- **Tech stack**: Astro 5 + React 19 + TailwindCSS 4 + CF Pages/Workers — no changes to core stack
- **Security**: No secrets in public repo. OAuth tokens, CF API keys stay in private repo only
- **Compliance**: Medical content validation (disclaimers, safety, CDS claims) must run on every PR to main in public repo
- **Deployment**: Auto-deploy only through CI on merge to main in private repo — no manual `wrangler deploy`
- **Branch model**: `main` ← `dev` ← `feature/*` in both repos, enforced by GitHub Actions + branch protection

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Git submodule for content sync | Deterministic builds, local dev works, Astro glob reads transparently | — Pending |
| Public repo at `Open-Medica` org | Community-facing, separate from personal account, existing org | — Pending |
| Workers stay in private repo | Contain secrets, internal infra access, deployment config | — Pending |
| CLI moves to public repo | Community tool, distributed via npm, lives alongside content | — Pending |
| Retire `sync-to-public.sh` | Replaced by submodule + repository_dispatch CI — automated, bidirectional | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 after Phase 2 completion*
