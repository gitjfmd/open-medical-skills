/**
 * RelatedTools.tsx — Sidebar component showing graph-based related tools.
 *
 * Fetches from the graph search API and displays related tools with
 * category badges and relationship context. Graceful degradation when
 * the graph API is unavailable.
 */

import { useState, useEffect } from 'react';
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
  source: string;
}

interface GraphResult {
  tool: SearchResult;
  related: SearchResult[];
  categories: string[];
  path_length: number;
}

interface Props {
  /** The tool ID to find relationships for */
  toolId: string;
  /** Base URL for the search API */
  apiBaseUrl?: string;
  /** Maximum number of related tools to show */
  maxItems?: number;
}

export default function RelatedTools({
  toolId,
  apiBaseUrl = '',
  maxItems = 6,
}: Props) {
  const [data, setData] = useState<GraphResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toolId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRelated() {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${apiBaseUrl}/api/search/graph?tool=${encodeURIComponent(toolId)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Graph API returned ${response.status}`);
        }

        const result = (await response.json()) as GraphResult;
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Related tools fetch failed:', err);
          setError('Related tools unavailable');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [toolId, apiBaseUrl]);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-1 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error or no data
  if (error || !data) {
    if (error) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-400 dark:text-slate-500">{error}</p>
        </div>
      );
    }
    return null;
  }

  // No related tools
  if (data.related.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Related Tools
        </h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          No related tools found in the knowledge graph.
        </p>
      </div>
    );
  }

  const visibleRelated = data.related.slice(0, maxItems);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Related Tools
      </h3>

      {/* Categories this tool belongs to */}
      {data.categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.categories.map((cat) => {
            const catKey = cat as Category;
            const style = CATEGORY_STYLES[catKey];
            const label = CATEGORY_LABELS[catKey] || cat;

            return style ? (
              <span
                key={cat}
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
              >
                {label}
              </span>
            ) : (
              <span
                key={cat}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      {/* Relationship context */}
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        {data.related.length} tool{data.related.length !== 1 ? 's' : ''}{' '}
        connected via knowledge graph
        {data.path_length > 0 && ` (${data.path_length}-hop traversal)`}
      </p>

      {/* Related tool cards */}
      <div className="mt-3 space-y-2">
        {visibleRelated.map((tool) => {
          const catKey = tool.category as Category;
          const catStyle = CATEGORY_STYLES[catKey];
          const catLabel =
            CATEGORY_LABELS[catKey] || tool.category || 'Uncategorized';

          return (
            <a
              key={tool.id}
              href={`/skills/${tool.id}`}
              className="group block rounded-md border border-slate-100 p-2.5 transition-all hover:border-primary/30 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary/30 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 group-hover:text-primary dark:text-slate-200 dark:group-hover:text-primary-light">
                  {tool.name}
                </span>
                {catStyle ? (
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {catLabel}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {catLabel}
                  </span>
                )}
              </div>
              {tool.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {tool.description}
                </p>
              )}
            </a>
          );
        })}
      </div>

      {/* Show more link */}
      {data.related.length > maxItems && (
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          +{data.related.length - maxItems} more related tool
          {data.related.length - maxItems !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
