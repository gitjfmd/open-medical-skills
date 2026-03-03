import { useState, useEffect } from "react";
import { getAuthUrl, getUser, isLoggedIn, type GitHubUser } from "../lib/auth";

/**
 * SubmitAuthBanner — shown at the top of the submit page.
 *
 * - If signed in: shows "Signed in as @username" with avatar
 * - If signed out: shows a prompt to sign in for a smoother experience
 *
 * Also dispatches a custom event with the user's GitHub login so the
 * SubmissionForm can pre-fill the author field.
 */
export default function SubmitAuthBanner() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      const stored = getUser();
      setUser(stored);

      // Dispatch event so the SubmissionForm can pre-fill the author field
      if (stored) {
        window.dispatchEvent(
          new CustomEvent("oms:auth-user", { detail: stored })
        );
      }
    }
  }, []);

  if (!mounted) return null;

  // Signed in
  if (user) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="h-8 w-8 rounded-full ring-2 ring-primary/20"
          width={32}
          height={32}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Signed in as{" "}
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline dark:text-primary-light"
            >
              @{user.login}
            </a>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your GitHub username will be pre-filled in the submission form.
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-primary dark:text-primary-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  // Signed out
  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          Sign in for a smoother submission experience
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your GitHub username will be pre-filled and linked to your submission.
        </p>
      </div>
      <button
        onClick={() => {
          window.location.href = getAuthUrl();
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        Sign in with GitHub
      </button>
    </div>
  );
}
