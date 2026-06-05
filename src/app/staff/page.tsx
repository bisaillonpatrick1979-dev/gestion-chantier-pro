'use client'

import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'
import { STAFF_PRESETS, type StaffPresetKey } from '@/lib/staffPresets'

const presetLabelEn: Record<string, string> = {
  salaried: 'Salaried Employee',
  contractor: 'Subcontractor',
  autonomous: 'Self-Employed Worker',
  accountant: 'Accountant',
  secretary: 'Secretary / Admin',
}

export default function StaffPage() {
  const { employees, addEmployee } = useEmployeeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const [presetKey, setPresetKey] = useState<StaffPresetKey>('salaried')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [rate, setRate] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const preset = STAFF_PRESETS[presetKey]

  function createStaff() {
    if (!name.trim() || pin.length < 4) return
    addEmployee({
      name: name.trim(),
      pin,
      role: preset.role as any,
      workerType: preset.workerType as any,
      accessProfile: preset.accessProfile as any,
      permissions: [...preset.permissions] as any,
      workMode: preset.workMode as any,
      hourlyRate: Number(rate) || 0,
      color: '#a855f7',
      active: true,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      employeeProvince: preset.workerType === 'salaried' ? 'AB' : undefined,
      payFrequency: preset.workerType === 'salaried' ? 'biweekly' : undefined,
      payPeriodStart: preset.workerType === 'salaried' ? 'monday' : undefined,
    })
    setName('')
    setPin('')
    setRate('')
    setEmail('')
    setPhone('')
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white">
    <div className="mx-auto max-w-lg space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-2xl font-black">👥 {t('Staff / rôles', 'Staff / Roles')}</h1>
        <p className="mt-2 text-sm text-white/55">
          {t(
            'Crée un salarié, sous-traitant, travailleur autonome, comptable ou secrétaire avec les accès appropriés.',
            'Create a salaried employee, subcontractor, self-employed worker, accountant or secretary with appropriate access.'
          )}
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
        <label className="block text-xs font-black uppercase tracking-widest text-white/50">
          {t('Type de profil', 'Profile type')}
        </label>
        <select
          className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white"
          value={presetKey}
          onChange={e => setPresetKey(e.target.value as StaffPresetKey)}
        >
          {Object.entries(STAFF_PRESETS).map(([key, p]) => (
            <option key={key} value={key}>
              {lang === 'en' ? (presetLabelEn[key] || p.labelFr) : p.labelFr}
            </option>
          ))}
        </select>

        <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" value={name} onChange={e => setName(e.target.value)} placeholder={t('Nom complet', 'Full name')} />
        <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder={t('PIN 4 chiffres', '4-digit PIN')} inputMode="numeric" type="password" />
        <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" value={rate} onChange={e => setRate(e.target.value)} placeholder={t('Taux $/h, $/pi² ou forfait', 'Rate $/h, $/sqft or flat fee')} inputMode="decimal" />
        <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('Téléphone', 'Phone')} />
        <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('Courriel', 'Email')} />

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
          <b>{t('Accès', 'Access')}:</b> {preset.permissions.join(', ')}
          {preset.permissions.includes('no_money') && (
            <p className="mt-1 text-amber-200">
              {t('La secrétaire ne doit pas voir les montants d\'argent.', 'The secretary should not see monetary amounts.')}
            </p>
          )}
        </div>

        <button onClick={createStaff} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-4 font-black text-white">
          {t('Créer le profil', 'Create profile')}
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-black">{t('Profils existants', 'Existing profiles')}</h2>
        <div className="mt-3 space-y-2">
          {employees.map(e => <div key={e.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <b>{e.name}</b>
            <p className="text-xs text-white/55">{e.role} · {e.workerType || '—'} · {e.accessProfile || '—'}</p>
          </div>)}
        </div>
      </section>
    </div>
  </main>
}
