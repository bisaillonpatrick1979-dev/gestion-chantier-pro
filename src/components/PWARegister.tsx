'use client'

import { useEffect, useState } from 'react'
import { useLangStore } from '@/store/useLangStore'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWARegister() {
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW error:', err))
    }

    // Capter l'event d'installation
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Afficher le banner seulement si pas déjà installé
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!isStandalone) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  if (!showBanner || !installPrompt) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-violet-900/95 to-cyan-900/95
        backdrop-blur-xl border border-violet-500/30 rounded-2xl p-4 shadow-2xl shadow-violet-500/20
        flex items-center gap-3">
        <div className="text-3xl flex-shrink-0">📱</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm">
            {t('Installer l\'app', 'Install the App')}
          </div>
          <div className="text-white/60 text-xs">
            {t('Accès rapide depuis votre écran d\'accueil', 'Quick access from your home screen')}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold
              hover:bg-violet-500 transition-all shadow-lg">
            {t('Installer', 'Install')}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="w-8 h-8 rounded-xl bg-white/10 text-white/60 text-sm
              flex items-center justify-center hover:bg-white/20 transition-all">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

