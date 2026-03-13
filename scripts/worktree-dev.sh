#!/usr/bin/env bash
# Usage: ./scripts/worktree-dev.sh <worktree-name> [port]
# Example: ./scripts/worktree-dev.sh skills 4323

set -euo pipefail

WORKTREE_BASE="/home/jfmd/.jfmd/projects/INTELMEDICA-COMP/worktrees"

# Worktree -> port mapping
declare -A PORTS=(
  [dev]=4321
  [home]=4322
  [skills]=4323
  [plugins]=4324
  [submit]=4325
  [create]=4326
  [fda]=4327
)

# Worktree -> branch mapping
declare -A BRANCHES=(
  [dev]=dev
  [home]=feat/home
  [skills]=feat/skills
  [plugins]=feat/plugins
  [submit]=feat/submit
  [create]=feat/create-skill
  [fda]=feat/fda-tools
)

NAME="${1:-}"
PORT="${2:-${PORTS[$NAME]:-4321}}"

if [[ -z "$NAME" ]]; then
  echo "Usage: $0 <name> [port]"
  echo ""
  echo "Available worktrees:"
  for key in "${!PORTS[@]}"; do
    echo "  $key (port ${PORTS[$key]}, branch ${BRANCHES[$key]})"
  done
  exit 1
fi

WT_DIR="$WORKTREE_BASE/oms-$NAME"
BRANCH="${BRANCHES[$NAME]:-feat/$NAME}"

# Create worktree if it doesn't exist
if [[ ! -d "$WT_DIR" ]]; then
  echo "Creating worktree: $WT_DIR (branch: $BRANCH)"
  git worktree add "$WT_DIR" -b "$BRANCH" 2>/dev/null || git worktree add "$WT_DIR" "$BRANCH"

  # Symlink shared resources
  ln -sf "$(pwd)/data" "$WT_DIR/data" 2>/dev/null || true
  ln -sf "$(pwd)/.env" "$WT_DIR/.env" 2>/dev/null || true

  # Install dependencies
  echo "Installing dependencies in $WT_DIR..."
  (cd "$WT_DIR" && pnpm install)
fi

echo "Starting dev server in $WT_DIR on port $PORT..."
cd "$WT_DIR" && pnpm dev --port "$PORT" --host 0.0.0.0
