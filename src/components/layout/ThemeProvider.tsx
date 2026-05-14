'use client'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-surface', theme.colors.surface)
    root.style.setProperty('--color-card', theme.colors.card)
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-primary-light', theme.colors.primaryLight)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-secondary-light', theme.colors.secondaryLight)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-text-muted', theme.colors.textMuted)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-glow1', theme.colors.glow1)
    root.style.setProperty('--color-glow2', theme.colors.glow2)
    document.body.style.backgroundColor = theme.colors.background
    document.body.style.color = theme.colors.text
  }, [theme])

  return <>{children}</>
}
