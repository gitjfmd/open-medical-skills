## Skill/Plugin Submission

<!-- Thank you for submitting to Open Medical Skills! Please fill out this template completely. -->
<!-- Submissions missing required fields will be automatically flagged for revision. -->

### Submission Type

- [ ] Skill (single-purpose agent capability)
- [ ] Plugin (full application/integration/multi-skill package)

### Checklist

- [ ] I have added a YAML file to `content/skills/` or `content/plugins/`
- [ ] The YAML file follows the [content schema](../../src/content.config.ts)
- [ ] The skill/plugin name is unique (no duplicates in the content directory)
- [ ] The repository URL is publicly accessible
- [ ] At least one install method is provided
- [ ] Safety guardrails and disclaimers are documented
- [ ] CI validation passes on this PR (automated — no local step needed)

### Submission Details

**Skill/Plugin Name:** <!-- e.g., clinical-note-summarizer -->

**Display Name:** <!-- e.g., Clinical Note Summarizer -->

**Category:** <!-- diagnosis | treatment | lab-imaging | pharmacy | emergency | surgery | nursing | pediatrics | mental-health | public-health | research | education | administrative | clinical-research-summarizing -->

**Author:** <!-- Your name or organization -->

**Repository:** <!-- https://github.com/owner/repo -->

**Version:** <!-- e.g., 1.0.0 -->

### Description

<!-- 2-5 sentences describing what this skill/plugin does, who it's for, and what problem it solves. -->

### Clinical Evidence

<!-- Reference any clinical guidelines, research papers, or evidence base. Leave N/A if not applicable. -->

### Safety Guardrails

<!-- Describe safety mechanisms, disclaimers, and guardrails. This is critical for medical AI tools. -->

### Install Methods Provided

- [ ] npx
- [ ] wget/curl
- [ ] git clone
- [ ] Docker
- [ ] Other: <!-- specify -->

### Screenshots / Demo

<!-- Attach screenshots or link to a demo. Optional but recommended. -->

### Attestation

- [ ] This submission is open source and the repository is publicly accessible
- [ ] This submission does not expose PHI without appropriate safeguards
- [ ] I understand this will be reviewed by physician maintainers
- [ ] This submission includes appropriate medical AI disclaimers
- [ ] This submission is a research and learning tool, not clinical decision support (CDS)
- [ ] All SKILL.md files contain appropriate medical disclaimers

---

<!-- FOR REVIEWERS (do not edit below this line) -->

### Review Status

- [ ] **Automated Validation**: Passed / Failed
- [ ] **Maintainer Review**: Pending
- [ ] **Physician Review**: Pending
- [ ] **Security Review**: Pending
- [ ] **Approved for Listing**: No
