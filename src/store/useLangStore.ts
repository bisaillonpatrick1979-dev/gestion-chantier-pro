'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Lang = 'fr' | 'en'

interface LangStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'fr',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'gcp-lang' }
  )
)
