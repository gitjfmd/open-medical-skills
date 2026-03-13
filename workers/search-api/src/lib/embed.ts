/**
 * Query embedding via Ollama through Cloudflare Tunnel.
 *
 * Calls the Ollama `/api/embeddings` endpoint to convert a text query
 * into a vector embedding suitable for Qdrant similarity search.
 */

import type { Env, EmbeddingResponse } from './types';

const EMBED_TIMEOUT_MS = 10_000;

/**
 * Generate an embedding vector for the given text using Ollama.
 *
 * @param text  - The query text to embed
 * @param env   - Worker environment with OLLAMA_URL and EMBED_MODEL
 * @returns The embedding vector as a number array
 * @throws If the Ollama API is unreachable or returns an error
 */
export async function embedQuery(text: string, env: Env): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.EMBED_MODEL,
        prompt: text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Ollama embedding failed (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as EmbeddingResponse;

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Invalid embedding response: missing embedding array');
    }

    return data.embedding;
  } finally {
    clearTimeout(timeout);
  }
}
