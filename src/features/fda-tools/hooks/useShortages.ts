/**
 * useShortages — React hook for managing FDA drug shortage search state.
 *
 * Handles debounced searching, pagination, sort, and loading/error states.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DrugShortage, SearchParams } from '../lib/fda-types';
import { DEFAULT_SEARCH_PARAMS } from '../lib/fda-types';
import { searchShortages, FdaApiError } from '../lib/fda-api';

const DEBOUNCE_MS = 300;

interface UseShortagesReturn {
  data: DrugShortage[];
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
  setSearchParams: (updater: Partial<SearchParams> | ((prev: SearchParams) => SearchParams)) => void;
  totalPages: number;
  totalResults: number;
  lastUpdated: string | null;
}

export function useShortages(): UseShortagesReturn {
  const [searchParams, setSearchParamsState] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);
  const [data, setData] = useState<DrugShortage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fetchData = useCallback(async (params: SearchParams) => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await searchShortages(params);
      if (!isMountedRef.current) return;

      setData(result.results);
      setTotalResults(result.total);
      setLastUpdated(result.meta.last_updated);
    } catch (err) {
      if (!isMountedRef.current) return;
      if ((err as Error).name === 'AbortError') return;

      if (err instanceof FdaApiError) {
        if (err.status === 404) {
          // No results found — not an error
          setData([]);
          setTotalResults(0);
          setError(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced search: trigger on searchParams change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData(searchParams);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchParams, fetchData]);

  const setSearchParams = useCallback(
    (updater: Partial<SearchParams> | ((prev: SearchParams) => SearchParams)) => {
      setSearchParamsState((prev) => {
        if (typeof updater === 'function') {
          return updater(prev);
        }
        // When query/filters change (not page), reset to page 1
        const isPageChange = Object.keys(updater).length === 1 && 'page' in updater;
        return {
          ...prev,
          ...updater,
          page: isPageChange ? (updater.page ?? prev.page) : 1,
        };
      });
    },
    []
  );

  const totalPages = Math.max(1, Math.ceil(totalResults / searchParams.limit));

  return {
    data,
    loading,
    error,
    searchParams,
    setSearchParams,
    totalPages,
    totalResults,
    lastUpdated,
  };
}
