/**
 * SearchResults.tsx — Ranked search results display with relevance scores.
 *
 * Displays semantic search results in a list or grid, with category badges,
 * relevance score bars, loading skeletons, empty state, and pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  type Category,
} from '../../lib/categories';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  domain?: string;
  score: number;
  source: 'semantic' | 'graph' | 'structured';
}

interface SearchApiResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took_ms: number;
}

interface Props {
  /** Base URL for the search API */
  apiBaseUrl?: string;
  /** Initial search query (optional, can be controlled externally) */
  initialQuery?: string;
  /** Number of results per page */
  pageSize?: number;
}

export default function SearchResults({
  apiBaseUrl = '',
  initialQuery = '',
  pageSize = 20,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [tookMs, setTookMs] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for external search events
  useEffect(() => {
    function handleSearchEvent(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.query !== undefined) {
        setQuery(detail.query);
        setPage(0);
      }
    }
    window.addEventListener('semantic-search', handleSearchEvent);
    return () =>
      window.removeEventListener('semantic-search', handleSearchEvent);
  }, []);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${apiBaseUrl}/api/search?q=${encodeURIComponent(query)}&limit=${pageSize}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed (${response.status})`);
      }

      const data = (await response.json()) as SearchApiResponse;
      setResults(data.results);
      setTotal(data.total);
      setTookMs(data.took_ms);
    } catch (err) {
      console.error('Search results fetch failed:', err);
      setError(
        'Unable to load search results. The search service may be temporarily unavailable.'
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, pageSize, apiBaseUrl]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="mt-2 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-1 h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-1.5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/30">
        <svg
          className="mx-auto h-8 w-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={fetchResults}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state (no query)
  if (!query.trim()) {
    return null;
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <svg
          className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h3 className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
          No results found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No tools match &ldquo;{query}&rdquo;. Try a different search term or
          broaden your filters.
        </p>
      </div>
    );
  }

  // Results list
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Results header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          <span className="ml-2 text-xs text-slate-400">
            ({tookMs}ms)
          </span>
        </p>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((result) => {
          const catKey = result.category as Category;
          const catStyle = CATEGORY_STYLES[catKey];
          const catLabel =
            CATEGORY_LABELS[catKey] || result.category || 'Uncategorized';

          return (
            <a
              key={result.id}
              href={`/skills/${result.id}`}
              className="group block rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-slate-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary-light">
                    {result.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {result.description}
                  </p>
                </div>

                {/* Category badge */}
                {catStyle ? (
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {catLabel}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {catLabel}
                  </span>
                )}
              </div>

              {/* Score bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.round(result.score * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {Math.round(result.score * 100)}% relevance
                </span>
                {result.domain && (
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    {result.domain}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
