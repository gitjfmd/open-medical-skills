# Feature: Chat-to-Create-Skill

> A guided chatbox UI where users create medical AI skills section-by-section with LLM assistance.

## Overview

Chat-to-Create-Skill is an interactive skill authoring tool embedded in the OMS website. Instead of writing SKILL.md files and content YAML by hand, users engage with a chat interface that guides them through each section of a medical AI skill. A "Magic Button" sends the user's rough content to an LLM backend, which refines it into properly structured, physician-grade skill language.

## User Flow

```
1. User opens /create-skill page
2. Section sidebar shows all skill sections (title, description, install, etc.)
3. User selects a section (or starts from top)
4. User types rough content into the chat input
5. User clicks the Magic Button (sparkle icon)
6. System sends user content + section-specific system prompt to LLM proxy
7. LLM returns refined, structured content for that section
8. User reviews the generated content in a preview pane
9. User can edit, regenerate, or accept the section
10. User moves to next section (sidebar updates completion status)
11. After all sections are complete, user clicks "Generate Skill"
12. System produces both SKILL.md and content YAML files
13. User can download files or submit directly as a PR via the submission pipeline
```

## Architecture

### Frontend Components

```
src/features/skill-creator/
├── CLAUDE.md                          # This file
├── components/
│   ├── ChatInterface.tsx              # Main chat UI — message list, input, magic button
│   ├── SectionSidebar.tsx             # Left sidebar — section list with completion status
│   ├── SectionPreview.tsx             # Right pane — rendered preview of current section
│   ├── MagicButton.tsx                # Sparkle button that triggers LLM refinement
│   └── SkillOutputModal.tsx           # Modal showing generated SKILL.md + YAML with download/submit
├── lib/
│   ├── llm-proxy.ts                   # API client for LLM backend (multi-provider)
│   ├── skill-templates.ts             # Default section templates and structure definitions
│   ├── skill-assembler.ts             # Assembles sections into SKILL.md and content YAML
│   └── section-validators.ts          # Client-side validation for each section
├── prompts/
│   └── system-prompts.ts              # Section-specific system prompts for LLM
└── types.ts                           # TypeScript interfaces for the feature
```

### Page Integration

A new Astro page at `src/pages/create-skill.astro` renders the `ChatInterface` as a React island with `client:only="react"` (since it requires browser APIs for chat state, localStorage persistence, and API calls).

### Backend: LLM Proxy

The LLM proxy is a thin API layer that:

1. Accepts a request with `{ section, userContent, systemPrompt, provider }`
2. Forwards to the selected LLM provider's OpenAI-compatible endpoint
3. Returns the refined content

**Supported providers** (all OpenAI-compatible `/v1/chat/completions`):

| Provider | Endpoint | Notes |
|----------|----------|-------|
| LMStudio | `http://localhost:1234/v1` | Local, free |
| vLLM | `http://localhost:8000/v1` | Local, free, fast |
| Ollama | `http://localhost:11434/v1` | Local, free |
| DeepSeek | `https://api.deepseek.com/v1` | Cloud, cheap |
| OpenAI | `https://api.openai.com/v1` | Cloud |
| Any OpenAI-compatible | User-configured URL | Custom |

**Implementation options** (decide during implementation):
- **Option A**: Cloudflare Worker endpoint (like the submission API) — better for production
- **Option B**: Client-side direct calls to OpenAI-compatible APIs — simpler, no backend needed, user provides their own API key
- **Option C**: Both — client-side for local providers (LMStudio/Ollama/vLLM), worker for cloud providers

**Recommended: Option B for MVP.** User configures their LLM endpoint and API key in a settings panel. All calls go directly from the browser. No server-side secrets needed. This keeps the architecture simple and avoids proxy costs.

### Skill Sections

Based on the established SKILL.md structure in this repo, the following sections are defined:

| # | Section ID | Display Name | Required | Description |
|---|-----------|--------------|----------|-------------|
| 1 | `title` | Title | Yes | H1 heading — skill display name |
| 2 | `description` | Description | Yes | 1-2 paragraph overview of the skill |
| 3 | `quick-install` | Quick Install | Yes | npx/wget/git install commands |
| 4 | `what-it-does` | What It Does | Yes | Bulleted capability list |
| 5 | `clinical-use-cases` | Clinical Use Cases | Yes | 3-4 real-world clinical scenarios |
| 6 | `safety-evidence` | Safety & Evidence | Yes | Safety classification + evidence level with justification |
| 7 | `example-usage` | Example Usage | Yes | Concrete input/output examples |
| 8 | `technical-details` | Technical Details | Yes | Category, author, license, version, specialty |
| 9 | `references` | References | Yes | Academic citations |
| 10 | `custom` | Custom Section | No | User-defined additional sections |

### Output Generation

When the user completes all sections, the `skill-assembler.ts` module generates two files:

**1. `SKILL.md`** (with YAML front matter for Claude Code compatibility):
```markdown
---
name: skill-name-here
description: >
  Description extracted from the description section.
---

# Skill Display Name

[Description paragraph]

## Quick Install

[Install commands]

## What It Does

[Capability bullets]

...

---

*This skill is part of [Open Medical Skills](https://github.com/gitjfmd/open-medical-skills)...*
```

**2. Content YAML** (`content/skills/skill-name.yaml`):
```yaml
name: "skill-name"
display_name: "Skill Display Name"
description: "Brief description"
author: "Author Name"
repository: "https://github.com/..."
category: "diagnosis"
tags: ["tag1", "tag2"]
version: "1.0.0"
license: "MIT"
type: "skill"
install:
  npx: "npx skills add ..."
  git: "git clone ..."
evidence_level: "moderate"
safety_classification: "safe"
specialty: ["specialty1"]
reviewer: "Pending Review"
date_added: "2026-03-08"
verified: false
```

### State Management

- All chat state and section content stored in React state (useState/useReducer)
- Auto-save to localStorage on every section change (keyed by skill name)
- Resume from localStorage on page reload
- Export/import skill drafts as JSON for portability

### Magic Button Behavior

1. User types rough content for the current section
2. Clicks Magic Button (or Ctrl+Enter)
3. Button shows loading spinner
4. System constructs prompt: `[section system prompt] + [user content] + [any previous sections for context]`
5. Sends to configured LLM endpoint
6. Streams response back (if provider supports SSE) or shows on completion
7. Response appears as an "assistant" message in the chat
8. User can: Accept (copies to section preview), Regenerate, or Edit manually

### Add Custom Section

Users can add sections beyond the standard template:
- Click "+ Add Section" at the bottom of the sidebar
- Enter section title
- Write content manually or use the Magic Button with a generic system prompt
- Custom sections are inserted before the References section in the final output

## Design Guidelines

- Follow existing OMS design system (teal-600 accent, Inter font, clean/professional)
- Chat interface should feel medical-grade, not like a toy chatbot
- Section sidebar uses completion checkmarks (similar to a clinical form)
- Preview pane renders markdown in real-time
- Mobile-responsive: sidebar collapses to a dropdown on small screens

## Dependencies

- `react-markdown` — for preview rendering
- `js-yaml` — for YAML generation
- No additional UI framework needed (TailwindCSS handles styling)

## Content Validation

Before generating output, validate:
- All required sections have content
- Category is one of the 14 valid medical categories
- Evidence level is one of: high, moderate, low, expert-opinion
- Safety classification is one of: safe, caution, restricted
- Repository URL is a valid URL
- Date format is YYYY-MM-DD

## Security Considerations

- API keys stored in browser localStorage only, never sent to OMS servers
- LLM calls go directly from browser to user's chosen endpoint
- No PHI/PII should be included in skill content (add warning banner)
- Content is user-generated and must go through physician review before listing

## Future Enhancements

- Real-time collaboration (multiple authors editing sections)
- Version history per section
- Template library (pre-filled sections for common skill types)
- Auto-suggest category and tags from content analysis
- Integration with the submission pipeline (direct PR from the create page)
