import { useState, useEffect, useRef } from "react";
import {
  getAuthUrl,
  getUser,
  isLoggedIn,
  logout,
  type GitHubUser,
} from "../lib/auth";

/**
 * AuthButton — React island for GitHub OAuth sign-in/sign-out.
 *
 * Rendered with `client:load` in the Astro Header so it hydrates immediately.
 *
 * States:
 *  - Not mounted (SSR/SSG): renders a placeholder button to prevent layout shift
 *  - Logged out: "Sign in with GitHub" button
 *  - Logged in: user avatar + name with a dropdown (My Submissions, Sign Out)
 */
export default function AuthButton() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydrate: read auth state from localStorage
  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getUser());
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dropdownOpen]);

  // Listen for auth state changes from other tabs or the callback page
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "oms_github_token" || e.key === "oms_github_user") {
        if (isLoggedIn()) {
          setUser(getUser());
        } else {
          setUser(null);
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleSignIn() {
    window.location.href = getAuthUrl();
  }

  function handleSignOut() {
    logout();
    setUser(null);
    setDropdownOpen(false);
    // Optionally reload to reflect signed-out state in other components
    window.location.reload();
  }

  // SSR/SSG placeholder — prevents layout shift
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  // ------ Logged out ------
  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500"
        aria-label="Sign in with GitHub"
      >
        <GitHubIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  // ------ Logged in ------
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="h-7 w-7 rounded-full ring-2 ring-primary/20"
          width={28}
          height={28}
        />
        <span className="hidden text-slate-700 dark:text-slate-300 sm:inline">
          {user.name || user.login}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {/* User info header */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user.name || user.login}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              @{user.login}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href={`https://github.com/gitjfmd/open-medical-skills/pulls?q=is%3Apr+author%3A${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setDropdownOpen(false)}
            >
              <SubmissionsIcon className="h-4 w-4 text-slate-400" />
              My Submissions
            </a>

            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setDropdownOpen(false)}
            >
              <GitHubIcon className="h-4 w-4 text-slate-400" />
              GitHub Profile
            </a>
          </div>

          {/* Sign out */}
          <div className="border-t border-slate-200 py-1 dark:border-slate-700">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <SignOutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SubmissionsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
