# Roadmap: OMS Repository Split & CI/CD Infrastructure

## Overview

This roadmap takes Open Medical Skills from a single monorepo to a two-repo architecture (public content + private site) with full CI/CD pipelines, branch protection, cross-repo sync, and community-ready documentation. The work flows from repository creation through content migration, build verification, CI pipelines, branch protection, submission pipeline updates, and finally documentation and community standards. Each phase delivers a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Public Repository Creation** - Create the Open-Medica/open-medical-skills repo with content, CLI, and scripts
- [ ] **Phase 2: Community Standards** - License, disclaimer, issue/PR templates, .gitignore for the public repo
- [ ] **Phase 3: Content Sync via Submodule** - Wire private repo to consume public content through git submodule with verified builds
- [ ] **Phase 4: Cross-Repo Authentication** - Set up PATs and secrets for dispatch, deploy, and submission API access
- [ ] **Phase 5: Public Repo CI/CD** - Validation, compliance, auto-labeling, and dispatch workflows on the public repo
- [ ] **Phase 6: Private Repo CI/CD** - Type-check, build, security scan, deploy, and content update receiver workflows
- [ ] **Phase 7: Branch Protection** - Rulesets on main and dev for both repos, branch deletion blocks
- [ ] **Phase 8: Submission Pipeline** - Update submission API and workflows to target public repo
- [ ] **Phase 9: Documentation** - README, CLAUDE.md, CONTRIBUTING, SECURITY, CODEOWNERS for both repos
- [ ] **Phase 10: Private Repo Cleanup** - Retire legacy sync script, remove stale remotes, verify final state

## Phase Details

### Phase 1: Public Repository Creation
**Goal**: The public repo exists at Open-Medica/open-medical-skills with all content, skill/plugin source, CLI, and supporting files
**Depends on**: Nothing (first phase)
**Requirements**: REPO-01, REPO-02, REPO-04
**Success Criteria** (what must be TRUE):
  1. `Open-Medica/open-medical-skills` exists on GitHub with MIT license and is publicly visible
  2. All 49 skill YAMLs, 5 plugin YAMLs, skill source dirs, plugin source dirs, CLI, logo, and scripts are present in the repo
  3. The repo has a `dev` branch created from `main`
**Plans:** 1 plan
Plans:
- [ ] 01-01-PLAN.md — Complete public repo with content, CLI, logo, scripts, docs, LICENSE fix, and dev branch

### Phase 2: Community Standards
**Goal**: The public repo meets GitHub community standards and is ready for external contributors
**Depends on**: Phase 1
**Requirements**: COM-01, COM-02, COM-03, COM-04, COM-05
**Success Criteria** (what must be TRUE):
  1. Public repo root has LICENSE (MIT), DISCLAIMER.md (medical content disclaimer), and a properly configured .gitignore
  2. Issue templates for submit-skill and submit-plugin are functional (can create new issue from template)
  3. PR templates for skill-submission and dev-to-main are present and render correctly
**Plans**: TBD

### Phase 3: Content Sync via Submodule
**Goal**: The private repo consumes public content through a git submodule and builds successfully with zero missing pages
**Depends on**: Phase 1
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-07, REPO-03, REPO-05
**Success Criteria** (what must be TRUE):
  1. Private repo has public repo as submodule at `content-repo/` and `content.config.ts` glob paths point to `./content-repo/content/skills` and `./content-repo/content/plugins`
  2. `pnpm build` completes successfully and post-build validation confirms all 49 skill pages and 5 plugin pages exist in output
  3. `pnpm dev` serves all skill and plugin pages correctly from submodule content
  4. Private repo `dev` branch has the submodule configured and builds cleanly
**Plans**: TBD

### Phase 4: Cross-Repo Authentication
**Goal**: Both repos have the credentials needed for cross-repo dispatch, deployment, and submission API access
**Depends on**: Phase 1, Phase 3
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. Fine-grained PAT with `contents:write` on private repo exists and is stored as `SITE_REPO_DISPATCH_TOKEN` secret in the public repo
  2. Private repo has `CF_API_TOKEN` and `CF_ACCOUNT_ID` secrets configured for Cloudflare deployment
  3. Submission API Worker has a PAT/token with write access to `Open-Medica/open-medical-skills` for creating PRs
**Plans**: TBD

### Phase 5: Public Repo CI/CD
**Goal**: Every PR to the public repo is validated for YAML correctness, duplicates, compliance, and physician review before merge
**Depends on**: Phase 1, Phase 2, Phase 4
**Requirements**: PCI-01, PCI-02, PCI-03, PCI-04, PCI-05, PCI-06, PCI-07, PCI-08
**Success Criteria** (what must be TRUE):
  1. A PR to `dev` with a malformed skill YAML fails CI (schema validation, name format, missing fields)
  2. A PR to `dev` with a duplicate skill name fails CI and a PR with a valid new skill passes with auto-labels applied and physician review checklist comment posted
  3. A PR to `main` from a non-dev branch is blocked by the branch guard workflow
  4. A PR to `main` missing medical disclaimers, safety classification, or physician-review-approved label fails the compliance gate
  5. Pushing to `main` fires a `repository_dispatch` event to the private repo (verified by workflow run appearing)
**Plans**: TBD

### Phase 6: Private Repo CI/CD
**Goal**: The private repo validates code quality on PRs, auto-deploys on merge to main, and auto-updates content when the public repo changes
**Depends on**: Phase 3, Phase 4
**Requirements**: SCI-01, SCI-02, SCI-03, SCI-04, SCI-05, SCI-06, SCI-07, SCI-08
**Success Criteria** (what must be TRUE):
  1. A PR to `dev` runs `astro check`, `pnpm build` (with `submodules: recursive`), and security scan -- failing any blocks merge
  2. Pushing to `dev` triggers a preview deploy to Cloudflare Pages
  3. Pushing to `main` triggers production deploy to Cloudflare Pages via `wrangler pages deploy`
  4. The `update-content.yml` receiver workflow is committed to `main` before the first dispatch, and receiving a `repository_dispatch` event updates the submodule pointer and triggers a rebuild
  5. A PR to `main` from a non-dev branch is blocked by the branch guard
**Plans**: TBD

### Phase 7: Branch Protection
**Goal**: Both repos enforce the dev-to-main branch model with appropriate approval requirements and no force pushes
**Depends on**: Phase 5, Phase 6
**Requirements**: BP-01, BP-02, BP-03, BP-04, BP-05
**Success Criteria** (what must be TRUE):
  1. Direct push to `main` is rejected in both repos (PR required, 1 approval needed)
  2. Direct push to `dev` is rejected in both repos (PR required, status checks must pass, 0 approvals)
  3. Force push to `main` and `dev` is blocked in both repos, and branch deletion of `main` and `dev` is blocked
**Plans**: TBD

### Phase 8: Submission Pipeline
**Goal**: Skill/plugin submissions (web form, issue, direct PR) all target the public repo and flow through the validated pipeline
**Depends on**: Phase 5, Phase 7
**Requirements**: SUB-01, SUB-02, SUB-03, SUB-04, SUB-05
**Success Criteria** (what must be TRUE):
  1. Submission API Worker `wrangler.toml` has `GITHUB_OWNER = "Open-Medica"` and web form submissions create PRs to the public repo `dev` branch
  2. Issue-to-PR workflow creates PRs to the public repo `dev` branch when a skill/plugin submission issue is opened
  3. End-to-end test passes: submit a skill via issue template, PR appears on public repo `dev`, CI validates it, and physician review is flagged
**Plans**: TBD

### Phase 9: Documentation
**Goal**: Both repos have complete, accurate documentation for contributors, developers, and AI agents
**Depends on**: Phase 5, Phase 6, Phase 8
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07, DOC-08
**Success Criteria** (what must be TRUE):
  1. Public repo has a comprehensive README.md (mission, CLI install, submission guide, categories, badges, license) and CONTRIBUTING.md at root
  2. Public repo has CLAUDE.md (project overview, content schema, directory structure without infra details), SECURITY.md (vulnerability reporting), and CODEOWNERS (physician review team)
  3. Private repo has CLAUDE.md (tech stack, dev setup, deploy, content sync), CLAUDE.local.md (orchestration, agents, infra), and README.md (internal dev docs)
**Plans**: TBD

### Phase 10: Private Repo Cleanup
**Goal**: Legacy sync mechanisms are retired and the private repo is clean of stale artifacts
**Depends on**: Phase 3, Phase 8
**Requirements**: REPO-06, REPO-07
**Success Criteria** (what must be TRUE):
  1. `scripts/sync-to-public.sh` is deleted and the legacy `vercel` remote is removed
  2. `pnpm build` still succeeds after cleanup (no broken references to removed files)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Public Repository Creation | 0/1 | Planned | - |
| 2. Community Standards | 0/? | Not started | - |
| 3. Content Sync via Submodule | 0/? | Not started | - |
| 4. Cross-Repo Authentication | 0/? | Not started | - |
| 5. Public Repo CI/CD | 0/? | Not started | - |
| 6. Private Repo CI/CD | 0/? | Not started | - |
| 7. Branch Protection | 0/? | Not started | - |
| 8. Submission Pipeline | 0/? | Not started | - |
| 9. Documentation | 0/? | Not started | - |
| 10. Private Repo Cleanup | 0/? | Not started | - |
