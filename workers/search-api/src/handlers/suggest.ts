/**
 * Autocomplete suggestion handler — Supabase ILIKE prefix search.
 *
 * Provides fast typeahead suggestions by querying tool names that
 * match a given prefix, returning up to 10 results.
 */

import type { Env } from '../lib/types';

interface SuggestRecord {
  name: string;
}

const MAX_SUGGESTIONS = 10;

/**
 * Fetch autocomplete suggestions for the given prefix.
 *
 * @param prefix - The user-typed prefix to match against tool names
 * @param env    - Worker environment bindings
 * @returns Array of matching tool name strings (max 10)
 */
export async function handleSuggest(
  prefix: string,
  env: Env
): Promise<string[]> {
  // Sanitize prefix for PostgREST ILIKE pattern
  const sanitized = prefix.replace(/[%_]/g, '');
  if (!sanitized) {
    return [];
  }

  const queryParts: string[] = [];
  queryParts.push('select=name');
  queryParts.push(`name=ilike.${encodeURIComponent(sanitized)}*`);
  queryParts.push('order=name.asc');
  queryParts.push(`limit=${MAX_SUGGESTIONS}`);

  const url = `${env.SUPABASE_URL}/rest/v1/tools?${queryParts.join('&')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (env.SUPABASE_KEY) {
    headers['apikey'] = env.SUPABASE_KEY;
    headers['Authorization'] = `Bearer ${env.SUPABASE_KEY}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Suggest query failed (${response.status})`);
      return [];
    }

    const records = (await response.json()) as SuggestRecord[];
    return records.map((r) => r.name).filter(Boolean);
  } catch (err) {
    console.error('Suggest request failed:', err);
    return [];
  }
}
