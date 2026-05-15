import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, getTheme, DEFAULT_THEME_ID } from '@/lib/themes'

interface ThemeStore {
  themeId: string
  theme: Theme
  setTheme: (id: string) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      themeId: DEFAULT_THEME_ID,
      theme: getTheme(DEFAULT_THEME_ID),
      setTheme: id =>
        set({
          themeId: id,
          theme: getTheme(id),
        }),
    }),
    { name: 'gcp-theme' }
  )
)
