# Phase 2: Community Standards - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

The public repo `Open-Medica/open-medical-skills` meets GitHub community standards and is ready for external contributors. This means: LICENSE file (MIT), DISCLAIMER.md (medical content), functional issue templates, PR templates, and a properly configured .gitignore. All files either exist already or need minor adjustments for the public repo context.

</domain>

<decisions>
## Implementation Decisions

### LICENSE file
- **D-01:** Copyright holder is `IntelMedica.ai` — not the org name, not individual contributors
- **D-02:** Year format is `2026` — simple, no "present" suffix
- **D-03:** Standard MIT license text only — no appended medical disclaimers (those live in DISCLAIMER.md)
- **D-04:** The LICENSE file must be pure MIT so GitHub SPDX detection shows "MIT" (not "NOASSERTION" as seen in Phase 1 research)

### Issue template adjustments
- **D-05:** Issue templates (`submit-skill.yml`, `submit-plugin.yml`) already exist and are comprehensive — push to public repo as-is
- **D-06:** Both templates use the canonical 14-category dropdown matching the Zod schema in `src/content.config.ts`
- **D-07:** Templates include attestation checkboxes for open source, PHI, physician review, and AI disclaimer — keep all

### PR template adjustments
- **D-08:** Update `skill-submission.md` to remove reference to `docs/schema.md` (doesn't exist in public repo) — link to `src/content.config.ts` or the README schema section instead
- **D-09:** Update `skill-submission.md` to remove reference to `scripts/validate-submission.js` — CI handles validation automatically, submitters don't need to run local validation
- **D-10:** `dev-to-main.md` compliance checklist is correct as-is — keep physician review, disclaimers, CDS claim scan references

### .gitignore configuration
- **D-11:** Add `.planning/` to .gitignore — GSD workflow artifacts are development-only, not community content
- **D-12:** Keep private infrastructure paths in .gitignore (refs/, data/, .mcp.json, GUARDRAILS.md) as safety net against accidental commits
- **D-13:** Keep existing ignores for `.claude/`, `CLAUDE.local.md`, `AGENTS.md`, `GEMINI.md`, `.internal/`, `AGENTS/`

### Claude's Discretion
- Exact formatting of LICENSE file (standard MIT boilerplate)
- Whether to add a `config.yml` for issue template chooser (blank issue enable/disable)
- Minor wording improvements to templates if needed for clarity

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Content schema (category validation)
- `src/content.config.ts` — Zod schema defining the 14 medical categories, evidence levels, safety classifications. Issue template dropdowns must match.

### Existing templates (to be adjusted)
- `.github/ISSUE_TEMPLATE/submit-skill.yml` — Full YAML form template for skill submissions
- `.github/ISSUE_TEMPLATE/submit-plugin.yml` — Full YAML form template for plugin submissions
- `.github/PULL_REQUEST_TEMPLATE/skill-submission.md` — PR checklist (needs reference updates per D-08, D-09)
- `.github/PULL_REQUEST_TEMPLATE/dev-to-main.md` — Release compliance checklist (correct as-is)

### Existing assets (already correct)
- `DISCLAIMER.md` — Medical content disclaimer, research tool scope, IntelMedica.ai contact
- `.gitignore` — Current 64-line gitignore (needs `.planning/` addition per D-11)

### Phase 1 research
- `.planning/phases/01-public-repository-creation/01-RESEARCH.md` — Documents the LICENSE/NOASSERTION issue and DISCLAIMER.md separation decision

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- DISCLAIMER.md: Complete and well-written, covers research tool scope, IntelMedica.ai contact. No changes needed.
- Issue templates: Both submit-skill.yml (256 lines) and submit-plugin.yml (333 lines) are production-ready with proper YAML form syntax, labels, and attestation checkboxes.
- PR templates: dev-to-main.md is complete with compliance checklist. skill-submission.md needs 2 reference updates.
- .gitignore: Well-organized with comments, 64 lines covering dependencies, build, env, IDE, OS, and private paths.

### Established Patterns
- Category validation: 14 categories used consistently across Zod schema, issue templates, and CF Worker
- Medical disclaimer pattern: All user-facing content references "not a substitute for professional medical judgment"
- Label auto-assignment: Issue templates include `submission`, type-specific (`skill`/`plugin`), and `pending-review` labels

### Integration Points
- These files are pushed to the `Open-Medica/open-medical-skills` public repo (not the private repo)
- Phase 5 (CI/CD) will add workflows that reference these templates (auto-labeling, validation)
- Phase 9 (Documentation) will create README.md and CONTRIBUTING.md that reference these templates

</code_context>

<specifics>
## Specific Ideas

- LICENSE must produce "MIT" in GitHub's license detection (SPDX), not "NOASSERTION"
- Phase 1 already identified this issue and the fix (pure MIT text, medical disclaimer in separate DISCLAIMER.md)

</specifics>

<deferred>
## Deferred Ideas

- `config.yml` for issue template chooser (enable/disable blank issues) — could be added later
- CONTRIBUTING.md — Phase 9 (Documentation) handles this
- SECURITY.md — Phase 9 (Documentation) handles this
- CODEOWNERS — Phase 9 (Documentation) handles this

</deferred>

---

*Phase: 02-community-standards*
*Context gathered: 2026-03-22*
