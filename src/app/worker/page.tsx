'use client'

import WorkerShell from '@/components/layout/WorkerShell'
import RoleGuard from '@/components/security/RoleGuard'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'

export default function WorkerPage() {
  const { employees, currentEmployeeId, activeSessions, dayDetails } = useEmployeeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const employee = employees.find((item) => item.id === currentEmployeeId)
  const active = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const todayKey = employee ? `${employee.id}-${new Date().toISOString().split('T')[0]}` : ''
  const today = todayKey ? dayDetails[todayKey] : null

  return (
    <RoleGuard
      allow={['employee', 'admin']}
      fallbackTitle={t('Connexion employé requise', 'Employee login required')}
      fallbackMessage={t(
        'Choisis ton profil et entre ton PIN pour accéder à ton espace terrain.',
        'Choose your profile and enter your PIN to access your field portal.'
      )}
    >
      <WorkerShell
        title={t('Accueil terrain', 'Field Home')}
        subtitle={t(
          'Tes informations seulement : punch, pauses, journée, calendrier et profil.',
          'Your information only: punch, breaks, day, calendar and profile.'
        )}
      >
        <section className="grid gap-4">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
              {t('Statut actuel', 'Current Status')}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {active ? t('Punch actif', 'Active punch') : t('Aucun punch actif', 'No active punch')}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {active
                ? `${t('Temps', 'Time')} : ${formatTimer(active.elapsed)} • ${t('Valeur', 'Value')} : ${formatCurrency(active.revenue)}`
                : t(
                    "Utilise l'onglet Punch pour commencer ta journée.",
                    'Use the Punch tab to start your day.'
                  )}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {t("Aujourd'hui", 'Today')}
              </p>
              <p className="mt-2 text-3xl font-black text-cyan-300">{(today?.totalHours || 0).toFixed(1)}h</p>
              <p className="mt-1 text-sm text-slate-300">{t('heures travaillées', 'hours worked')}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {t('Argent', 'Earnings')}
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-300">{formatCurrency(today?.totalRevenue || 0)}</p>
              <p className="mt-1 text-sm text-slate-300">{t('valeur du jour', "today's value")}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {t('Pauses', 'Breaks')}
              </p>
              <p className="mt-2 text-3xl font-black text-amber-300">{formatTimer(today?.totalBreak || 0)}</p>
              <p className="mt-1 text-sm text-slate-300">{t('temps de pause', 'break time')}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">{t('Règle importante', 'Important rule')}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {t(
                "Cet espace ne doit afficher que tes données personnelles. Les contrats clients, profits, comptabilité, paie des autres employés et réglages admin restent dans l'espace Admin.",
                "This space only shows your personal data. Client contracts, profits, accounting, other employees' pay and admin settings remain in the Admin area."
              )}
            </p>
          </div>
        </section>
      </WorkerShell>
    </RoleGuard>
  )
}
