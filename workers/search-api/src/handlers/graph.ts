/**
 * Graph search handler — SurrealDB graph traversal.
 *
 * Queries SurrealDB to find a tool by ID and traverse `relates_to` edges,
 * returning the tool along with its connected categories and related tools.
 */

import type { Env, GraphResult, SearchResult } from '../lib/types';

interface SurrealRecord {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  domain?: string;
  [key: string]: unknown;
}

interface SurrealResponse {
  result: SurrealRecord[];
  status: string;
  time: string;
}

/**
 * Build a Basic auth header from SurrealDB credentials.
 */
function surrealAuthHeader(env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    NS: 'intelmedica',
    DB: 'tooluniverse',
  };

  if (env.SURREALDB_USER && env.SURREALDB_PASS) {
    const encoded = btoa(`${env.SURREALDB_USER}:${env.SURREALDB_PASS}`);
    headers['Authorization'] = `Basic ${encoded}`;
  }

  return headers;
}

/**
 * Execute a SurrealQL query and return the parsed response.
 */
async function surrealQuery(
  sql: string,
  env: Env
): Promise<SurrealResponse[]> {
  const response = await fetch(`${env.SURREALDB_URL}/sql`, {
    method: 'POST',
    headers: surrealAuthHeader(env),
    body: sql,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown');
    throw new Error(`SurrealDB query failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as SurrealResponse[];
}

/**
 * Map a raw SurrealDB record to a SearchResult.
 */
function toSearchResult(record: SurrealRecord, score: number): SearchResult {
  return {
    id: record.id || '',
    name: record.name || '',
    description: record.description || '',
    category: record.category || 'uncategorized',
    domain: record.domain,
    score,
    source: 'graph',
  };
}

/**
 * Perform a graph traversal search for a tool and its relationships.
 *
 * @param toolId - The SurrealDB record ID of the tool (e.g., "tool:123")
 * @param env    - Worker environment bindings
 * @returns The tool, its related tools, connected categories, and path length
 */
export async function handleGraphSearch(
  toolId: string,
  env: Env
): Promise<GraphResult> {
  // Sanitize toolId to prevent injection — allow only alphanumeric, colons, underscores, hyphens
  const sanitizedId = toolId.replace(/[^a-zA-Z0-9:_-]/g, '');

  try {
    // Query 1: Get the tool itself
    const toolQuery = `SELECT * FROM tool WHERE id = '${sanitizedId}' LIMIT 1;`;

    // Query 2: Traverse relates_to edges to find connected tools (1 hop)
    const relatedQuery = `SELECT ->relates_to->tool.* AS related FROM tool WHERE id = '${sanitizedId}';`;

    // Query 3: Get categories connected to this tool
    const categoriesQuery = `SELECT ->belongs_to->category.name AS categories FROM tool WHERE id = '${sanitizedId}';`;

    // Execute all queries in a single request
    const combinedSql = `${toolQuery}\n${relatedQuery}\n${categoriesQuery}`;
    const responses = await surrealQuery(combinedSql, env);

    // Parse tool result
    const toolRecords = responses[0]?.result || [];
    const toolRecord = toolRecords[0];

    if (!toolRecord) {
      return {
        tool: {
          id: sanitizedId,
          name: 'Not found',
          description: '',
          category: '',
          score: 0,
          source: 'graph',
        },
        related: [],
        categories: [],
        path_length: 0,
      };
    }

    // Parse related tools
    const relatedRecords = responses[1]?.result || [];
    const relatedTools: SearchResult[] = [];

    for (const record of relatedRecords) {
      const relatedArr = record.related as SurrealRecord[] | undefined;
      if (Array.isArray(relatedArr)) {
        for (const rel of relatedArr) {
          relatedTools.push(toSearchResult(rel, 0.8));
        }
      }
    }

    // Parse categories
    const categoryRecords = responses[2]?.result || [];
    const categories: string[] = [];

    for (const record of categoryRecords) {
      const catArr = record.categories as string[] | undefined;
      if (Array.isArray(catArr)) {
        categories.push(...catArr);
      }
    }

    return {
      tool: toSearchResult(toolRecord, 1.0),
      related: relatedTools,
      categories: [...new Set(categories)],
      path_length: 1,
    };
  } catch (err) {
    console.error('Graph search failed:', err);
    return {
      tool: {
        id: sanitizedId,
        name: 'Error',
        description: 'Graph search is temporarily unavailable',
        category: '',
        score: 0,
        source: 'graph',
      },
      related: [],
      categories: [],
      path_length: 0,
    };
  }
}
