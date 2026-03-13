/**
 * llm-proxy.ts -- Client-side LLM API client for the skill creator.
 *
 * Makes direct calls from the browser to the user's configured LLM endpoint.
 * All supported providers expose an OpenAI-compatible /v1/chat/completions API.
 *
 * Security:
 * - API keys are stored in browser localStorage only
 * - No keys are ever sent to OMS servers
 * - CORS must be enabled on the LLM endpoint for browser-direct calls
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
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    model: 'google/gemma-3-27b-it:free',
    maxTokens: 2048,
    temperature: 0.7,
  },
  runpod: {
    name: 'RunPod',
    endpoint: 'https://api.runpod.ai/v2/{YOUR_ENDPOINT_ID}/openai/v1',
    model: 'default',
    maxTokens: 2048,
    temperature: 0.7,
  },
  together: {
    name: 'Together AI',
    endpoint: 'https://api.together.xyz/v1',
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    maxTokens: 2048,
    temperature: 0.7,
  },
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 2048,
    temperature: 0.7,
  },
  huggingface: {
    name: 'Hugging Face',
    endpoint: 'https://router.huggingface.co/v1',
    model: 'Qwen/Qwen2.5-72B-Instruct',
    maxTokens: 2048,
    temperature: 0.7,
  },
  mistral: {
    name: 'Mistral AI',
    endpoint: 'https://api.mistral.ai/v1',
    model: 'mistral-small-latest',
    maxTokens: 2048,
    temperature: 0.7,
  },
};

const STORAGE_KEY = 'oms-llm-provider';

/** Save provider config to localStorage. */
export function saveProviderConfig(config: LLMProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable
  }
}

/** Load provider config from localStorage. */
export function loadProviderConfig(): LLMProviderConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LLMProviderConfig;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

/** Get a default provider configuration. */
export function getDefaultProvider(): LLMProviderConfig {
  return {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/v1',
    model: 'llama3',
    maxTokens: 2048,
    temperature: 0.7,
  };
}

/**
 * Fetch available models from the LLM endpoint.
 * Works with Ollama, LMStudio, vLLM, and any OpenAI-compatible API.
 */
export async function fetchAvailableModels(provider: LLMProviderConfig): Promise<string[]> {
  try {
    const endpoint = provider.endpoint.replace(/\/+$/, '');
    const headers: Record<string, string> = {};
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const res = await fetch(`${endpoint}/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    // OpenAI-compatible format: { data: [{ id: "model-name", ... }] }
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id).filter(Boolean).sort();
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Send a refinement request to the configured LLM provider.
 *
 * Constructs the messages array with the section system prompt and user content,
 * then calls the OpenAI-compatible chat completions endpoint.
 */
export async function refineSection(request: LLMRequest): Promise<LLMResponse> {
  const { provider, systemPrompt, userContent } = request;

  const endpoint = provider.endpoint.replace(/\/+$/, '');
  const url = `${endpoint}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  const body = {
    model: provider.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: provider.maxTokens,
    temperature: provider.temperature,
    stream: false,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error(
        'Request timed out after 30 seconds. Check your LLM endpoint in Settings — if using a local model (Ollama/LMStudio), make sure it is reachable from your browser.'
      );
    }
    if (err instanceof TypeError) {
      throw new Error(
        'Cannot reach the LLM endpoint. If accessing OMS remotely, use the server\'s IP instead of "localhost" in Settings.'
      );
    }
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`LLM request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('LLM returned an empty response');
  }

  return {
    refinedContent: choice.message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
    model: data.model ?? provider.model,
  };
}

/**
 * Test connectivity to the configured LLM endpoint.
 * Returns true if the endpoint responds, false otherwise.
 */
export async function testConnection(provider: LLMProviderConfig): Promise<boolean> {
  try {
    const endpoint = provider.endpoint.replace(/\/+$/, '');
    const headers: Record<string, string> = {};
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const res = await fetch(`${endpoint}/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000),
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Stream a refinement response for providers that support SSE.
 * Yields content chunks as they arrive.
 */
export async function* streamRefineSection(
  request: LLMRequest
): AsyncGenerator<string, void, unknown> {
  const { provider, systemPrompt, userContent } = request;

  const endpoint = provider.endpoint.replace(/\/+$/, '');
  const url = `${endpoint}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  const body = {
    model: provider.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: provider.maxTokens,
    temperature: provider.temperature,
    stream: true,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new Error(
        'Streaming request timed out after 60 seconds. Check your LLM endpoint in Settings — if using a local model (Ollama/LMStudio), make sure it is reachable from your browser.'
      );
    }
    if (err instanceof TypeError) {
      throw new Error(
        'Cannot reach the LLM endpoint. If accessing OMS remotely, use the server\'s IP instead of "localhost" in Settings.'
      );
    }
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`LLM streaming request failed (${res.status}): ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body for streaming');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // Skip malformed SSE lines
      }
    }
  }
}
