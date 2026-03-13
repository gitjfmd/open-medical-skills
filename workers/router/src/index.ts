/**
 * OpenMedica Router - Cloudflare Worker
 *
 * Runs on openmedica.us and routes requests to the appropriate backend:
 * - /open-medical-skills/* -> CF Pages (OMS static site)
 * - /api/search/*          -> Search API worker
 * - /api/submit/*          -> Submission API worker
 * - Everything else        -> pass through (existing openmedica.us content)
 */

interface Env {
  PAGES_URL: string;          // CF Pages URL for OMS (e.g., open-medical-skills.pages.dev)
  SEARCH_API_URL?: string;    // Search API worker URL (optional, for service binding later)
  SUBMISSION_API_URL?: string; // Submission API worker URL
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Route /open-medical-skills/* to CF Pages
    if (pathname === '/open-medical-skills' || pathname.startsWith('/open-medical-skills/')) {
      // Strip the prefix for the Pages fetch
      const pagesPath = pathname.replace('/open-medical-skills', '') || '/';
      const pagesUrl = new URL(pagesPath + url.search, env.PAGES_URL);

      // Forward the request to CF Pages
      const response = await fetch(pagesUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      // Return response with appropriate headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Route /api/search/* to search API
    if (pathname.startsWith('/api/search')) {
      if (!env.SEARCH_API_URL) {
        return new Response(JSON.stringify({ error: 'Search API not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const searchUrl = new URL(pathname + url.search, env.SEARCH_API_URL);
      return fetch(searchUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });
    }

    // Route /api/submit/* to submission API
    if (pathname.startsWith('/api/submit')) {
      if (!env.SUBMISSION_API_URL) {
        return new Response(JSON.stringify({ error: 'Submission API not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const submitUrl = new URL(pathname + url.search, env.SUBMISSION_API_URL);
      return fetch(submitUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });
    }

    // All other requests pass through (existing openmedica.us content)
    return fetch(request);
  },
};
