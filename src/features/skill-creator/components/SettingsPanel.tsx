/**
 * SettingsPanel.tsx -- LLM provider configuration panel.
 *
 * Slide-over panel where users configure their LLM endpoint, model,
 * API key, and other parameters. Supports provider presets for quick setup.
 */

import { useState, useCallback, useEffect } from 'react';
import type { LLMProviderConfig } from '../types';
import { PROVIDER_PRESETS, testConnection, fetchAvailableModels } from '../lib/llm-proxy';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  provider: LLMProviderConfig;
  onProviderUpdate: (provider: LLMProviderConfig) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed';

export default function SettingsPanel({
  isOpen,
  onClose,
  provider,
  onProviderUpdate,
}: SettingsPanelProps) {
  const [local, setLocal] = useState<LLMProviderConfig>(provider);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Reset local state when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocal(provider);
      setConnectionStatus('idle');
      setAvailableModels([]);
      setLoadingModels(false);
    }
  }, [isOpen, provider]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handlePresetSelect = useCallback((presetKey: string) => {
    const preset = PROVIDER_PRESETS[presetKey];
    if (preset) {
      setLocal((prev) => ({
        ...prev,
        ...preset,
        name: preset.name ?? prev.name,
        endpoint: preset.endpoint ?? prev.endpoint,
        model: preset.model ?? prev.model,
        maxTokens: preset.maxTokens ?? prev.maxTokens,
        temperature: preset.temperature ?? prev.temperature,
      }));
    }
  }, []);

  const handleFetchModels = useCallback(async () => {
    setLoadingModels(true);
    const models = await fetchAvailableModels(local);
    setAvailableModels(models);
    setLoadingModels(false);
    // Auto-select first model if current model isn't in the list
    if (models.length > 0 && !models.includes(local.model)) {
      setLocal((prev) => ({ ...prev, model: models[0] }));
    }
  }, [local]);

  const handleTestConnection = useCallback(async () => {
    setConnectionStatus('testing');
    const ok = await testConnection(local);
    setConnectionStatus(ok ? 'connected' : 'failed');
    if (ok) {
      // Auto-fetch available models on successful connection
      const models = await fetchAvailableModels(local);
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(local.model)) {
        setLocal((prev) => ({ ...prev, model: models[0] }));
      }
    }
  }, [local]);

  const handleSave = useCallback(() => {
    onProviderUpdate(local);
    onClose();
  }, [local, onProviderUpdate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-gray-900 border-l border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">LLM Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure your AI provider for skill refinement
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Remote access tip */}
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3.5 py-3">
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold">Remote access?</span>{' '}
              If you are accessing OMS from another device, use your server's IP address
              (e.g., <code className="rounded bg-amber-900/40 px-1 py-0.5 text-[11px] font-mono">http://YOUR_SERVER_IP:11434/v1</code>)
              instead of <code className="rounded bg-amber-900/40 px-1 py-0.5 text-[11px] font-mono">localhost</code>.
            </p>
          </div>

          {/* Provider presets */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Quick Setup
            </label>

            {/* Local / Self-Hosted */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Local / Self-Hosted
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(
                [
                  { key: 'ollama', badge: null },
                  { key: 'lmstudio', badge: null },
                  { key: 'vllm', badge: null },
                  { key: 'runpod', badge: null },
                ] as const
              ).map(({ key, badge }) => {
                const preset = PROVIDER_PRESETS[key];
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      local.name === preset.name
                        ? 'border-cyan-600 bg-cyan-950/30 text-cyan-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {preset.name}
                    {badge && (
                      <span className="ml-1.5 rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Cloud APIs */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Cloud APIs
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(
                [
                  { key: 'deepseek', badge: 'Recommended' },
                  { key: 'openrouter', badge: 'Free tier' },
                  { key: 'groq', badge: 'Fast' },
                  { key: 'together', badge: null },
                  { key: 'huggingface', badge: null },
                  { key: 'mistral', badge: null },
                  { key: 'openai', badge: null },
                ] as const
              ).map(({ key, badge }) => {
                const preset = PROVIDER_PRESETS[key];
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      local.name === preset.name
                        ? 'border-cyan-600 bg-cyan-950/30'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className={`block text-xs font-medium ${
                      local.name === preset.name ? 'text-cyan-400' : 'text-slate-300'
                    }`}>
                      {preset.name}
                    </span>
                    {badge && (
                      <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                        badge === 'Recommended'
                          ? 'bg-emerald-900/40 text-emerald-400'
                          : badge === 'Free tier'
                            ? 'bg-violet-900/40 text-violet-400'
                            : badge === 'Fast'
                              ? 'bg-amber-900/40 text-amber-400'
                              : 'bg-slate-800 text-slate-500'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-600 leading-relaxed">
              All providers use the OpenAI-compatible API format. You can use any endpoint that supports <code className="rounded bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-400">/v1/chat/completions</code>.
            </p>
          </div>

          {/* Endpoint */}
          <div>
            <label htmlFor="settings-endpoint" className="block text-xs font-medium text-slate-400 mb-1">
              API Endpoint
            </label>
            <input
              id="settings-endpoint"
              type="url"
              value={local.endpoint}
              onChange={(e) => setLocal((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="http://localhost:11434/v1"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
          </div>

          {/* Model */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="settings-model" className="block text-xs font-medium text-slate-400">
                Model
              </label>
              {availableModels.length === 0 && (
                <button
                  onClick={handleFetchModels}
                  disabled={loadingModels}
                  className="text-[10px] text-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                >
                  {loadingModels ? 'Loading...' : 'Detect Models'}
                </button>
              )}
            </div>
            {availableModels.length > 0 ? (
              <select
                id="settings-model"
                value={local.model}
                onChange={(e) => setLocal((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                id="settings-model"
                type="text"
                value={local.model}
                onChange={(e) => setLocal((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="llama3"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            )}
            {availableModels.length > 0 && (
              <p className="mt-1 text-[10px] text-slate-600">
                {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="settings-apikey" className="block text-xs font-medium text-slate-400 mb-1">
              API Key
              <span className="ml-1 text-slate-600">(optional for local providers)</span>
            </label>
            <input
              id="settings-apikey"
              type="password"
              value={local.apiKey ?? ''}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  apiKey: e.target.value || undefined,
                }))
              }
              placeholder="sk-..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
            <p className="mt-1 text-[10px] text-slate-600">
              Stored in your browser only. Never sent to OMS servers.
            </p>
          </div>

          {/* Advanced: Temperature and Max Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-temp" className="block text-xs font-medium text-slate-400 mb-1">
                Temperature
              </label>
              <input
                id="settings-temp"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={local.temperature}
                onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    temperature: parseFloat(e.target.value) || 0.7,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
            <div>
              <label htmlFor="settings-tokens" className="block text-xs font-medium text-slate-400 mb-1">
                Max Tokens
              </label>
              <input
                id="settings-tokens"
                type="number"
                min="256"
                max="8192"
                step="256"
                value={local.maxTokens}
                onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    maxTokens: parseInt(e.target.value) || 2048,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            </div>
          </div>

          {/* Connection test */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing'}
              className="w-full rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {connectionStatus === 'testing' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Testing...
                </span>
              ) : (
                'Test Connection'
              )}
            </button>
            {connectionStatus === 'connected' && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Connected to {local.name}
              </p>
            )}
            {connectionStatus === 'failed' && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Connection failed. Verify the endpoint URL is correct, the service is running, and CORS is enabled. If accessing remotely, replace localhost with the server IP.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
