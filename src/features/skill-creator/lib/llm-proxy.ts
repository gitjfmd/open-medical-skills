/**
 * llm-proxy.ts — Client-side LLM API client for the skill creator.
 *
 * Makes direct calls from the browser to the user's configured LLM endpoint.
 * All supported providers expose an OpenAI-compatible /v1/chat/completions API.
 *
 * Supported providers:
 * - LMStudio (localhost:1234)
 * - vLLM (localhost:8000)
 * - Ollama (localhost:11434)
 * - DeepSeek (api.deepseek.com)
 * - OpenAI (api.openai.com)
 * - Any OpenAI-compatible endpoint
 *
 * Security:
 * - API keys are stored in browser localStorage only
 * - No keys are ever sent to OMS servers
 * - CORS must be enabled on the LLM endpoint for browser-direct calls
 *   (local providers like LMStudio/Ollama typically allow this by default)
 *
 * TODO: Implement during feature development phase.
 */

import type { LLMProviderConfig, LLMRequest, LLMResponse } from '../types';

/** Default provider presets for quick configuration. */
export const PROVIDER_PRESETS: Record<string, Partial<LLMProviderConfig>> = {
  lmstudio: {
    name: 'LM Studio',
    endpoint: 'http://localhost:1234/v1',
    model: 'local-model',
    maxTokens: 2048,
    temperature: 0.7,
  },
  vllm: {
    name: 'vLLM',
    endpoint: 'http://localhost:8000/v1',
    model: 'default',
    maxTokens: 2048,
    temperature: 0.7,
  },
  ollama: {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/v1',
    model: 'llama3',
    maxTokens: 2048,
    temperature: 0.7,
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 2048,
    temperature: 0.7,
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    maxTokens: 2048,
    temperature: 0.7,
  },
};

/**
 * Send a refinement request to the configured LLM provider.
 *
 * Constructs the messages array with the section system prompt and user content,
 * then calls the OpenAI-compatible chat completions endpoint.
 */
export async function refineSection(request: LLMRequest): Promise<LLMResponse> {
  // TODO: Implement OpenAI-compatible API call
  // 1. Build messages: [system prompt, context from previous sections, user content]
  // 2. POST to provider.endpoint + '/chat/completions'
  // 3. Parse response and return refined content
  throw new Error('Not implemented — placeholder for feature development');
}

/**
 * Test connectivity to the configured LLM endpoint.
 * Returns true if the endpoint responds, false otherwise.
 */
export async function testConnection(provider: LLMProviderConfig): Promise<boolean> {
  // TODO: Implement with a lightweight /v1/models call
  throw new Error('Not implemented — placeholder for feature development');
}

/**
 * Stream a refinement response for providers that support SSE.
 * Yields content chunks as they arrive.
 */
export async function* streamRefineSection(
  request: LLMRequest
): AsyncGenerator<string, void, unknown> {
  // TODO: Implement streaming via fetch + ReadableStream
  throw new Error('Not implemented — placeholder for feature development');
}
