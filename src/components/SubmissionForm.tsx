import { useState, useEffect, useRef } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "../lib/categories";
import { getUser, isLoggedIn, type GitHubUser } from "../lib/auth";

export default function SubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [authUser, setAuthUser] = useState<GitHubUser | null>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  // Check auth state on mount + listen for auth events from SubmitAuthBanner
  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser();
      if (user) {
        setAuthUser(user);
        // Pre-fill the author field
        if (authorInputRef.current && !authorInputRef.current.value) {
          authorInputRef.current.value = user.login;
        }
      }
    }

    function handleAuthUser(e: Event) {
      const detail = (e as CustomEvent<GitHubUser>).detail;
      setAuthUser(detail);
      if (authorInputRef.current && !authorInputRef.current.value) {
        authorInputRef.current.value = detail.login;
      }
    }

    window.addEventListener("oms:auth-user", handleAuthUser);
    return () => window.removeEventListener("oms:auth-user", handleAuthUser);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Basic validation
    const name = formData.get("name") as string;
    const displayName = formData.get("display_name") as string;
    const description = formData.get("description") as string;
    const repository = formData.get("repository") as string;

    if (!name || !displayName || !description || !repository) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate repository URL
    try {
      new URL(repository);
    } catch {
      setError("Please enter a valid repository URL.");
      return;
    }

    // In production this would POST to a Cloudflare Worker
    // For now, show success
    setSubmitted(true);
    setError("");
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-800 dark:text-green-200">Submission Received</h3>
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          Your skill has been submitted for review. A physician maintainer will review it shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-primary hover:underline dark:text-primary-light"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Skill Name (slug) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="my-medical-skill"
          pattern="[a-z0-9-]+"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and hyphens only</p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          placeholder="My Medical Skill"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Describe what this skill does and how it helps healthcare professionals..."
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Author */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Author <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            ref={authorInputRef}
            type="text"
            id="author"
            name="author"
            placeholder="Your Name or Organization"
            defaultValue={authUser?.login || ""}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          {authUser && (
            <span className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 flex items-center gap-1.5 text-xs text-primary dark:text-primary-light">
              <img
                src={authUser.avatar_url}
                alt=""
                className="h-4 w-4 rounded-full"
                width={16}
                height={16}
              />
              via GitHub
            </span>
          )}
        </div>
      </div>

      {/* Repository */}
      <div>
        <label htmlFor="repository" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Repository URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="repository"
          name="repository"
          placeholder="https://github.com/owner/repo"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="comma-separated tags"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">e.g. cardiology, ecg, heart-failure</p>
      </div>

      {/* Install: git */}
      <div>
        <label htmlFor="install_git" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Git Install Command
        </label>
        <input
          type="text"
          id="install_git"
          name="install_git"
          placeholder="git clone https://github.com/owner/repo ~/.claude/skills/name"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        Submit for Review
      </button>
    </form>
  );
}
