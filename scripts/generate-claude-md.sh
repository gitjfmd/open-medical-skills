#!/usr/bin/env bash
# generate-claude-md.sh — Auto-generate a sanitized CLAUDE.md from project metadata.
# Run manually or via GitHub Actions on push to main.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT="$PROJECT_ROOT/CLAUDE.md"

# --- Extract project metadata from package.json ---
PROJECT_NAME=$(node -e "const p = require('$PROJECT_ROOT/package.json'); console.log(p.name)")
PROJECT_DESC=$(node -e "const p = require('$PROJECT_ROOT/package.json'); console.log(p.description)")

# --- Extract categories from src/content.config.ts ---
CATEGORIES=$(grep -oP "'[a-z-]+'" "$PROJECT_ROOT/src/content.config.ts" | sort -u | tr -d "'" | paste -sd ', ')

# --- Count content files ---
SKILL_COUNT=$(find "$PROJECT_ROOT/content/skills" -name '*.yaml' -o -name '*.yml' 2>/dev/null | wc -l)
PLUGIN_COUNT=$(find "$PROJECT_ROOT/content/plugins" -name '*.yaml' -o -name '*.yml' 2>/dev/null | wc -l)

# --- Generate directory tree (public dirs only) ---
TREE=$(cat <<'TREEEOF'
```
open-medical-skills/
├── .github/                     # GitHub Actions, issue/PR templates
├── cli/                         # Node.js CLI tool
├── content/                     # Content data (YAML)
│   ├── skills/                  # Skill definitions (.yaml)
│   └── plugins/                 # Plugin definitions (.yaml)
├── logo/                        # Brand assets (SVG)
├── plugins/                     # Full plugin source code
├── public/                      # Static assets
├── scripts/                     # Build & pipeline automation
├── skills/                      # Full skill source code
├── src/                         # Website source code
│   ├── components/              # UI components (Astro + React)
│   ├── content.config.ts        # Content schemas (Zod)
│   ├── features/                # Feature modules
│   ├── layouts/                 # Page layouts
│   ├── lib/                     # Utilities
│   ├── pages/                   # Astro pages
│   └── styles/                  # Global styles
├── workers/                     # Cloudflare Workers
├── CLAUDE.md                    # This file (auto-generated)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```
TREEEOF
)

# --- Write CLAUDE.md ---
cat > "$OUTPUT" <<EOF
# ${PROJECT_NAME}

> ${PROJECT_DESC}

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 5 (static output, islands architecture) |
| **UI** | React 19 islands (interactive), \`.astro\` (static) |
| **Styling** | TailwindCSS 4 via \`@tailwindcss/vite\` |
| **Search** | Pagefind (client-side, build-time index) |
| **Content** | YAML files in \`content/skills/\` and \`content/plugins/\` |
| **Submission API** | Cloudflare Worker (\`workers/submission-api/\`) |
| **CLI** | Node.js CLI tool (\`cli/\`) |
| **Package Manager** | pnpm 10.x |
| **Deployment** | Cloudflare Pages (static) + CF Workers (API) |

## Content

- **Skills**: ${SKILL_COUNT} definitions in \`content/skills/\`
- **Plugins**: ${PLUGIN_COUNT} definitions in \`content/plugins/\`

### Medical Categories

${CATEGORIES}

### Evidence Levels

\`high\` (green), \`moderate\` (amber), \`low\` (red), \`expert-opinion\` (gray)

### Safety Classifications

\`safe\` (green), \`caution\` (amber), \`restricted\` (red)

## Directory Structure

${TREE}

## Development

\`\`\`bash
pnpm install
pnpm dev
pnpm build
\`\`\`

## Contributing

See the submission workflow on the website or open an issue/PR with a properly formatted YAML file in \`content/skills/\` or \`content/plugins/\`.

## Maintained By

Compiled and maintained by physicians, for physicians and the healthcare industry.
**Organization**: IntelMedica.ai
EOF

echo "Generated CLAUDE.md (${SKILL_COUNT} skills, ${PLUGIN_COUNT} plugins)"

# --- Leak detection guardrail ---
echo "Running leak detection..."
LEAK_PATTERNS='100\.[0-9]+\.[0-9]+\.[0-9]+|pmx2-|main-boss|oms_tracker|\.kube/|:30500|:30555|:30445'

if grep -Pn "$LEAK_PATTERNS" "$OUTPUT"; then
  echo "ERROR: Leaked infrastructure details detected in CLAUDE.md!" >&2
  exit 1
fi

echo "Leak detection passed."
