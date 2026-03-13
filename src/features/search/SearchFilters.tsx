/**
 * SearchFilters.tsx — Domain and category filter pills for search.
 *
 * Displays interactive filter pills for medical categories and tool domains.
 * Active filters are highlighted with the primary accent color.
 * Integrates with the structured search API endpoint.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  type Category,
} from '../../lib/categories';

interface FilterState {
  categories: string[];
  domains: string[];
}

interface Props {
  /** Base URL for the search API */
  apiBaseUrl?: string;
  /** Called when filters change */
  onFilterChange?: (filters: FilterState) => void;
  /** Available domains (fetched or provided) */
  availableDomains?: string[];
}

export default function SearchFilters({
  apiBaseUrl = '',
  onFilterChange,
  availableDomains: propDomains,
}: Props) {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set());
  const [domains, setDomains] = useState<string[]>(propDomains || []);
  const [isLoadingDomains, setIsLoadingDomains] = useState(!propDomains);

  // Fetch available domains from the API if not provided
  useEffect(() => {
    if (propDomains) {
      setDomains(propDomains);
      setIsLoadingDomains(false);
      return;
    }

    let cancelled = false;

    async function fetchDomains() {
      try {
        // Fetch a small result set to extract unique domains
        const url = `${apiBaseUrl}/api/search/structured?limit=0`;
        const response = await fetch(url);

        if (response.ok) {
          // For now, we use a predefined domain list since the structured
          // endpoint returns tools, not domain metadata.
          // In the future, a /api/search/domains endpoint could provide this.
          if (!cancelled) {
            setDomains([]);
          }
        }
      } catch {
        // Non-critical: domains are optional filters
        if (!cancelled) {
          setDomains([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDomains(false);
        }
      }
    }

    fetchDomains();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, propDomains]);

  const emitFilterChange = useCallback(
    (cats: Set<string>, doms: Set<string>) => {
      const filters: FilterState = {
        categories: Array.from(cats),
        domains: Array.from(doms),
      };
      onFilterChange?.(filters);

      // Also emit as a custom event for other components
      window.dispatchEvent(
        new CustomEvent('search-filter-change', { detail: filters })
      );
    },
    [onFilterChange]
  );

  function toggleCategory(cat: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      emitFilterChange(next, activeDomains);
      return next;
    });
  }

  function toggleDomain(domain: string) {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      emitFilterChange(activeCategories, next);
      return next;
    });
  }

  function clearAll() {
    setActiveCategories(new Set());
    setActiveDomains(new Set());
    emitFilterChange(new Set(), new Set());
  }

  const hasActiveFilters = activeCategories.size > 0 || activeDomains.size > 0;

  return (
    <div className="space-y-3">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category filters */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Categories
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategories.has(cat);
            const label = CATEGORY_LABELS[cat];
            const style = CATEGORY_STYLES[cat];

            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? `${style.bg} ${style.text} ${style.border} ring-1 ring-primary/30`
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                }`}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain filters (only shown if domains are available) */}
      {!isLoadingDomains && domains.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Domains
          </p>
          <div className="flex flex-wrap gap-1.5">
            {domains.map((domain) => {
              const isActive = activeDomains.has(domain);

              return (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 dark:bg-primary/20 dark:text-primary-light'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                  }`}
                  aria-pressed={isActive}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading domains */}
      {isLoadingDomains && (
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      )}

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="rounded-md border border-primary/20 bg-primary-50 p-2.5 dark:border-primary/20 dark:bg-primary-900/20">
          <p className="text-xs text-primary-700 dark:text-primary-light">
            {activeCategories.size > 0 && (
              <span>
                {activeCategories.size} categor
                {activeCategories.size !== 1 ? 'ies' : 'y'}
              </span>
            )}
            {activeCategories.size > 0 && activeDomains.size > 0 && ', '}
            {activeDomains.size > 0 && (
              <span>
                {activeDomains.size} domain{activeDomains.size !== 1 ? 's' : ''}
              </span>
            )}{' '}
            selected
          </p>
        </div>
      )}
    </div>
  );
}
