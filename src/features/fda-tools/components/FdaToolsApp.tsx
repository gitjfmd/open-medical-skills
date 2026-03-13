/**
 * FdaToolsApp — Root component for the FDA Drug Shortage Tracker.
 *
 * Renders: stats cards, search, filters, sortable table with pagination.
 * All data fetched from the OpenFDA Drug Enforcement API.
 */

import { useCallback } from 'react';
import { useShortages } from '../hooks/useShortages';
import type { ShortageStatus } from '../lib/fda-types';
import ShortageStats from './ShortageStats';
import ShortageSearch from './ShortageSearch';
import ShortageFilters from './ShortageFilters';
import ShortageTable from './ShortageTable';

export default function FdaToolsApp() {
  const {
    data,
    loading,
    error,
    searchParams,
    setSearchParams,
    totalPages,
    totalResults,
    lastUpdated,
  } = useShortages();

  const handleQueryChange = useCallback(
    (query: string) => {
      setSearchParams({ query });
    },
    [setSearchParams]
  );

  const handleStatusChange = useCallback(
    (status: ShortageStatus) => {
      setSearchParams({ status });
    },
    [setSearchParams]
  );

  const handleClassificationChange = useCallback(
    (classification: string) => {
      setSearchParams({ classification });
    },
    [setSearchParams]
  );

  const handleSort = useCallback(
    (field: string) => {
      setSearchParams((prev) => ({
        ...prev,
        sort: field,
        order: prev.sort === field && prev.order === 'desc' ? 'asc' : 'desc',
        page: 1,
      }));
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams({ page });
    },
    [setSearchParams]
  );

  return (
    <div className="space-y-6">
      {/* Data source notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Data sourced from the{' '}
            <a
              href="https://open.fda.gov/apis/drug/enforcement/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-blue-300 underline-offset-2 hover:decoration-blue-500 dark:decoration-blue-700 dark:hover:decoration-blue-400"
            >
              OpenFDA Drug Enforcement API
            </a>
            . Includes drug recalls, market withdrawals, and safety alerts.
            {lastUpdated && (
              <span className="ml-1 text-blue-500 dark:text-blue-400">
                Last updated: {lastUpdated}.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <ShortageStats />

      {/* Search + Filters */}
      <div className="space-y-3">
        <ShortageSearch value={searchParams.query} onChange={handleQueryChange} />
        <ShortageFilters
          status={searchParams.status}
          classification={searchParams.classification}
          onStatusChange={handleStatusChange}
          onClassificationChange={handleClassificationChange}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results table */}
      <ShortageTable
        data={data}
        loading={loading}
        searchParams={searchParams}
        onSort={handleSort}
        page={searchParams.page}
        totalPages={totalPages}
        totalResults={totalResults}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
