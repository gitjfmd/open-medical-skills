/**
 * MagicButton.tsx — The sparkle button that triggers LLM refinement.
 *
 * When clicked, sends the user's rough content for the current section to the
 * configured LLM provider along with the section-specific system prompt. Shows
 * a loading state during the API call.
 *
 * Behavior:
 * - Idle: Sparkle icon with "Refine with AI" tooltip
 * - Loading: Spinning animation, button disabled
 * - Error: Red outline, retry option
 * - Keyboard shortcut: Ctrl+Enter (Cmd+Enter on Mac)
 *
 * Props:
 * - onClick: () => void — triggers the refinement flow
 * - isLoading: boolean — whether an LLM call is in progress
 * - disabled: boolean — disabled when input is empty
 *
 * TODO: Implement during feature development phase.
 */

interface MagicButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function MagicButton({
  onClick,
  isLoading,
  disabled,
}: MagicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title="Refine with AI (Ctrl+Enter)"
      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
    >
      {isLoading ? (
        <span className="animate-spin">&#9733;</span>
      ) : (
        <span>&#10024;</span>
      )}
      {isLoading ? 'Refining...' : 'Refine with AI'}
    </button>
  );
}
