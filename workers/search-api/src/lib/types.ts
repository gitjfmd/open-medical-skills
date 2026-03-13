/**
 * Cloudflare Worker environment bindings for the OMS Search API.
 *
 * All service URLs point to backend infrastructure accessible via
 * Cloudflare Tunnel in production. In development, they default to
 * localhost endpoints (configured in wrangler.toml [vars]).
 */
export interface Env {
  QDRANT_URL: string;
  SURREALDB_URL: string;
  SUPABASE_URL: string;
  OLLAMA_URL: string;
  QDRANT_COLLECTION: string;
  EMBED_MODEL: string;
  ALLOWED_ORIGIN: string;
  SUPABASE_KEY?: string;
  SURREALDB_USER?: string;
  SURREALDB_PASS?: string;
}

/**
 * A single search result from any search backend.
 */
export interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: string;
  domain?: string;
  score: number;
  source: 'semantic' | 'graph' | 'structured';
}

/**
 * Paginated search response returned by semantic and structured endpoints.
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took_ms: number;
}

/**
 * Graph traversal result showing a tool and its relationships.
 */
export interface GraphResult {
  tool: SearchResult;
  related: SearchResult[];
  categories: string[];
  path_length: number;
}

/**
 * Raw embedding response from the Ollama API.
 */
export interface EmbeddingResponse {
  embedding: number[];
  model: string;
}
