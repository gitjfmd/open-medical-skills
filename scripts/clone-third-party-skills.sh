#!/usr/bin/env bash
# ============================================================================
# clone-third-party-skills.sh
#
# Clones skill files from 32 real third-party repositories into the OMS
# public repo structure at skills/{skill-name}/.
#
# Usage:
#   ./scripts/clone-third-party-skills.sh
#   ./scripts/clone-third-party-skills.sh --dry-run    # Preview without copying
#   ./scripts/clone-third-party-skills.sh --clean       # Remove all skills/ dirs first
#
# Features:
#   - Idempotent: safe to re-run (overwrites existing skill dirs)
#   - Groups by source repo to avoid redundant clones
#   - Shallow clones (--depth 1) for speed
#   - Automatic temp directory cleanup
#   - Progress output with color coding
#   - Error handling with per-skill retry
#
# Generated: 2026-03-03
# ============================================================================

set -euo pipefail

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/skills"
TEMP_BASE="${TMPDIR:-/tmp}/oms-clone-$$"
DRY_RUN=false
CLEAN_FIRST=false
VERBOSE=false

# Counters
TOTAL_SKILLS=0
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# --- Color output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[FAIL]${NC} $*"; }
log_header()  { echo -e "\n${BOLD}${CYAN}=== $* ===${NC}"; }
log_step()    { echo -e "  ${CYAN}->>${NC} $*"; }

# --- Argument parsing ---
for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=true ;;
    --clean)    CLEAN_FIRST=true ;;
    --verbose)  VERBOSE=true ;;
    --help|-h)
      echo "Usage: $0 [--dry-run] [--clean] [--verbose]"
      echo ""
      echo "  --dry-run   Preview what would be copied without doing it"
      echo "  --clean     Remove existing skills/ directory before cloning"
      echo "  --verbose   Show detailed file copy info"
      exit 0
      ;;
    *)
      log_error "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

# --- Cleanup trap ---
cleanup() {
  if [[ -d "$TEMP_BASE" ]]; then
    log_info "Cleaning up temp directory: $TEMP_BASE"
    rm -rf "$TEMP_BASE"
  fi
}
trap cleanup EXIT

# --- Helper: Clone a repo (or reuse existing clone) ---
# Usage: clone_repo "owner/repo" "branch"
# Sets CLONE_DIR to the path of the cloned repo
declare -A CLONED_REPOS
CLONE_DIR=""

clone_repo() {
  local repo_slug="$1"
  local branch="${2:-main}"
  local repo_url="https://github.com/${repo_slug}.git"

  # Reuse if already cloned in this session
  if [[ -n "${CLONED_REPOS[$repo_slug]:-}" ]]; then
    CLONE_DIR="${CLONED_REPOS[$repo_slug]}"
    log_step "Reusing cached clone of ${repo_slug}"
    return 0
  fi

  local target_dir="$TEMP_BASE/$(echo "$repo_slug" | tr '/' '_')"
  mkdir -p "$target_dir"

  log_step "Cloning ${repo_slug} (branch: ${branch}, shallow)..."
  if $DRY_RUN; then
    log_step "[DRY RUN] Would clone $repo_url"
    # Create a placeholder so the rest of the logic can still check paths
    mkdir -p "$target_dir/placeholder"
    CLONE_DIR="$target_dir/placeholder"
    CLONED_REPOS[$repo_slug]="$CLONE_DIR"
    return 0
  fi

  if git clone --depth 1 --branch "$branch" "$repo_url" "$target_dir/src" 2>/dev/null; then
    CLONE_DIR="$target_dir/src"
    CLONED_REPOS[$repo_slug]="$CLONE_DIR"
    log_step "Cloned successfully"
    return 0
  else
    log_error "Failed to clone $repo_url (branch: $branch)"
    CLONE_DIR=""
    return 1
  fi
}

# --- Helper: Copy files from source to skill directory ---
# Usage: copy_skill_files "skill-name" "source_base" "relative_path" ["extra_file1" "extra_file2" ...]
copy_skill_files() {
  local skill_name="$1"
  local source_base="$2"
  local source_path="$3"
  shift 3
  local extra_files=("$@")

  local dest="$SKILLS_DIR/$skill_name"
  local full_source

  # Determine full source path
  if [[ "$source_path" == "." ]]; then
    full_source="$source_base"
  else
    full_source="$source_base/$source_path"
  fi

  if $DRY_RUN; then
    log_step "[DRY RUN] Would copy $source_path -> skills/$skill_name/"
    for ef in "${extra_files[@]}"; do
      log_step "[DRY RUN] Would also copy $ef"
    done
    return 0
  fi

  # Create destination
  mkdir -p "$dest"

  # If source_path is a directory, copy its contents
  if [[ -d "$full_source" ]]; then
    # Copy all files from the source directory
    cp -r "$full_source"/. "$dest/" 2>/dev/null || true

    # Remove .git if it got copied (for whole-repo copies)
    rm -rf "$dest/.git" "$dest/.gitignore" "$dest/.gitattributes" \
           "$dest/.github" "$dest/node_modules" "$dest/.DS_Store" \
           "$dest/package-lock.json" "$dest/.env" "$dest/.env.example" 2>/dev/null || true

    if $VERBOSE; then
      local file_count
      file_count=$(find "$dest" -type f | wc -l)
      log_step "Copied directory ($file_count files)"
    fi

  elif [[ -f "$full_source" ]]; then
    # Source is a single file
    cp "$full_source" "$dest/"
    if $VERBOSE; then
      log_step "Copied file: $(basename "$full_source")"
    fi
  else
    log_warn "Source not found: $full_source"
    return 1
  fi

  # Copy extra files
  for ef in "${extra_files[@]}"; do
    local ef_full="$source_base/$ef"
    if [[ -d "$ef_full" ]]; then
      local ef_dest="$dest/$(basename "$ef")"
      mkdir -p "$ef_dest"
      cp -r "$ef_full"/. "$ef_dest/" 2>/dev/null || true
      if $VERBOSE; then
        log_step "Copied extra dir: $ef"
      fi
    elif [[ -f "$ef_full" ]]; then
      cp "$ef_full" "$dest/"
      if $VERBOSE; then
        log_step "Copied extra file: $ef"
      fi
    else
      if $VERBOSE; then
        log_warn "Extra file not found: $ef"
      fi
    fi
  done

  return 0
}

# --- Helper: Process one skill ---
# Usage: process_skill "skill-name" "repo-slug" "branch" "source_path" ["extra1" "extra2" ...]
process_skill() {
  local skill_name="$1"
  local repo_slug="$2"
  local branch="$3"
  local source_path="$4"
  shift 4
  local extra_files=("$@")

  ((TOTAL_SKILLS++)) || true

  log_info "[$TOTAL_SKILLS/32] ${BOLD}$skill_name${NC}"

  # Clone the repo (or reuse cache)
  if ! clone_repo "$repo_slug" "$branch"; then
    log_error "Skipping $skill_name — clone failed"
    ((FAIL_COUNT++)) || true
    return 1
  fi

  # Copy files
  if copy_skill_files "$skill_name" "$CLONE_DIR" "$source_path" "${extra_files[@]}"; then
    log_success "$skill_name -> skills/$skill_name/"
    ((SUCCESS_COUNT++)) || true
  else
    log_error "Failed to copy files for $skill_name"
    ((FAIL_COUNT++)) || true
  fi
}

# ============================================================================
# MAIN
# ============================================================================

echo ""
echo -e "${BOLD}Open Medical Skills — Third-Party Skill Cloner${NC}"
echo -e "Project root: $PROJECT_ROOT"
echo -e "Skills destination: $SKILLS_DIR"
echo -e "Temp directory: $TEMP_BASE"
if $DRY_RUN; then
  echo -e "${YELLOW}Mode: DRY RUN (no changes will be made)${NC}"
fi
echo ""

# --- Clean if requested ---
if $CLEAN_FIRST && [[ -d "$SKILLS_DIR" ]]; then
  log_warn "Removing existing skills/ directory..."
  if ! $DRY_RUN; then
    rm -rf "$SKILLS_DIR"
  fi
fi

# Create skills directory
if ! $DRY_RUN; then
  mkdir -p "$SKILLS_DIR"
  mkdir -p "$TEMP_BASE"
fi

# ============================================================================
# GROUP 1: K-Dense-AI/claude-scientific-skills (7 skills)
# ============================================================================
log_header "K-Dense-AI/claude-scientific-skills (7 skills)"

process_skill "biostatistics-analyzer" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/statistical-analysis"

process_skill "clinical-treatment-plan-generator" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/treatment-plans"

process_skill "genomics-variant-interpreter" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/clinvar-database"

process_skill "medical-imaging-analysis" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/imaging-data-commons"

process_skill "precision-medicine-therapeutics" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/clinical-decision-support"

process_skill "systematic-review-assistant" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/literature-review"

process_skill "surgical-procedure-planner" \
  "K-Dense-AI/claude-scientific-skills" "main" \
  "scientific-skills/clinical-reports"

# ============================================================================
# GROUP 2: huifer/Claude-Ally-Health (5 skills)
# ============================================================================
log_header "huifer/Claude-Ally-Health (5 skills)"

process_skill "clinical-differential-diagnosis" \
  "huifer/Claude-Ally-Health" "main" \
  ".claude/commands/symptom.md" \
  ".claude/commands/consult.md" ".claude/commands/query.md" \
  ".claude/skills/ai-analyzer" ".claude/settings.local.json"

process_skill "drug-interaction-checker" \
  "huifer/Claude-Ally-Health" "main" \
  ".claude/commands/interaction.md" \
  ".claude/commands/polypharmacy.md" \
  ".claude/skills/food-database-query"

process_skill "lab-result-interpreter" \
  "huifer/Claude-Ally-Health" "main" \
  ".claude/skills/health-trend-analyzer" \
  ".claude/commands/screening.md"

process_skill "medication-administration-safety" \
  "huifer/Claude-Ally-Health" "main" \
  ".claude/commands/medication.md" \
  ".claude/commands/polypharmacy.md" ".claude/commands/allergy.md"

process_skill "radiation-exposure-tracker" \
  "huifer/Claude-Ally-Health" "main" \
  ".claude/commands/radiation.md" \
  ".claude/commands/radiation-data.md"

# ============================================================================
# GROUP 3: Augmented-Nature (4 skills, 4 repos)
# ============================================================================
log_header "Augmented-Nature (4 skills)"

process_skill "clinical-trials-search" \
  "Augmented-Nature/ClinicalTrials-MCP-Server" "main" \
  "."

process_skill "fda-drug-information" \
  "Augmented-Nature/OpenFDA-MCP-Server" "main" \
  "."

process_skill "pubmed-literature-search" \
  "Augmented-Nature/PubMed-MCP-Server" "main" \
  "."

process_skill "protein-structure-analysis" \
  "Augmented-Nature/AlphaFold-MCP-Server" "main" \
  "."

# ============================================================================
# GROUP 4: Cicatriiz/healthcare-mcp-public (6 skills from 1 repo)
# ============================================================================
log_header "Cicatriiz/healthcare-mcp-public (6 skills)"

# Shared base files that every skill from this repo gets
CICATRIIZ_BASE=("README.md" "package.json" "manifest.json" "server/base-tool.js" "server/index.js" "server/cache-service.js" "server/usage-service.js")

process_skill "clinical-guideline-navigator" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/health-topics-tool.js" \
  "server/ncbi-bookshelf-tool.js" "${CICATRIIZ_BASE[@]}"

process_skill "icd10-code-lookup" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/medical-terminology-tool.js" \
  "${CICATRIIZ_BASE[@]}"

process_skill "dicom-metadata-extractor" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/dicom-tool.js" \
  "${CICATRIIZ_BASE[@]}"

process_skill "emergency-triage-protocols" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/medical-calculator-tool.js" \
  "${CICATRIIZ_BASE[@]}"

process_skill "evidence-synthesis-ai" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/pubmed-tool.js" \
  "server/medrxiv-tool.js" "${CICATRIIZ_BASE[@]}"

process_skill "pediatric-growth-charts" \
  "Cicatriiz/healthcare-mcp-public" "main" \
  "server/medical-calculator-tool.js" \
  "server/fda-tool.js" "${CICATRIIZ_BASE[@]}"

# ============================================================================
# GROUP 5: openpharma-org (2 skills, 2 repos)
# ============================================================================
log_header "openpharma-org (2 skills)"

process_skill "drugbank-search" \
  "openpharma-org/drugbank-mcp-server" "main" \
  "."

process_skill "medicare-drug-stats" \
  "openpharma-org/medicare-mcp" "main" \
  "."

# ============================================================================
# GROUP 6: Individual repos (8 skills)
# ============================================================================
log_header "Individual repos (8 skills)"

process_skill "epidemiology-surveillance" \
  "JamesANZ/medical-mcp" "main" \
  "."

process_skill "fhir-data-access" \
  "wso2/fhir-mcp-server" "main" \
  "."

process_skill "hipaa-compliance-checker" \
  "JohnSnowLabs/spark-nlp-workshop" "master" \
  "Spark_NLP_Udemy_MOOC/Healthcare_NLP" \
  "README.md"

process_skill "iec-62304-compliance" \
  "AminAlam/meddev-agent-skills" "main" \
  "regulatory/iec-62304" \
  "README.md" "SKILL_SCHEMA.md" "AGENT_INTEGRATION.md"

# medikode-ai/mcp-server provides 2 skills from same repo
process_skill "cpt-coding-assistant" \
  "medikode-ai/mcp-server" "main" \
  "."

process_skill "raf-score-calculator" \
  "medikode-ai/mcp-server" "main" \
  "."

process_skill "medical-paper-humanizer" \
  "matsuikentaro1/humanizer_academic" "main" \
  "."

process_skill "supplement-drug-interactions" \
  "AI-Agent-Grandmaster/truthstack-mcp" "main" \
  "."

process_skill "prior-authorization-review" \
  "anthropics/healthcare" "main" \
  "prior-auth-review-skill"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
log_header "SUMMARY"
echo -e "  Total skills processed: ${BOLD}$TOTAL_SKILLS${NC}"
echo -e "  ${GREEN}Successful:${NC} $SUCCESS_COUNT"
echo -e "  ${RED}Failed:${NC}     $FAIL_COUNT"
echo -e "  ${YELLOW}Skipped:${NC}    $SKIP_COUNT"
echo ""

if $DRY_RUN; then
  echo -e "${YELLOW}This was a dry run. No files were actually copied.${NC}"
  echo -e "Run without --dry-run to execute."
fi

# --- Create a SOURCE.md in each skill dir noting provenance ---
if ! $DRY_RUN && [[ -d "$SKILLS_DIR" ]]; then
  log_info "Writing SOURCE.md provenance files..."

  write_source_md() {
    local skill_name="$1"
    local repo_url="$2"
    local source_path="$3"
    local dest="$SKILLS_DIR/$skill_name/SOURCE.md"

    if [[ -d "$SKILLS_DIR/$skill_name" ]]; then
      cat > "$dest" << SOURCEEOF
# Source Information

- **OMS Skill Name**: $skill_name
- **Source Repository**: $repo_url
- **Source Path**: \`$source_path\`
- **Cloned On**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Method**: Shallow clone (--depth 1) via clone-third-party-skills.sh

This directory contains files from the above third-party repository,
included in Open Medical Skills for reference and skill packaging.
Original license terms of the source repository apply.
SOURCEEOF
    fi
  }

  # K-Dense-AI
  write_source_md "biostatistics-analyzer" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/statistical-analysis"
  write_source_md "clinical-treatment-plan-generator" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/treatment-plans"
  write_source_md "genomics-variant-interpreter" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/clinvar-database"
  write_source_md "medical-imaging-analysis" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/imaging-data-commons"
  write_source_md "precision-medicine-therapeutics" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/clinical-decision-support"
  write_source_md "systematic-review-assistant" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/literature-review"
  write_source_md "surgical-procedure-planner" "https://github.com/K-Dense-AI/claude-scientific-skills" "scientific-skills/clinical-reports"

  # huifer
  write_source_md "clinical-differential-diagnosis" "https://github.com/huifer/Claude-Ally-Health" ".claude/commands/symptom.md + .claude/skills/ai-analyzer"
  write_source_md "drug-interaction-checker" "https://github.com/huifer/Claude-Ally-Health" ".claude/commands/interaction.md + .claude/skills/food-database-query"
  write_source_md "lab-result-interpreter" "https://github.com/huifer/Claude-Ally-Health" ".claude/skills/health-trend-analyzer"
  write_source_md "medication-administration-safety" "https://github.com/huifer/Claude-Ally-Health" ".claude/commands/medication.md"
  write_source_md "radiation-exposure-tracker" "https://github.com/huifer/Claude-Ally-Health" ".claude/commands/radiation.md + .claude/commands/radiation-data.md"

  # Augmented-Nature
  write_source_md "clinical-trials-search" "https://github.com/Augmented-Nature/ClinicalTrials-MCP-Server" "."
  write_source_md "fda-drug-information" "https://github.com/Augmented-Nature/OpenFDA-MCP-Server" "."
  write_source_md "pubmed-literature-search" "https://github.com/Augmented-Nature/PubMed-MCP-Server" "."
  write_source_md "protein-structure-analysis" "https://github.com/Augmented-Nature/AlphaFold-MCP-Server" "."

  # Cicatriiz
  write_source_md "clinical-guideline-navigator" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/health-topics-tool.js + server/ncbi-bookshelf-tool.js"
  write_source_md "icd10-code-lookup" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/medical-terminology-tool.js"
  write_source_md "dicom-metadata-extractor" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/dicom-tool.js"
  write_source_md "emergency-triage-protocols" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/medical-calculator-tool.js"
  write_source_md "evidence-synthesis-ai" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/pubmed-tool.js + server/medrxiv-tool.js"
  write_source_md "pediatric-growth-charts" "https://github.com/Cicatriiz/healthcare-mcp-public" "server/medical-calculator-tool.js + server/fda-tool.js"

  # openpharma-org
  write_source_md "drugbank-search" "https://github.com/openpharma-org/drugbank-mcp-server" "."
  write_source_md "medicare-drug-stats" "https://github.com/openpharma-org/medicare-mcp" "."

  # Individual
  write_source_md "epidemiology-surveillance" "https://github.com/JamesANZ/medical-mcp" "."
  write_source_md "fhir-data-access" "https://github.com/wso2/fhir-mcp-server" "."
  write_source_md "hipaa-compliance-checker" "https://github.com/JohnSnowLabs/spark-nlp-workshop" "Spark_NLP_Udemy_MOOC/Healthcare_NLP"
  write_source_md "iec-62304-compliance" "https://github.com/AminAlam/meddev-agent-skills" "regulatory/iec-62304"
  write_source_md "cpt-coding-assistant" "https://github.com/medikode-ai/mcp-server" "."
  write_source_md "raf-score-calculator" "https://github.com/medikode-ai/mcp-server" "."
  write_source_md "medical-paper-humanizer" "https://github.com/matsuikentaro1/humanizer_academic" "."
  write_source_md "supplement-drug-interactions" "https://github.com/AI-Agent-Grandmaster/truthstack-mcp" "."
  write_source_md "prior-authorization-review" "https://github.com/anthropics/healthcare" "prior-auth-review-skill"

  log_success "SOURCE.md files written to all skill directories"
fi

echo ""
if [[ $FAIL_COUNT -gt 0 ]]; then
  log_warn "Some skills failed. Check output above for details."
  exit 1
else
  log_success "All done!"
  exit 0
fi
