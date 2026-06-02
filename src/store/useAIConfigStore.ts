import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIProvider = 'anthropic' | 'openai'

export const ANTHROPIC_MODELS = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (recommandé)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
]

export const OPENAI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (recommandé)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
]

interface AIConfigStore {
  provider: AIProvider
  apiKey: string
  model: string
  setProvider: (provider: AIProvider) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
}

export const useAIConfigStore = create<AIConfigStore>()(
  persist(
    (set) => ({
      provider: 'anthropic',
      apiKey: '',
      model: 'claude-sonnet-4-6',
      setProvider: (provider) =>
        set({
          provider,
          model: provider === 'anthropic' ? 'claude-sonnet-4-6' : 'gpt-4o',
        }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
    }),
    { name: 'gcp-ai-config' }
  )
)
