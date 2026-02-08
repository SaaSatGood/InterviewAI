import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InterviewReport } from '@/types';
import { Language, detectBrowserLanguage, translations } from './i18n';

export type Provider = 'openai' | 'gemini' | 'azure' | 'anthropic';

export const PROVIDERS: { id: Provider; name: string; keyPrefix: string; validateUrl?: string }[] = [
  { id: 'openai', name: 'OpenAI', keyPrefix: 'sk-', validateUrl: 'https://api.openai.com/v1/models' },
  { id: 'gemini', name: 'Google Gemini', keyPrefix: 'AI', validateUrl: 'https://generativelanguage.googleapis.com/v1beta/models?key=' },
  { id: 'azure', name: 'Azure OpenAI', keyPrefix: '' },
  { id: 'anthropic', name: 'Anthropic Claude', keyPrefix: 'sk-ant-' },
];

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  provider: Provider;
  createdAt: number;
}

export interface UserProfile {
  position: string;
  stacks: string[]; // Changed from single stack to array
  level: string;
  softSkills: string[];
  businessTopics: string[];
  modernPractices: string[];
}

interface AppState {
  // Internationalization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Configuration
  apiKeys: ApiKey[];
  activeKeyId: string | null;

  // Actions for API Keys
  addApiKey: (name: string, key: string, provider: Provider) => void;
  removeApiKey: (id: string) => void;
  setActiveKey: (id: string) => void;

  // Computed - Active Key
  getActiveKey: () => ApiKey | undefined;

  // Interview Session
  userProfile: UserProfile | null;
  report: InterviewReport | null;
  setUserProfile: (profile: UserProfile | null) => void;
  setReport: (report: InterviewReport | null) => void;

  isConfigured: () => boolean;
  resetSession: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en', // Will be overridden by persisted value or browser detection

      setLanguage: (language: Language) => set({ language }),

      t: (key: string) => {
        const state = get();
        return translations[state.language]?.[key] || translations['en'][key] || key;
      },

      apiKeys: [],
      activeKeyId: null,
      userProfile: null,
      report: null,

      addApiKey: (name: string, key: string, provider: Provider) => {
        const newKey: ApiKey = {
          id: crypto.randomUUID(),
          name,
          key,
          provider,
          createdAt: Date.now(),
        };
        set((state) => {
          const newKeys = [...state.apiKeys, newKey];
          return {
            apiKeys: newKeys,
            activeKeyId: state.activeKeyId ?? newKey.id, // Auto-select first key
          };
        });
      },

      removeApiKey: (id: string) => {
        set((state) => {
          const newKeys = state.apiKeys.filter((k) => k.id !== id);
          const newActiveId = state.activeKeyId === id
            ? (newKeys.length > 0 ? newKeys[0].id : null)
            : state.activeKeyId;
          return { apiKeys: newKeys, activeKeyId: newActiveId };
        });
      },

      setActiveKey: (id: string) => set({ activeKeyId: id }),

      getActiveKey: () => {
        const state = get();
        return state.apiKeys.find((k) => k.id === state.activeKeyId);
      },

      setUserProfile: (userProfile: UserProfile | null) => set({ userProfile, report: null }),
      setReport: (report: InterviewReport | null) => set({ report }),

      isConfigured: () => {
        const state = get();
        return state.apiKeys.length > 0 && state.activeKeyId !== null;
      },
      resetSession: () => set({ userProfile: null, report: null }),
    }),
    {
      name: 'interview-ai-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        activeKeyId: state.activeKeyId,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        // Auto-detect language on first visit if not set
        if (state && !state.language) {
          state.setLanguage(detectBrowserLanguage());
        }
      },
    }
  )
);
