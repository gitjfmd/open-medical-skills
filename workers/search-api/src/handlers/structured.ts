/**
 * Structured search handler — Supabase REST API queries.
 *
 * Provides filtered, paginated tool search by category, domain, and other
 * structured fields via the Supabase PostgREST API.
 */

import type { Env, SearchResponse, SearchResult } from '../lib/types';

interface StructuredSearchParams {
  category?: string;
  domain?: string;
  limit?: number;
  offset?: number;
}

interface SupabaseRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  domain?: string;
  [key: string]: unknown;
}

/**
 * Build Supabase REST API headers with the service key.
 */
function supabaseHeaders(env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (env.SUPABASE_KEY) {
    headers['apikey'] = env.SUPABASE_KEY;
    headers['Authorization'] = `Bearer ${env.SUPABASE_KEY}`;
  }

  // Request exact count in the Content-Range header
  headers['Prefer'] = 'count=exact';

  return headers;
}

/**
 * Perform a structured search against Supabase with optional filters.
 *
 * @param params - Filter criteria (category, domain) and pagination (limit, offset)
 * @param env    - Worker environment bindings
 * @returns Filtered, paginated search results
 */
export async function handleStructuredSearch(
  params: StructuredSearchParams,
  env: Env
): Promise<SearchResponse> {
  const start = Date.now();
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

  // Build the PostgREST query string
  const queryParts: string[] = [];
  queryParts.push(`select=id,name,description,category,domain`);
  queryParts.push(`order=name.asc`);
  queryParts.push(`limit=${limit}`);
  queryParts.push(`offset=${offset}`);

  if (params.category) {
    // PostgREST eq filter
    queryParts.push(`category=eq.${encodeURIComponent(params.category)}`);
  }

  if (params.domain) {
    queryParts.push(`domain=eq.${encodeURIComponent(params.domain)}`);
  }

  const url = `${env.SUPABASE_URL}/rest/v1/tools?${queryParts.join('&')}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: supabaseHeaders(env),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown');
      console.error(`Supabase query failed (${response.status}): ${errorText}`);
      return {
        results: [],
        total: 0,
        query: JSON.stringify(params),
        took_ms: Date.now() - start,
      };
    }

    // Parse total count from Content-Range header (e.g., "0-19/150")
    const contentRange = response.headers.get('Content-Range');
    let total = 0;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      if (match) {
        total = parseInt(match[1], 10);
      }
    }

    const records = (await response.json()) as SupabaseRecord[];

    const results: SearchResult[] = records.map((record, index) => ({
      id: record.id || String(index),
      name: record.name || '',
      description: record.description || '',
      category: record.category || 'uncategorized',
      domain: record.domain,
      score: 1.0, // Structured results don't have relevance scores
      source: 'structured' as const,
    }));

    // If Content-Range didn't give a total, use the results length
    if (total === 0) {
      total = results.length;
    }

    return {
      results,
      total,
      query: JSON.stringify(params),
      took_ms: Date.now() - start,
    };
  } catch (err) {
    console.error('Structured search failed:', err);
    return {
      results: [],
      total: 0,
      query: JSON.stringify(params),
      took_ms: Date.now() - start,
    };
  }
}
