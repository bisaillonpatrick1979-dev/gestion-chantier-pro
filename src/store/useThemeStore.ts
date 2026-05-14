import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, getTheme } from '@/lib/themes'

interface ThemeStore {
  themeId: string
  theme: Theme
  setTheme: (id: string) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      themeId: 'sunset',
      theme: getTheme('sunset'),
      setTheme: id =>
        set({
          themeId: id,
          theme: getTheme(id),
        }),
    }),
    { name: 'gcp-theme' }
  )
)
