/**
 * SectionPreview.tsx — Real-time markdown preview for the current section.
 *
 * Renders the accepted/refined content for the active section as formatted
 * markdown. Shows a live preview as the user edits or accepts LLM suggestions.
 *
 * Features:
 * - Markdown rendering via react-markdown
 * - Syntax highlighting for code blocks
 * - Edit button to manually modify accepted content
 * - Copy-to-clipboard for the raw markdown
 *
 * Props:
 * - sectionId: string — active section identifier
 * - content: string — markdown content to render
 * - onEdit: (newContent: string) => void — callback for manual edits
 *
 * TODO: Implement during feature development phase.
 */

interface SectionPreviewProps {
  sectionId: string;
  content: string;
  onEdit: (newContent: string) => void;
}

export default function SectionPreview({
  sectionId,
  content,
  onEdit,
}: SectionPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Preview
        </h3>
        {/* Placeholder: edit and copy buttons */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 prose dark:prose-invert max-w-none">
        {content ? (
          <>{/* Placeholder: react-markdown rendering */}</>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic">
            Complete this section to see a preview.
          </p>
        )}
      </div>
    </div>
  );
}
