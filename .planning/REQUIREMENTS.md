# Requirements: OMS Repo Split & CI/CD Infrastructure

**Defined:** 2026-03-22
**Core Value:** Content catalog publicly accessible and contribution-friendly, website infrastructure private and secure, with strict CI gates preventing broken deploys and unauthorized merges.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Repository Setup

- [ ] **REPO-01**: Public repo `Open-Medica/open-medical-skills` created with MIT license
- [ ] **REPO-02**: Public repo contains content YAML (skills + plugins), skill/plugin source dirs, CLI, docs, logo, scripts
- [ ] **REPO-03**: Private repo `gitjfmd/oms-site` contains Astro source, React components, CF Workers, deployment config
- [ ] **REPO-04**: Public repo has `dev` branch created from `main`
- [ ] **REPO-05**: Private repo has `dev` branch with submodule configured
- [ ] **REPO-06**: Legacy `vercel` remote removed from private repo
- [ ] **REPO-07**: `scripts/sync-to-public.sh` retired (replaced by submodule + CI)

### Content Sync

- [ ] **SYNC-01**: Private repo has public repo as git submodule at `content-repo/`
- [ ] **SYNC-02**: `content.config.ts` glob base paths updated to `./content-repo/content/skills` and `./content-repo/content/plugins`
- [ ] **SYNC-03**: `pnpm build` succeeds in private repo with content from submodule (zero missing pages)
- [ ] **SYNC-04**: `pnpm dev` serves all pages correctly with submodule content
- [ ] **SYNC-05**: `repository_dispatch` triggers from public repo on push to main
- [ ] **SYNC-06**: Private repo `update-content.yml` workflow receives dispatch and updates submodule pointer
- [ ] **SYNC-07**: Post-build validation counts output HTML files to catch silent empty collections

### CI/CD — Public Repo

- [ ] **PCI-01**: YAML validation CI runs on PR to dev (syntax, schema, required fields, name format)
- [ ] **PCI-02**: Duplicate name detection across existing content
- [ ] **PCI-03**: Repository URL accessibility check (HTTP 200/301/302)
- [ ] **PCI-04**: Auto-labeling (submission type, category, pending-review)
- [ ] **PCI-05**: Physician review flagging with checklist comment
- [ ] **PCI-06**: Branch guard enforces PRs to main come from dev only
- [ ] **PCI-07**: Compliance gate on PR to main (medical disclaimers, safety classification, CDS claim scan, license check, physician-review-approved label)
- [ ] **PCI-08**: `notify-site-repo.yml` fires `repository_dispatch` on push to main

### CI/CD — Private Repo

- [ ] **SCI-01**: Type-check (`astro check`) runs on PR to dev
- [ ] **SCI-02**: Build (`pnpm build`) runs on PR to dev with submodule checkout
- [ ] **SCI-03**: Security scan (secrets detection, password patterns) runs on PR to dev
- [ ] **SCI-04**: Branch guard enforces PRs to main come from dev only
- [ ] **SCI-05**: Auto-deploy to CF Pages on push to main (via `wrangler pages deploy`)
- [ ] **SCI-06**: Preview deploy on push to dev
- [ ] **SCI-07**: Deploy workflow checks out with `submodules: recursive`
- [ ] **SCI-08**: `update-content.yml` receiver workflow committed to `main` before first dispatch

### Branch Protection

- [ ] **BP-01**: Public repo `main`: PR required, 1 approval, status checks required, block force push, admins-only push
- [ ] **BP-02**: Public repo `dev`: PR required, 0 approvals, status checks required, block force push
- [ ] **BP-03**: Private repo `main`: PR required, 1 approval, status checks required, block force push, admins-only push
- [ ] **BP-04**: Private repo `dev`: PR required, 0 approvals, status checks required, block force push
- [ ] **BP-05**: Both repos block branch deletion on `main` and `dev`

### Submission Pipeline

- [ ] **SUB-01**: Submission API Worker `GITHUB_OWNER` updated to `Open-Medica` in `wrangler.toml`
- [ ] **SUB-02**: Web form submissions create PRs to public repo `dev` branch
- [ ] **SUB-03**: Issue-to-PR workflow creates PRs to public repo `dev` branch
- [ ] **SUB-04**: GitHub OAuth App re-registered under `Open-Medica` org (or PAT updated with org access)
- [ ] **SUB-05**: End-to-end test: submit skill via issue → PR appears on public dev

### Documentation

- [ ] **DOC-01**: Public repo `README.md` — mission, install CLI, submit skills, categories, badges, license
- [ ] **DOC-02**: Public repo `CLAUDE.md` — project overview, content schema, directory structure (no infra)
- [ ] **DOC-03**: Private repo `CLAUDE.md` — tech stack, dev setup, deployment, content sync, design system
- [ ] **DOC-04**: Private repo `CLAUDE.local.md` — orchestration rules, agent routing, infrastructure, guardrails
- [ ] **DOC-05**: Private repo `README.md` — internal dev docs (setup, architecture, deploy, submodule update)
- [ ] **DOC-06**: Public repo `CONTRIBUTING.md` at root (copy from docs/)
- [ ] **DOC-07**: Public repo `SECURITY.md` — vulnerability reporting process
- [ ] **DOC-08**: Public repo `CODEOWNERS` — define physician review team

### Community Standards

- [ ] **COM-01**: Public repo has LICENSE (MIT)
- [ ] **COM-02**: Public repo has DISCLAIMER.md (medical content disclaimer)
- [ ] **COM-03**: Public repo has issue templates (submit-skill, submit-plugin)
- [ ] **COM-04**: Public repo has PR templates (skill-submission, dev-to-main)
- [ ] **COM-05**: Public repo `.gitignore` configured (node_modules, .env, dist, .internal/, CLAUDE.local.md)

### Cross-Repo Auth

- [ ] **AUTH-01**: Fine-grained PAT created with `contents:write` scope on private repo (for repository_dispatch)
- [ ] **AUTH-02**: PAT stored as `SITE_REPO_DISPATCH_TOKEN` secret in public repo
- [ ] **AUTH-03**: Private repo has existing CF secrets (`CF_API_TOKEN`, `CF_ACCOUNT_ID`) for deploy
- [ ] **AUTH-04**: Submission API Worker has PAT/token with write access to `Open-Medica/open-medical-skills`

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Infrastructure Hardening

- **INF-01**: Replace fine-grained PAT with GitHub App for cross-repo auth (auto-renewing tokens)
- **INF-02**: Canonical JSON Schema file for category validation (single source for Zod, Worker, GH Action)
- **INF-03**: GitHub Rulesets (modern API) instead of classic branch protection rules
- **INF-04**: CF KV-backed rate limiting in submission API (replace in-memory Map)

### Monitoring

- **MON-01**: Slack/Discord notifications on failed deploys
- **MON-02**: Content freshness monitoring (alert if submodule >7 days behind)
- **MON-03**: Submission pipeline health check (test submission weekly)

## Out of Scope

| Feature | Reason |
|---------|--------|
| npm package for content | Git submodule is simpler, no publishing overhead |
| Third worker repo | Workers stay in private repo — only 2 repos needed |
| Monorepo tooling (Turborepo, Nx) | Only 2 repos, unnecessary complexity |
| Public repo auto-deploy | Only private repo deploys to CF Pages |
| Git history migration (`git-filter-repo`) | Fresh start in public repo, history preserved in private |
| AI auto-review of medical content | Physician review is non-negotiable, AI can't replace |
| Auto-merge on CI pass | CEO approval required for main merges |
| CLA bot | Unnecessary friction for an open-source medical content project |
| Astro → CF Workers migration | Current CF Pages deployment works, evaluate later |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| REPO-01 | Phase 1: Public Repository Creation | Pending |
| REPO-02 | Phase 1: Public Repository Creation | Pending |
| REPO-03 | Phase 3: Content Sync via Submodule | Pending |
| REPO-04 | Phase 1: Public Repository Creation | Pending |
| REPO-05 | Phase 3: Content Sync via Submodule | Pending |
| REPO-06 | Phase 10: Private Repo Cleanup | Pending |
| REPO-07 | Phase 10: Private Repo Cleanup | Pending |
| SYNC-01 | Phase 3: Content Sync via Submodule | Pending |
| SYNC-02 | Phase 3: Content Sync via Submodule | Pending |
| SYNC-03 | Phase 3: Content Sync via Submodule | Pending |
| SYNC-04 | Phase 3: Content Sync via Submodule | Pending |
| SYNC-05 | Phase 5: Public Repo CI/CD | Pending |
| SYNC-06 | Phase 6: Private Repo CI/CD | Pending |
| SYNC-07 | Phase 3: Content Sync via Submodule | Pending |
| PCI-01 | Phase 5: Public Repo CI/CD | Pending |
| PCI-02 | Phase 5: Public Repo CI/CD | Pending |
| PCI-03 | Phase 5: Public Repo CI/CD | Pending |
| PCI-04 | Phase 5: Public Repo CI/CD | Pending |
| PCI-05 | Phase 5: Public Repo CI/CD | Pending |
| PCI-06 | Phase 5: Public Repo CI/CD | Pending |
| PCI-07 | Phase 5: Public Repo CI/CD | Pending |
| PCI-08 | Phase 5: Public Repo CI/CD | Pending |
| SCI-01 | Phase 6: Private Repo CI/CD | Pending |
| SCI-02 | Phase 6: Private Repo CI/CD | Pending |
| SCI-03 | Phase 6: Private Repo CI/CD | Pending |
| SCI-04 | Phase 6: Private Repo CI/CD | Pending |
| SCI-05 | Phase 6: Private Repo CI/CD | Pending |
| SCI-06 | Phase 6: Private Repo CI/CD | Pending |
| SCI-07 | Phase 6: Private Repo CI/CD | Pending |
| SCI-08 | Phase 6: Private Repo CI/CD | Pending |
| BP-01 | Phase 7: Branch Protection | Pending |
| BP-02 | Phase 7: Branch Protection | Pending |
| BP-03 | Phase 7: Branch Protection | Pending |
| BP-04 | Phase 7: Branch Protection | Pending |
| BP-05 | Phase 7: Branch Protection | Pending |
| SUB-01 | Phase 8: Submission Pipeline | Pending |
| SUB-02 | Phase 8: Submission Pipeline | Pending |
| SUB-03 | Phase 8: Submission Pipeline | Pending |
| SUB-04 | Phase 8: Submission Pipeline | Pending |
| SUB-05 | Phase 8: Submission Pipeline | Pending |
| DOC-01 | Phase 9: Documentation | Pending |
| DOC-02 | Phase 9: Documentation | Pending |
| DOC-03 | Phase 9: Documentation | Pending |
| DOC-04 | Phase 9: Documentation | Pending |
| DOC-05 | Phase 9: Documentation | Pending |
| DOC-06 | Phase 9: Documentation | Pending |
| DOC-07 | Phase 9: Documentation | Pending |
| DOC-08 | Phase 9: Documentation | Pending |
| COM-01 | Phase 2: Community Standards | Pending |
| COM-02 | Phase 2: Community Standards | Pending |
| COM-03 | Phase 2: Community Standards | Pending |
| COM-04 | Phase 2: Community Standards | Pending |
| COM-05 | Phase 2: Community Standards | Pending |
| AUTH-01 | Phase 4: Cross-Repo Authentication | Pending |
| AUTH-02 | Phase 4: Cross-Repo Authentication | Pending |
| AUTH-03 | Phase 4: Cross-Repo Authentication | Pending |
| AUTH-04 | Phase 4: Cross-Repo Authentication | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after roadmap creation (traceability populated)*
