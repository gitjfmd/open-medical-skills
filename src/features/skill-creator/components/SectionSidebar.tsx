/**
 * SectionSidebar.tsx — Section navigation sidebar for the skill creator.
 *
 * Displays a vertical list of all skill sections with:
 * - Completion status indicators (empty, draft, refined, accepted)
 * - Click to navigate between sections
 * - Visual highlighting for the active section
 * - "+ Add Section" button at the bottom for custom sections
 *
 * Design:
 * - Styled like a clinical checklist (checkmarks, progress indicators)
 * - Collapses to a dropdown on mobile viewports
 * - Uses teal-600 accent for completed/active states
 *
 * Props:
 * - sections: SkillSection[] — all sections with their current status
 * - activeSectionId: string — currently selected section
 * - onSectionSelect: (id: string) => void — callback when user clicks a section
 * - onAddSection: () => void — callback for adding a custom section
 *
 * TODO: Implement during feature development phase.
 */

import type { SkillSection } from '../types';

interface SectionSidebarProps {
  sections: SkillSection[];
  activeSectionId: string;
  onSectionSelect: (id: string) => void;
  onAddSection: () => void;
}

export default function SectionSidebar({
  sections,
  activeSectionId,
  onSectionSelect,
  onAddSection,
}: SectionSidebarProps) {
  return (
    <nav className="flex flex-col h-full p-4">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Skill Sections
      </h2>

      <ul className="flex-1 space-y-1">
        {/* Placeholder: section list items with status icons */}
      </ul>

      <button
        onClick={onAddSection}
        className="mt-4 w-full text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 border border-dashed border-teal-300 dark:border-teal-600 rounded-lg py-2"
      >
        + Add Section
      </button>
    </nav>
  );
}
