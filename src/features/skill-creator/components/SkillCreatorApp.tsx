/**
 * SkillCreatorApp.tsx -- Root component for the chat-to-create-skill feature.
 *
 * Manages all state via useReducer and orchestrates the child components:
 * SectionSidebar, ChatInterface, SectionPreview, SkillOutputModal, and SettingsPanel.
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import type {
  SkillSection,
  SkillMetadata,
  ChatMessage,
  LLMProviderConfig,
  SectionId,
  MedicalCategory,
  EvidenceLevel,
  SafetyClassification,
} from '../types';
import { DEFAULT_SECTIONS } from '../lib/skill-templates';
import {
  loadProviderConfig,
  saveProviderConfig,
  getDefaultProvider,
  refineSection,
  streamRefineSection,
} from '../lib/llm-proxy';
import { buildPrompt } from '../prompts/system-prompts';
import { validateAllSections, validateMetadata } from '../lib/section-validators';
import { assembleSkillOutput } from '../lib/skill-assembler';
import SectionSidebar from './SectionSidebar';
import ChatInterface from './ChatInterface';
import SectionPreview from './SectionPreview';
import SkillOutputModal from './SkillOutputModal';
import SettingsPanel from './SettingsPanel';

// ---- State types ----

interface AppState {
  sections: SkillSection[];
  messages: ChatMessage[];
  activeSectionId: string;
  metadata: SkillMetadata;
  provider: LLMProviderConfig;
  isGenerating: boolean;
  streamingContent: string;
  showOutput: boolean;
  showSettings: boolean;
  outputSkillMd: string;
  outputContentYaml: string;
}

type AppAction =
  | { type: 'SET_ACTIVE_SECTION'; id: string }
  | { type: 'UPDATE_SECTION_CONTENT'; id: string; content: string }
  | { type: 'SET_SECTION_STATUS'; id: string; status: SkillSection['status'] }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'ADD_CUSTOM_SECTION'; section: SkillSection }
  | { type: 'REMOVE_CUSTOM_SECTION'; id: string }
  | { type: 'UPDATE_METADATA'; metadata: Partial<SkillMetadata> }
  | { type: 'SET_PROVIDER'; provider: LLMProviderConfig }
  | { type: 'SET_GENERATING'; value: boolean }
  | { type: 'SET_STREAMING_CONTENT'; content: string }
  | { type: 'APPEND_STREAMING_CONTENT'; chunk: string }
  | { type: 'TOGGLE_OUTPUT'; value: boolean }
  | { type: 'TOGGLE_SETTINGS'; value: boolean }
  | { type: 'SET_OUTPUT'; skillMd: string; contentYaml: string }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };

const DRAFT_STORAGE_KEY = 'oms-skill-draft';

function getInitialMetadata(): SkillMetadata {
  return {
    name: '',
    displayName: '',
    description: '',
    author: '',
    repository: '',
    category: 'diagnosis' as MedicalCategory,
    tags: [],
    version: '1.0.0',
    license: 'MIT',
    evidenceLevel: 'moderate' as EvidenceLevel,
    safetyClassification: 'caution' as SafetyClassification,
    specialty: [],
    dateAdded: new Date().toISOString().split('T')[0],
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSectionId: action.id, streamingContent: '' };

    case 'UPDATE_SECTION_CONTENT': {
      const sections = state.sections.map((s) =>
        s.id === action.id
          ? {
              ...s,
              content: action.content,
              status: action.content.trim() ? ('draft' as const) : ('empty' as const),
            }
          : s
      );
      return { ...state, sections };
    }

    case 'SET_SECTION_STATUS': {
      const sections = state.sections.map((s) =>
        s.id === action.id ? { ...s, status: action.status } : s
      );
      return { ...state, sections };
    }

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };

    case 'ADD_CUSTOM_SECTION': {
      const refIdx = state.sections.findIndex((s) => s.id === 'references');
      const sections = [...state.sections];
      if (refIdx >= 0) {
        sections.splice(refIdx, 0, action.section);
      } else {
        sections.push(action.section);
      }
      return { ...state, sections };
    }

    case 'REMOVE_CUSTOM_SECTION': {
      const sections = state.sections.filter((s) => s.id !== action.id);
      const activeSectionId =
        state.activeSectionId === action.id ? sections[0]?.id ?? 'title' : state.activeSectionId;
      return { ...state, sections, activeSectionId };
    }

    case 'UPDATE_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.metadata } };

    case 'SET_PROVIDER':
      return { ...state, provider: action.provider };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.value };

    case 'SET_STREAMING_CONTENT':
      return { ...state, streamingContent: action.content };

    case 'APPEND_STREAMING_CONTENT':
      return { ...state, streamingContent: state.streamingContent + action.chunk };

    case 'TOGGLE_OUTPUT':
      return { ...state, showOutput: action.value };

    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: action.value };

    case 'SET_OUTPUT':
      return { ...state, outputSkillMd: action.skillMd, outputContentYaml: action.contentYaml };

    case 'LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

function getInitialState(): AppState {
  const provider = loadProviderConfig() ?? getDefaultProvider();
  return {
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
    messages: [],
    activeSectionId: 'title',
    metadata: getInitialMetadata(),
    provider,
    isGenerating: false,
    streamingContent: '',
    showOutput: false,
    showSettings: false,
    outputSkillMd: '',
    outputContentYaml: '',
  };
}

export default function SkillCreatorApp() {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const [error, setError] = useState<string | null>(null);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.sections && saved.metadata) {
          dispatch({
            type: 'LOAD_STATE',
            state: {
              sections: saved.sections,
              messages: saved.messages ?? [],
              metadata: saved.metadata,
              activeSectionId: saved.activeSectionId ?? 'title',
            },
          });
        }
      }
    } catch {
      // Ignore corrupted localStorage data
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    try {
      const draft = {
        sections: state.sections,
        messages: state.messages,
        metadata: state.metadata,
        activeSectionId: state.activeSectionId,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // localStorage may be unavailable
    }
  }, [state.sections, state.messages, state.metadata, state.activeSectionId]);

  // Keep metadata in sync with title/description sections
  useEffect(() => {
    const titleSection = state.sections.find((s) => s.id === 'title');
    const descSection = state.sections.find((s) => s.id === 'description');
    const titleContent = titleSection?.content.trim() ?? '';
    const descContent = descSection?.content.trim() ?? '';

    const updates: Partial<SkillMetadata> = {};

    if (titleContent && titleContent !== state.metadata.displayName) {
      updates.displayName = titleContent;
      const kebab = titleContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      updates.name = kebab;
    }

    if (descContent) {
      const firstSentence = descContent.split(/\.\s/)[0] + '.';
      if (firstSentence !== state.metadata.description) {
        updates.description = firstSentence.length > 200 ? descContent.slice(0, 200) : firstSentence;
      }
    }

    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_METADATA', metadata: updates });
    }
  }, [state.sections, state.metadata.displayName, state.metadata.description]);

  const activeSection = state.sections.find((s) => s.id === state.activeSectionId);

  // Build previous sections context for LLM
  const getPreviousSections = useCallback((): Record<string, string> => {
    const prev: Record<string, string> = {};
    for (const s of state.sections) {
      if (s.id !== state.activeSectionId && s.content.trim()) {
        prev[s.displayName] = s.content;
      }
    }
    return prev;
  }, [state.sections, state.activeSectionId]);

  // Handle "Refine with AI" click
  const handleRefine = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || state.isGenerating) return;

      setError(null);

      // Check if a localhost endpoint will work when accessing OMS remotely
      const isRemoteAccess = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isLocalhostEndpoint = state.provider.endpoint.includes('localhost') || state.provider.endpoint.includes('127.0.0.1');

      if (isLocalhostEndpoint && isRemoteAccess) {
        setError('Your LLM endpoint is set to localhost, but you are accessing OMS remotely. Open Settings to configure a reachable endpoint (e.g., your server\'s IP address or a cloud API like DeepSeek).');
        return;
      }

      dispatch({ type: 'SET_GENERATING', value: true });
      dispatch({ type: 'SET_STREAMING_CONTENT', content: '' });

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userInput,
        sectionId: state.activeSectionId,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', message: userMsg });

      const { system, user } = buildPrompt(
        state.activeSectionId as SectionId,
        userInput,
        getPreviousSections()
      );

      try {
        // Try streaming first
        let fullContent = '';
        try {
          for await (const chunk of streamRefineSection({
            sectionId: state.activeSectionId,
            userContent: user,
            systemPrompt: system,
            previousSections: getPreviousSections(),
            provider: state.provider,
          })) {
            fullContent += chunk;
            dispatch({ type: 'APPEND_STREAMING_CONTENT', chunk });
          }
        } catch {
          // Fall back to non-streaming
          fullContent = '';
          dispatch({ type: 'SET_STREAMING_CONTENT', content: '' });
          const response = await refineSection({
            sectionId: state.activeSectionId,
            userContent: user,
            systemPrompt: system,
            previousSections: getPreviousSections(),
            provider: state.provider,
          });
          fullContent = response.refinedContent;
          dispatch({ type: 'SET_STREAMING_CONTENT', content: fullContent });
        }

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: fullContent,
          sectionId: state.activeSectionId,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', message: assistantMsg });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errMsg);

        const errorAssistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${errMsg}. Please check your LLM settings and try again.`,
          sectionId: state.activeSectionId,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', message: errorAssistantMsg });
      } finally {
        dispatch({ type: 'SET_GENERATING', value: false });
      }
    },
    [state.isGenerating, state.activeSectionId, state.provider, getPreviousSections]
  );

  // Accept AI suggestion into the section
  const handleAcceptSuggestion = useCallback(
    (content: string) => {
      dispatch({
        type: 'UPDATE_SECTION_CONTENT',
        id: state.activeSectionId,
        content,
      });
      dispatch({
        type: 'SET_SECTION_STATUS',
        id: state.activeSectionId,
        status: 'refined',
      });
      dispatch({ type: 'SET_STREAMING_CONTENT', content: '' });
    },
    [state.activeSectionId]
  );

  // Generate output
  const handleGenerateOutput = useCallback(() => {
    const sectionValidation = validateAllSections(state.sections);
    if (!sectionValidation.valid) {
      setError(`Validation errors: ${sectionValidation.errors.join('; ')}`);
      return;
    }

    const metaValidation = validateMetadata(state.metadata);
    if (!metaValidation.valid) {
      setError(`Metadata errors: ${metaValidation.errors.join('; ')}`);
      return;
    }

    setError(null);
    const output = assembleSkillOutput(state.sections, state.metadata);
    dispatch({
      type: 'SET_OUTPUT',
      skillMd: output.skillMd,
      contentYaml: output.contentYaml,
    });
    dispatch({ type: 'TOGGLE_OUTPUT', value: true });
  }, [state.sections, state.metadata]);

  // Add custom section
  const handleAddSection = useCallback(() => {
    const title = prompt('Enter a title for the custom section:');
    if (!title?.trim()) return;

    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const section: SkillSection = {
      id,
      displayName: title.trim(),
      required: false,
      content: '',
      status: 'empty',
      customTitle: title.trim(),
    };
    dispatch({ type: 'ADD_CUSTOM_SECTION', section });
    dispatch({ type: 'SET_ACTIVE_SECTION', id });
  }, []);

  // Clear draft
  const handleClearDraft = useCallback(() => {
    if (!confirm('Are you sure you want to clear all progress? This cannot be undone.')) return;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    dispatch({
      type: 'LOAD_STATE',
      state: {
        sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
        messages: [],
        metadata: getInitialMetadata(),
        activeSectionId: 'title',
        streamingContent: '',
      },
    });
    setError(null);
  }, []);

  // Provider update
  const handleProviderUpdate = useCallback((provider: LLMProviderConfig) => {
    dispatch({ type: 'SET_PROVIDER', provider });
    saveProviderConfig(provider);
  }, []);

  // Count completed sections
  const completedCount = state.sections.filter(
    (s) => s.content.trim().length > 0
  ).length;
  const totalRequired = state.sections.filter((s) => s.required).length;
  const requiredCompleted = state.sections.filter(
    (s) => s.required && s.content.trim().length > 0
  ).length;

  // Filter messages for active section
  const sectionMessages = state.messages.filter(
    (m) => m.sectionId === state.activeSectionId
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-gray-950 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white">Skill Creator</h1>
          <span className="text-xs text-slate-500">
            {requiredCompleted}/{totalRequired} required sections
          </span>
          {completedCount > 0 && (
            <div className="h-1.5 w-24 rounded-full bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-cyan-500 transition-all duration-300"
                style={{
                  width: `${(requiredCompleted / totalRequired) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS', value: true })}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="LLM Settings"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <button
            onClick={handleClearDraft}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            Clear Draft
          </button>
          <button
            onClick={handleGenerateOutput}
            disabled={requiredCompleted < totalRequired}
            className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Generate Skill
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-800/50 bg-red-950/50 px-4 py-2 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section sidebar */}
        <SectionSidebar
          sections={state.sections}
          activeSectionId={state.activeSectionId}
          onSectionSelect={(id) => dispatch({ type: 'SET_ACTIVE_SECTION', id })}
          onAddSection={handleAddSection}
          onRemoveSection={(id) => dispatch({ type: 'REMOVE_CUSTOM_SECTION', id })}
        />

        {/* Center: Chat interface */}
        <ChatInterface
          section={activeSection ?? state.sections[0]}
          messages={sectionMessages}
          isGenerating={state.isGenerating}
          streamingContent={state.streamingContent}
          onRefine={handleRefine}
          onAccept={handleAcceptSuggestion}
          metadata={state.metadata}
          onUpdateMetadata={(meta) => dispatch({ type: 'UPDATE_METADATA', metadata: meta })}
        />

        {/* Right: Preview */}
        <SectionPreview
          sectionId={state.activeSectionId}
          content={activeSection?.content ?? ''}
          onEdit={(content) =>
            dispatch({
              type: 'UPDATE_SECTION_CONTENT',
              id: state.activeSectionId,
              content,
            })
          }
        />
      </div>

      {/* Output modal */}
      <SkillOutputModal
        isOpen={state.showOutput}
        onClose={() => dispatch({ type: 'TOGGLE_OUTPUT', value: false })}
        skillMd={state.outputSkillMd}
        contentYaml={state.outputContentYaml}
        skillName={state.metadata.name}
      />

      {/* Settings panel */}
      <SettingsPanel
        isOpen={state.showSettings}
        onClose={() => dispatch({ type: 'TOGGLE_SETTINGS', value: false })}
        provider={state.provider}
        onProviderUpdate={handleProviderUpdate}
      />
    </div>
  );
}
