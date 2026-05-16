'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

export default function ThemeInjector() {
  const { theme, themeId } = useThemeStore()

  useEffect(() => {
    const STYLE_ID = 'gcp-theme-global-css'
    const VAR_ID = 'gcp-theme-vars'

    // Supprime les anciens styles
    document.getElementById(STYLE_ID)?.remove()
    document.getElementById(VAR_ID)?.remove()

    // Injecte les variables CSS sur :root
    const vars = document.createElement('style')
    vars.id = VAR_ID
    vars.textContent = `
      :root {
        --bg:           ${theme.colors.background};
        --surface:      ${theme.colors.surface};
        --card:         ${theme.colors.card};
        --card-alt:     ${theme.colors.cardAlt};
        --border:       ${theme.colors.border};
        --border-strong:${theme.colors.borderStrong};
        --text:         ${theme.colors.text};
        --text-muted:   ${theme.colors.textMuted};
        --text-weak:    ${theme.colors.textWeak};
        --primary:      ${theme.colors.primary};
        --primary-light:${theme.colors.primaryLight};
        --secondary:    ${theme.colors.secondary};
        --secondary-light:${theme.colors.secondaryLight};
        --glow1:        ${theme.colors.glow1};
        --glow2:        ${theme.colors.glow2};
        --success:      ${theme.colors.success};
        --warning:      ${theme.colors.warning};
        --danger:       ${theme.colors.danger};
        --info:         ${theme.colors.info};
        --nav-bg:       ${theme.colors.navBackground};
        --nav-border:   ${theme.colors.navBorder};
        --nav-active:   ${theme.colors.navActive};
        --nav-inactive: ${theme.colors.navInactive};
        --input-bg:     ${theme.colors.surface};
      }

      * { box-sizing: border-box; }

      body {
        background: ${theme.colors.background} !important;
        color: ${theme.colors.text} !important;
        transition: background 0.3s ease, color 0.3s ease;
      }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 2px; }

      /* Inputs globaux */
      input, textarea, select {
        background: ${theme.colors.surface} !important;
        color: ${theme.colors.text} !important;
        border-color: ${theme.colors.border} !important;
      }

      /* Transitions douces sur les cartes */
      .theme-card {
        background: ${theme.colors.card};
        border: 1px solid ${theme.colors.border};
        border-radius: 12px;
        transition: background 0.3s ease, border-color 0.3s ease;
      }
    `
    document.head.appendChild(vars)

    // Injecte le CSS global du thème
    if (theme.globalCSS) {
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = theme.globalCSS
      document.head.appendChild(style)
    }

    // data-theme sur body pour ciblage CSS
    document.body.setAttribute('data-theme', themeId)

    return () => {
      document.getElementById(STYLE_ID)?.remove()
      document.getElementById(VAR_ID)?.remove()
    }
  }, [theme, themeId])

  return null
}
