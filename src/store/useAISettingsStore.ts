'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIProvider = 'anthropic' | 'openai' | 'google_ai_studio' | 'deepseek'
export type AIMode = 'disabled' | 'app_limited' | 'bring_your_own_key'

export type AISettings = {
  enabled: boolean
  mode: AIMode
  provider: AIProvider
  model: string
  monthlyLimit: number
  allowPhotoAnalysis: boolean
  allowVoice: boolean
  allowWebAdvice: boolean
  userApiKey: string
}

type AISettingsStore = {
  settings: AISettings
  updateSettings: (patch: Partial<AISettings>) => void
}

export const defaultModels: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4.1-mini',
  google_ai_studio: 'gemini-1.5-flash',
  deepseek: 'deepseek-chat',
}

export const providerLabels: Record<AIProvider, string> = {
  anthropic: 'Anthropic / Claude',
  openai: 'OpenAI',
  google_ai_studio: 'Google AI Studio / Gemini',
  deepseek: 'DeepSeek',
}

export const defaultAISettings: AISettings = {
  enabled: true,
  mode: 'app_limited',
  provider: 'anthropic',
  model: defaultModels.anthropic,
  monthlyLimit: 100,
  allowPhotoAnalysis: true,
  allowVoice: true,
  allowWebAdvice: true,
  userApiKey: '',
}

export const useAISettingsStore = create<AISettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultAISettings,
      updateSettings: patch => set({ settings: { ...get().settings, ...patch } }),
    }),
    { name: 'ai-settings-store-v1' }
  )
)
