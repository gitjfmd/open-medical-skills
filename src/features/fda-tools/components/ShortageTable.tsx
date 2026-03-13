/**
 * ShortageTable — Sortable results table with pagination and expandable detail rows.
 */

import { useState, useCallback } from 'react';
import type { DrugShortage, SearchParams } from '../lib/fda-types';
import { formatFdaDate } from '../lib/fda-api';
import ShortageDetail from './ShortageDetail';

interface ShortageTableProps {
  data: DrugShortage[];
  loading: boolean;
  searchParams: SearchParams;
  onSort: (field: string) => void;
  page: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

/** Status badge color mapping. */
function statusBadge(status: string) {
  switch (status) {
    case 'Ongoing':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Terminated':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'Completed':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

/** Classification badge. */
function classificationBadge(classification: string) {
  switch (classification) {
    case 'Class I':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800';
    case 'Class II':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800';
    case 'Class III':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800';
    default:
      return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700';
  }
}

/** Sort icon for column headers. */
function SortIcon({ field, sort, order }: { field: string; sort: string; order: string }) {
  if (sort !== field) {
    return (
      <svg className="ml-1 inline h-3 w-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    );
  }
  return order === 'asc' ? (
    <svg className="ml-1 inline h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  ) : (
    <svg className="ml-1 inline h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

/** Loading skeleton rows. */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ShortageTable({
  data,
  loading,
  searchParams,
  onSort,
  page,
  totalPages,
  totalResults,
  onPageChange,
}: ShortageTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const columns = [
    { key: 'product_description', label: 'Drug / Product' },
    { key: 'status', label: 'Status' },
    { key: 'classification', label: 'Class' },
    { key: 'recalling_firm', label: 'Company' },
    { key: 'report_date', label: 'Reported' },
  ];

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <svg className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          No results found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  <SortIcon field={col.key} sort={searchParams.sort} order={searchParams.order} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : (
              data.map((item) => (
                <>
                  <tr
                    key={item.id}
                    onClick={() => toggleExpand(item.id)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 ${
                      expandedId === item.id ? 'bg-slate-50 dark:bg-slate-800/30' : ''
                    }`}
                  >
                    {/* Drug / Product */}
                    <td className="max-w-xs px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.brand_name !== 'N/A' ? item.brand_name : item.generic_name}
                      </div>
                      {item.brand_name !== 'N/A' && item.generic_name !== 'N/A' && (
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {item.generic_name}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Classification */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${classificationBadge(item.classification)}`}
                      >
                        {item.classification}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.recalling_firm}
                    </td>

                    {/* Reported */}
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatFdaDate(item.report_date)}
                    </td>
                  </tr>

                  {/* Expanded detail */}
                  {expandedId === item.id && (
                    <tr key={`${item.id}-detail`}>
                      <td colSpan={5}>
                        <ShortageDetail item={item} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {((page - 1) * searchParams.limit) + 1}
            </span>
            {' '}-{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {Math.min(page * searchParams.limit, totalResults)}
            </span>
            {' '}of{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {totalResults.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 p-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            <span className="px-3 text-sm text-slate-600 dark:text-slate-400">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 p-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
