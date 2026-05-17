'use client'
// src/components/PayrollUpdateBanner.tsx

import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

// ⚠️ Mettre à jour ces 2 lignes chaque 1er janvier
const PAYROLL_YEAR = 2026
const PAYROLL_NEXT_UPDATE = '2027-01-01'

const BANNER_KEY = `payroll-banner-dismissed-${PAYROLL_YEAR}`

export default function PayrollUpdateBanner() {
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'
  const isQuantum = themeId === 'quantum'

  const [show, setShow] = useState(false)

  useEffect(() => {
    const today = new Date()
    const nextUpdate = new Date(PAYROLL_NEXT_UPDATE)
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)

    // Afficher si on est dans les 30 jours après la date de mise à jour
    const daysDiff = Math.floor((today.getTime() - nextUpdate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff >= 0 && daysDiff <= 30 && !dismissed) {
      setShow(true)
    }

    // Aussi afficher si on est dans les 7 jours AVANT la mise à jour (rappel préventif)
    const daysUntil = Math.floor((nextUpdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil >= 0 && daysUntil <= 7 && !dismissed) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  const nextUpdate = new Date(PAYROLL_NEXT_UPDATE)
  const isPast = new Date() >= nextUpdate

  return (
    <div className={`mx-4 mt-2 rounded-2xl p-4 border flex gap-3 items-start
      ${isDeco
        ? 'bg-[#1a1500]/90 border-[#D6B25E]/40'
        : isQuantum
        ? 'bg-[#0a0015]/90 border-violet-500/40'
        : 'bg-orange-950/80 border-orange-500/40'
      }`}>

      <div className="text-2xl flex-shrink-0">
        {isPast ? '🚨' : '🔔'}
      </div>

      <div className="flex-1">
        <div className={`font-bold text-sm mb-1
          ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-orange-300'}`}>
          {isPast
            ? t('Mise à jour des taux de paie requise', 'Payroll Rates Update Required')
            : t('Rappel — Mise à jour des taux bientôt', 'Reminder — Payroll Rates Update Soon')
          }
        </div>
        <div className="text-white/60 text-xs leading-relaxed">
          {isPast
            ? t(
                `Les taux CPP, AE et impôts changent le 1er janvier. Les taux actuels dans l'app sont pour ${PAYROLL_YEAR}. Mettez à jour payrollRates.ts avec les nouveaux chiffres de l'ARC.`,
                `CPP, EI and tax rates change on January 1st. Current rates in the app are for ${PAYROLL_YEAR}. Update payrollRates.ts with new CRA figures.`
              )
            : t(
                `Les taux de paie pour ${PAYROLL_YEAR + 1} seront publiés par l'ARC vers le 1er janvier. Pensez à mettre à jour payrollRates.ts.`,
                `Payroll rates for ${PAYROLL_YEAR + 1} will be published by CRA around January 1st. Remember to update payrollRates.ts.`
              )
          }
        </div>
        <div className="flex gap-2 mt-3">
          <a
            href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll.html"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
              ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E] hover:bg-[#D6B25E]/30'
                : isQuantum ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                : 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'}`}>
            🔗 {t('Site ARC', 'CRA Website')}
          </a>
          <button
            onClick={dismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white/60 hover:bg-white/20 transition-all">
            {t('Compris ✓', 'Got it ✓')}
          </button>
        </div>
      </div>
    </div>
  )
}
