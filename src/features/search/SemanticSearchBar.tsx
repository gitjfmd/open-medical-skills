/**
 * SemanticSearchBar.tsx — Enhanced search bar with Pagefind and semantic search modes.
 *
 * Toggles between local Pagefind search (instant, client-side) and semantic
 * vector search via the OMS Search API. Debounced input (300ms) with
 * graceful fallback when the API is unavailable.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

type SearchMode = 'local' | 'semantic';

interface SemanticResult {
  id: string;
  name: string;
  description: string;
  category: string;
  score: number;
  source: string;
}

interface SearchApiResponse {
  results: SemanticResult[];
  total: number;
  query: string;
  took_ms: number;
}

interface Props {
  /** Base URL for the search API (e.g., "https://search.openmedica.us") */
  apiBaseUrl?: string;
  /** Initial search mode */
  defaultMode?: SearchMode;
  /** Callback when results change (for parent integration) */
  onResults?: (results: SemanticResult[]) => void;
}

const DEBOUNCE_MS = 300;

export default function SemanticSearchBar({
  apiBaseUrl = '',
  defaultMode = 'local',
  onResults,
}: Props) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const [results, setResults] = useState<SemanticResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchSemantic = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setOpen(false);
        setError(null);
        onResults?.([]);
        return;
      }

      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      setError(null);

      try {
        const url = `${apiBaseUrl}/api/search?q=${encodeURIComponent(q)}&limit=8`;
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Search API returned ${response.status}`);
        }

        const data = (await response.json()) as SearchApiResponse;
        setResults(data.results);
        setOpen(data.results.length > 0);
        setHighlighted(-1);
        onResults?.(data.results);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // Cancelled, not an error
        }
        console.error('Semantic search failed:', err);
        setError(
          'Semantic search unavailable. Try local search or check your connection.'
        );
        setResults([]);
        setOpen(false);
        onResults?.([]);
      } finally {
        setIsSearching(false);
      }
    },
    [apiBaseUrl, onResults]
  );

  const searchLocal = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setOpen(false);
        window.dispatchEvent(
          new CustomEvent('search-change', { detail: { query: '' } })
        );
        onResults?.([]);
        return;
      }

      // Dispatch to Pagefind / existing local search infrastructure
      window.dispatchEvent(
        new CustomEvent('search-change', { detail: { query: q } })
      );
    },
    [onResults]
  );

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'semantic') {
        searchSemantic(query);
      } else {
        searchLocal(query);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, mode, searchSemantic, searchLocal]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0 && results[highlighted]) {
      window.location.href = `/skills/${results[highlighted].id}`;
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setOpen(false);
    setError(null);
    inputRef.current?.focus();
    onResults?.([]);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      {/* Mode toggle */}
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setMode('local')}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            mode === 'local'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setMode('semantic')}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            mode === 'semantic'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          Semantic
        </button>
        {mode === 'semantic' && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            AI-powered vector search
          </span>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          placeholder={
            mode === 'semantic'
              ? 'Search with natural language...'
              : 'Search skills...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-light dark:focus:ring-primary-light"
          aria-label={
            mode === 'semantic' ? 'Semantic search' : 'Search skills'
          }
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="semantic-search-results"
        />

        {/* Loading spinner or clear button */}
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : query ? (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Status line */}
      {query.trim() && mode === 'semantic' && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {isSearching
            ? 'Searching...'
            : error
              ? error
              : results.length === 0
                ? 'No results found'
                : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Error fallback message */}
      {error && mode === 'semantic' && (
        <button
          onClick={() => setMode('local')}
          className="mt-1 text-xs text-primary hover:underline"
        >
          Switch to local search
        </button>
      )}

      {/* Dropdown results (semantic mode only) */}
      {open && mode === 'semantic' && (
        <ul
          id="semantic-search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {results.map((result, i) => (
            <li key={result.id} role="option" aria-selected={i === highlighted}>
              <a
                href={`/skills/${result.id}`}
                className={`block px-4 py-3 transition-colors ${
                  i === highlighted
                    ? 'bg-primary-50 dark:bg-primary-900/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {result.name}
                  </span>
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {result.category}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                  {result.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-1 rounded-full bg-primary"
                      style={{ width: `${Math.round(result.score * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {Math.round(result.score * 100)}% match
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
