'use client'
// src/components/ThemeInjector.tsx
// Injecte le globalCSS du thème actif dans <head>
// S'exécute côté client uniquement

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeInjector() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const STYLE_ID = 'gcp-theme-global-css'

    // Supprime l'ancien style si présent
    const existing = document.getElementById(STYLE_ID)
    if (existing) existing.remove()

    // Injecte le nouveau CSS du thème
    if (theme.globalCSS) {
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = theme.globalCSS
      document.head.appendChild(style)
    }

    // Nettoyage au démontage
    return () => {
      const el = document.getElementById(STYLE_ID)
      if (el) el.remove()
    }
  }, [theme])

  return null
}
