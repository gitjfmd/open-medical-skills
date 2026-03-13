/**
 * Semantic search handler — Qdrant vector similarity search.
 *
 * 1. Embeds the query text via Ollama
 * 2. Searches the Qdrant collection for similar vectors
 * 3. Maps Qdrant point results to the SearchResult format
 */

import type { Env, SearchResponse, SearchResult } from '../lib/types';
import { embedQuery } from '../lib/embed';

interface QdrantPayload {
  name?: string;
  description?: string;
  category?: string;
  domain?: string;
  [key: string]: unknown;
}

interface QdrantSearchHit {
  id: string | number;
  score: number;
  payload?: QdrantPayload;
}

interface QdrantSearchResponse {
  result: QdrantSearchHit[];
  status?: string;
}

/**
 * Perform semantic search by embedding the query and searching Qdrant.
 *
 * @param query - User search text
 * @param limit - Maximum number of results to return (capped at 100)
 * @param env   - Worker environment bindings
 * @returns Search results ranked by vector similarity
 */
export async function handleSemanticSearch(
  query: string,
  limit: number,
  env: Env
): Promise<SearchResponse> {
  const start = Date.now();

  // Step 1: Generate query embedding
  let embedding: number[];
  try {
    embedding = await embedQuery(query, env);
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return {
      results: [],
      total: 0,
      query,
      took_ms: Date.now() - start,
    };
  }

  // Step 2: Search Qdrant for similar vectors
  let qdrantData: QdrantSearchResponse;
  try {
    const qdrantResponse = await fetch(
      `${env.QDRANT_URL}/collections/${env.QDRANT_COLLECTION}/points/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vector: embedding,
          limit,
          with_payload: true,
        }),
      }
    );

    if (!qdrantResponse.ok) {
      const errorText = await qdrantResponse.text().catch(() => 'Unknown');
      console.error(`Qdrant search failed (${qdrantResponse.status}): ${errorText}`);
      return {
        results: [],
        total: 0,
        query,
        took_ms: Date.now() - start,
      };
    }

    qdrantData = (await qdrantResponse.json()) as QdrantSearchResponse;
  } catch (err) {
    console.error('Qdrant request failed:', err);
    return {
      results: [],
      total: 0,
      query,
      took_ms: Date.now() - start,
    };
  }

  // Step 3: Map Qdrant hits to SearchResult format
  const results: SearchResult[] = (qdrantData.result || []).map((hit) => ({
    id: String(hit.id),
    name: hit.payload?.name || `tool-${hit.id}`,
    description: hit.payload?.description || '',
    category: hit.payload?.category || 'uncategorized',
    domain: hit.payload?.domain,
    score: hit.score,
    source: 'semantic' as const,
  }));

  return {
    results,
    total: results.length,
    query,
    took_ms: Date.now() - start,
  };
}
