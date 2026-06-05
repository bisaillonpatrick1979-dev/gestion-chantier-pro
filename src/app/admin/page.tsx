'use client'

import AdminShell from '@/components/layout/AdminShell'
import RoleGuard from '@/components/security/RoleGuard'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'

function money(value: number) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value)
}

export default function AdminPage() {
  const { employees, activeSessions, dayDetails } = useEmployeeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const realEmployees = employees.filter((employee) => employee.id !== 'admin')
  const activeCount = Object.keys(activeSessions).length
  const totalHours = Object.values(dayDetails).reduce((sum, day) => sum + (day.totalHours || 0), 0)
  const totalRevenue = Object.values(dayDetails).reduce((sum, day) => sum + (day.totalRevenue || 0), 0)

  return (
    <RoleGuard
      allow={['admin']}
      fallbackTitle={t('Espace admin verrouillé', 'Admin area locked')}
      fallbackMessage={t(
        'Les employés ne peuvent pas accéder aux clients, contrats, profits, factures globales ou réglages d\'administration.',
        'Employees cannot access clients, contracts, profits, global invoices or administration settings.'
      )}
    >
      <AdminShell
        title={t('Tableau de bord admin', 'Admin Dashboard')}
        subtitle={t(
          'Vue bureau : équipe, chantiers, documents, comptabilité et statistiques.',
          'Office view: team, job sites, documents, accounting and statistics.'
        )}
      >
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Équipe', 'Team')}</p>
            <p className="mt-2 text-3xl font-black text-white">{realEmployees.length}</p>
            <p className="mt-1 text-sm text-slate-300">{t('employés / sous-traitants', 'employees / subcontractors')}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('En cours', 'Active')}</p>
            <p className="mt-2 text-3xl font-black text-amber-300">{activeCount}</p>
            <p className="mt-1 text-sm text-slate-300">{t('punch actif', 'active punch')}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Heures', 'Hours')}</p>
            <p className="mt-2 text-3xl font-black text-cyan-300">{totalHours.toFixed(1)}h</p>
            <p className="mt-1 text-sm text-slate-300">{t('historique local', 'local history')}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('Production', 'Production')}</p>
            <p className="mt-2 text-3xl font-black text-emerald-300">{money(totalRevenue)}</p>
            <p className="mt-1 text-sm text-slate-300">{t('valeur terrain', 'field value')}</p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">{t('Priorités de refactor', 'Refactor priorities')}</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <p>✅ {t('Séparer Admin/Bureau et Employé/Terrain.', 'Separate Admin/Office and Employee/Field.')}</p>
              <p>➡️ {t('Créer Clients, Employés, Chantiers en listes compactes + détails.', 'Create Clients, Employees, Sites in compact lists + detail views.')}</p>
              <p>➡️ {t('Ajouter documents professionnels : devis, contrats, factures PDF.', 'Add professional documents: quotes, contracts, PDF invoices.')}</p>
              <p>➡️ {t('Ajouter signature tactile, logo, watermark, preview, email/SMS.', 'Add touch signature, logo, watermark, preview, email/SMS.')}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="text-xl font-black">{t('Sécurité rôle', 'Role security')}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {t(
                'Cette section doit rester réservée à l\'administrateur. Les employés doivent seulement voir leurs propres punchs, pauses, statistiques, calendrier, profil et factures personnelles de sous-traitant.',
                'This section must remain reserved for the administrator. Employees should only see their own punches, breaks, statistics, calendar, profile and personal subcontractor invoices.'
              )}
            </p>
          </div>
        </section>
      </AdminShell>
    </RoleGuard>
  )
}
