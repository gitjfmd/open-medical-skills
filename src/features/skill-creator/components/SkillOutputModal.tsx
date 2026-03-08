/**
 * SkillOutputModal.tsx — Modal displaying the generated skill files.
 *
 * After the user completes all sections and clicks "Generate Skill", this modal
 * shows two tabs:
 * 1. SKILL.md — the full markdown file with YAML front matter
 * 2. Content YAML — the content/skills/*.yaml file for the website
 *
 * Actions:
 * - Copy to clipboard (per file)
 * - Download as file (per file)
 * - Download both as ZIP
 * - Submit as PR (opens submission flow)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - skillMd: string — generated SKILL.md content
 * - contentYaml: string — generated content YAML
 * - skillName: string — kebab-case skill name (used for filenames)
 *
 * TODO: Implement during feature development phase.
 */

interface SkillOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillMd: string;
  contentYaml: string;
  skillName: string;
}

export default function SkillOutputModal({
  isOpen,
  onClose,
  skillMd,
  contentYaml,
  skillName,
}: SkillOutputModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Placeholder: tab bar, content area, action buttons */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Generated Skill Files
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review your generated files below. Download or submit directly.
          </p>
        </div>
      </div>
    </div>
  );
}
