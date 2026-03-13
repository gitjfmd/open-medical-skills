/**
 * OMS Search API — Cloudflare Worker
 *
 * Proxies search requests to backend services (Qdrant vector search,
 * SurrealDB graph queries, Supabase full-text) via Cloudflare Tunnel.
 *
 * Routes:
 *   GET /api/search?q=<term>&limit=20           → Semantic vector search
 *   GET /api/search/graph?tool=<id>              → Graph traversal
 *   GET /api/search/structured?category=&domain= → Structured filters
 *   GET /api/search/suggest?q=<prefix>           → Autocomplete
 */

import type { Env } from './lib/types';
import { jsonError, corsHeaders } from './lib/errors';
import { handleSemanticSearch } from './handlers/semantic';
import { handleGraphSearch } from './handlers/graph';
import { handleStructuredSearch } from './handlers/structured';
import { handleSuggest } from './handlers/suggest';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders(env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'GET') {
      return jsonError('Method not allowed', 405);
    }

    const start = Date.now();

    try {
      // GET /api/search?q=<term>&limit=20
      if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
        const q = url.searchParams.get('q');
        if (!q) return jsonError('Missing query parameter "q"', 400);
        const limit = Math.min(
          parseInt(url.searchParams.get('limit') || '20', 10),
          100
        );
        const result = await handleSemanticSearch(q, limit, env);
        result.took_ms = Date.now() - start;
        return new Response(JSON.stringify(result), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/search/graph?tool=<id>
      if (url.pathname === '/api/search/graph') {
        const toolId = url.searchParams.get('tool');
        if (!toolId) return jsonError('Missing query parameter "tool"', 400);
        const result = await handleGraphSearch(toolId, env);
        return new Response(JSON.stringify(result), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/search/structured?category=<cat>&domain=<dom>&limit=20&offset=0
      if (url.pathname === '/api/search/structured') {
        const params = {
          category: url.searchParams.get('category') || undefined,
          domain: url.searchParams.get('domain') || undefined,
          limit: Math.min(
            parseInt(url.searchParams.get('limit') || '20', 10),
            100
          ),
          offset: parseInt(url.searchParams.get('offset') || '0', 10),
        };
        const result = await handleStructuredSearch(params, env);
        result.took_ms = Date.now() - start;
        return new Response(JSON.stringify(result), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/search/suggest?q=<prefix>
      if (url.pathname === '/api/search/suggest') {
        const q = url.searchParams.get('q');
        if (!q) return jsonError('Missing query parameter "q"', 400);
        const suggestions = await handleSuggest(q, env);
        return new Response(JSON.stringify({ suggestions }), {
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      return jsonError('Not found', 404);
    } catch (err) {
      console.error('Search API error:', err);
      return jsonError('Internal server error', 500);
    }
  },
};
