/**
 * OpenFDA API client for drug enforcement / shortage data.
 *
 * Uses the /drug/enforcement.json endpoint which provides drug recall and
 * enforcement actions, including shortage-related events.
 *
 * Rate limit: 40 requests/minute without an API key.
 * Docs: https://open.fda.gov/apis/drug/enforcement/
 */

import type {
  FdaApiResponse,
  FdaEnforcementResult,
  DrugShortage,
  SearchParams,
  ShortageStatsData,
} from './fda-types';

const BASE_URL = 'https://api.fda.gov/drug/enforcement.json';
const REQUEST_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1_500;

/** Fetch wrapper with timeout, retry on 429, and error handling. */
async function fdaFetch(url: string, retries = MAX_RETRIES): Promise<FdaApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return fdaFetch(url, retries - 1);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new FdaApiError(
        (errorBody as { error?: { message?: string } })?.error?.message ||
          `FDA API returned ${response.status}`,
        response.status
      );
    }

    return (await response.json()) as FdaApiResponse;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof FdaApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new FdaApiError('Request timed out after 10 seconds', 408);
    }
    throw new FdaApiError((err as Error).message || 'Network error', 0);
  }
}

export class FdaApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'FdaApiError';
    this.status = status;
  }
}

/**
 * Build an OpenFDA search query string from SearchParams.
 *
 * OpenFDA uses a Lucene-like query syntax:
 *   search=field:value+AND+field:value
 *   sort=field:asc
 *   limit=N&skip=N
 */
function buildQueryUrl(params: SearchParams): string {
  const searchParts: string[] = [];

  // Text search across drug name fields
  if (params.query.trim()) {
    const q = encodeURIComponent(params.query.trim());
    searchParts.push(
      `(product_description:"${q}"+openfda.brand_name:"${q}"+openfda.generic_name:"${q}")`
    );
  }

  // Status filter
  if (params.status !== 'all') {
    searchParts.push(`status:"${encodeURIComponent(params.status)}"`);
  }

  // Classification filter (Class I, II, III)
  if (params.classification && params.classification !== 'all') {
    searchParts.push(`classification:"${encodeURIComponent(params.classification)}"`);
  }

  const queryParts: string[] = [];

  if (searchParts.length > 0) {
    queryParts.push(`search=${searchParts.join('+AND+')}`);
  }

  // Sorting
  const sortField = params.sort === 'report_date' ? 'report_date' : params.sort;
  queryParts.push(`sort=${sortField}:${params.order}`);

  // Pagination
  const skip = (params.page - 1) * params.limit;
  queryParts.push(`limit=${params.limit}`);
  queryParts.push(`skip=${skip}`);

  return `${BASE_URL}?${queryParts.join('&')}`;
}

/** Normalize a raw enforcement result into a DrugShortage record. */
function normalizeResult(raw: FdaEnforcementResult): DrugShortage {
  return {
    id: raw.event_id || raw.recall_number,
    generic_name: raw.openfda?.generic_name?.join(', ') || 'N/A',
    brand_name: raw.openfda?.brand_name?.join(', ') || 'N/A',
    status: raw.status as DrugShortage['status'],
    classification: raw.classification,
    recalling_firm: raw.recalling_firm || 'Unknown',
    reason: raw.reason_for_recall || '',
    product_description: raw.product_description || '',
    distribution_pattern: raw.distribution_pattern || '',
    report_date: raw.report_date || '',
    recall_initiation_date: raw.recall_initiation_date || '',
    termination_date: raw.termination_date,
    product_quantity: raw.product_quantity,
    voluntary_mandated: raw.voluntary_mandated,
    city: raw.city,
    state: raw.state,
    country: raw.country,
    recall_number: raw.recall_number,
  };
}

/** Search drug enforcement records with pagination. */
export async function searchShortages(
  params: SearchParams
): Promise<{ results: DrugShortage[]; total: number; meta: FdaApiResponse['meta'] }> {
  const url = buildQueryUrl(params);
  const data = await fdaFetch(url);

  return {
    results: data.results.map(normalizeResult),
    total: data.meta.results.total,
    meta: data.meta,
  };
}

/** Fetch aggregate counts for the stats dashboard. Uses sessionStorage cache. */
export async function fetchStats(): Promise<ShortageStatsData> {
  const CACHE_KEY = 'fda-shortage-stats';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Check cache
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { data: ShortageStatsData; ts: number };
      if (Date.now() - parsed.ts < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch {
    // sessionStorage unavailable or corrupted, continue without cache
  }

  // Fetch ongoing count
  const ongoingUrl = `${BASE_URL}?search=status:"Ongoing"&limit=1`;
  const terminatedUrl = `${BASE_URL}?search=status:"Terminated"&limit=1`;
  const totalUrl = `${BASE_URL}?limit=1`;

  const [ongoingRes, terminatedRes, totalRes] = await Promise.all([
    fdaFetch(ongoingUrl).catch(() => null),
    fdaFetch(terminatedUrl).catch(() => null),
    fdaFetch(totalUrl).catch(() => null),
  ]);

  const stats: ShortageStatsData = {
    ongoing: ongoingRes?.meta?.results?.total ?? 0,
    terminated: terminatedRes?.meta?.results?.total ?? 0,
    total: totalRes?.meta?.results?.total ?? 0,
  };

  // Cache
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, ts: Date.now() }));
  } catch {
    // sessionStorage unavailable
  }

  return stats;
}

/** Format an FDA date string (YYYYMMDD) to a readable date. */
export function formatFdaDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 8) return dateStr || 'N/A';
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}-${month}-${day}`;
}
