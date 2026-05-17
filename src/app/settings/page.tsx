'use client'

import { useState, useRef, useMemo } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import { CANADA_PROVINCES, USA_STATES } from '@/lib/payrollrates'
import { calculatePayroll, PAY_FREQUENCY_LABELS, formatPayrollResult } from '@/lib/payrollCalculator'
import type { PayFrequency } from '@/lib/payrollCalculator'
import {
  DecoCorners, DecoTitle,
  DecoBackground, DecoDiamondRow,
} from '@/components/DecoElements'

// ─── Thèmes ────────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'quantum',  label: '⚡ Quantum',  colors: 'from-violet-600 to-cyan-500' },
  { id: 'xp',       label: '🟣 XP',       colors: 'from-purple-600 to-cyan-400' },
  { id: 'aventure', label: '🌿 Aventure', colors: 'from-emerald-600 to-lime-400' },
  { id: 'deco',     label: '✨ Deco',     colors: 'from-yellow-600 to-amber-400' },
  { id: 'zen',      label: '🌸 Zen',      colors: 'from-pink-400 to-rose-300' },
  { id: 'ludique',  label: '🎮 Ludique',  colors: 'from-orange-500 to-pink-500' },
]

const TABS_FR = ['🏢 Co.','👤 Emp.','🎨 Thème','🌐 Langue','💳 Paiement','🔔 Rappels','📋 Conditions','⚙️ Avancé']
const TABS_EN = ['🏢 Co.','👤 Emp.','🎨 Theme','🌐 Language','💳 Payment','🔔 Reminders','📋 Terms','⚙️ Advanced']

const HOURS_PER_PERIOD: Record<string, number> = {
  weekly: 40, biweekly: 80, semimonthly: 86.67, monthly: 173.33,
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)

export default function SettingsPage() {
  const { lang, setLang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const { themeId, setTheme } = useThemeStore()
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isXP       = themeId === 'xp'
  const isAventure = themeId === 'aventure'
  const isZen      = themeId === 'zen'
  const isLudique  = themeId === 'ludique'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { company, setCompany } = useCompanyStore()
  const { enabled: voiceEnabled, volume: voiceVolume, setEnabled: setVoiceEnabled, setVolume: setVoiceVolume } = useVoiceReminderStore()

  const TABS = lang === 'fr' ? TABS_FR : TABS_EN
  const [activeTab, setActiveTab] = useState(0)

  // ── Formulaire ajout employé ──────────────────────────────────────────────
  const [newName, setNewName]             = useState('')
  const [newPin, setNewPin]               = useState('')
  const [newRole, setNewRole]             = useState<'admin' | 'employee'>('employee')
  const [newRate, setNewRate]             = useState('')
  const [newWorkerType, setNewWorkerType] = useState<'contractor' | 'salaried'>('contractor')
  const [newCountry, setNewCountry]       = useState<'CA' | 'US'>('CA')
  const [newProvince, setNewProvince]     = useState('AB')
  const [newFrequency, setNewFrequency]   = useState<PayFrequency>('weekly')

  // ── Édition employé ───────────────────────────────────────────────────────
  const [editingId, setEditingId]           = useState<string | null>(null)
  const [editName, setEditName]             = useState('')
  const [editRate, setEditRate]             = useState('')
  const [editWorkerType, setEditWorkerType] = useState<'contractor' | 'salaried'>('contractor')
  const [editCountry, setEditCountry]       = useState<'CA' | 'US'>('CA')
  const [editProvince, setEditProvince]     = useState('AB')
  const [editFrequency, setEditFrequency]   = useState<PayFrequency>('weekly')

  // ── Reset PIN admin ───────────────────────────────────────────────────────
  const [showResetPin, setShowResetPin] = useState(false)
  const [resetPinVal, setResetPinVal]   = useState('')

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoRef = useRef<HTMLInputElement>(null)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCompany({ logoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  // ── Calcul déductions en temps réel ──────────────────────────────────────
  const calcDeductions = (
    rate: string, workerType: string, country: 'CA'|'US',
    province: string, frequency: PayFrequency
  ) => {
    if (workerType !== 'salaried' || !rate || !province) return null
    const grossPay = parseFloat(rate) * HOURS_PER_PERIOD[frequency]
    if (!grossPay || grossPay <= 0) return null
    try {
      return calculatePayroll(grossPay, country, province, frequency)
    } catch { return null }
  }

  const newDeductions = useMemo(() =>
    calcDeductions(newRate, newWorkerType, newCountry, newProvince, newFrequency),
    [newRate, newWorkerType, newCountry, newProvince, newFrequency]
  )

  const editDeductions = useMemo(() =>
    calcDeductions(editRate, editWorkerType, editCountry, editProvince, editFrequency),
    [editRate, editWorkerType, editCountry, editProvince, editFrequency]
  )

  // ── Ajouter employé ───────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newName.trim() || newPin.length < 4) return
    addEmployee({
      name: newName.trim(),
      pin: newPin,
      role: newRole,
      hourlyRate: parseFloat(newRate) || 0,
      workMode: 'heure',
      color: '#a855f7',
      active: true,
      workerType: newWorkerType,
      employeeCountry: newWorkerType === 'salaried' ? newCountry : undefined,
      employeeProvince: newWorkerType === 'salaried' ? newProvince : undefined,
      payFrequency: newWorkerType === 'salaried' ? newFrequency : undefined,
    })
    setNewName(''); setNewPin(''); setNewRate('')
    setNewWorkerType('contractor'); setNewCountry('CA'); setNewProvince('AB')
  }

  // ── Classes UI ────────────────────────────────────────────────────────────
  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco
      ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum
      ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'
    }`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const btnPrimary = `w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95
    ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00] shadow-lg'
      : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
      : isAventure ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
      : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'}`

  const card = `rounded-2xl p-5 space-y-3 relative ${cardClass}
    ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
      : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
      : 'bg-white/5 border border-white/10'}`

  // ── Sélecteur province/état ───────────────────────────────────────────────
  const ProvinceSelect = ({
    country, value, onChange
  }: { country: 'CA'|'US', value: string, onChange: (v: string) => void }) => (
    <select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>
      {country === 'CA'
        ? Object.values(CANADA_PROVINCES).map(p => (
            <option key={p.code} value={p.code}>
              {lang === 'fr' ? p.nameFR : p.name} ({p.code})
            </option>
          ))
        : Object.values(USA_STATES).sort((a,b) => a.name.localeCompare(b.name)).map(s => (
            <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
          ))
      }
    </select>
  )

  // ── Affichage déductions ──────────────────────────────────────────────────
  const DeductionsCard = ({ result }: { result: ReturnType<typeof calculatePayroll> }) => {
    const rows = formatPayrollResult(result, lang as 'fr'|'en')
    return (
      <div className={`rounded-xl p-3 space-y-1
        ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/20'
          : 'bg-white/5 border border-white/10'}`}>
        <div className={`text-xs font-bold uppercase tracking-widest mb-2
          ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/40'}`}>
          📊 {t('Déductions estimées / période', 'Estimated Deductions / Period')}
        </div>
        {rows.filter(r => r.label !== '─────').map((row, i) => (
          <div key={i} className={`flex justify-between text-xs
            ${row.type === 'net' ? 'pt-1 border-t border-white/10 font-black'
              : row.type === 'total' ? 'pt-1 border-t border-white/10 font-bold'
              : row.isEmployer ? 'opacity-50'
              : ''}`}>
            <span className={
              row.type === 'net' ? isDeco ? 'text-[#D6B25E]' : 'text-emerald-400'
              : row.type === 'total' ? isDeco ? 'text-[#D6B25E]' : 'text-violet-300'
              : row.isEmployer ? 'text-orange-300/70'
              : 'text-white/70'
            }>{row.label}</span>
            <span className={
              row.type === 'net' ? isDeco ? 'text-[#D6B25E]' : 'text-emerald-400'
              : row.amount < 0 ? 'text-red-400'
              : row.isEmployer ? 'text-orange-300/70'
              : 'text-white/80'
            }>{fmt(Math.abs(row.amount))}</span>
          </div>
        ))}
        <div className={`text-xs mt-2 pt-2 border-t border-white/10
          ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>
          ⚠️ {t('Estimation seulement — vérifier avec un comptable', 'Estimate only — verify with accountant')}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 relative">
      {isDeco && <DecoBackground />}
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-5">
          {isDeco
            ? <DecoTitle>⚙️ {t('Réglages', 'Settings')}</DecoTitle>
            : <h1 className={`text-2xl font-black tracking-tight
                ${isXP||isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'
                  : isAventure ? 'text-emerald-300'
                  : isZen ? 'text-pink-300'
                  : isLudique ? 'text-orange-300'
                  : 'text-white'}`}>
                ⚙️ {t('Réglages', 'Settings')}
              </h1>
          }
          <p className="text-white/40 text-xs mt-1">Hailite Xteriors</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                ${activeTab === i
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]'
                    : isQuantum ? 'bg-violet-600 text-white'
                    : 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ═══ TAB 0 — COMPAGNIE ═══════════════════════════════════════════ */}
        {activeTab === 0 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              🏢 {t('Informations compagnie', 'Company Information')}
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4">
              {company.logoUrl
                ? <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl border border-white/20" />
                : <div className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl
                    ${isDeco ? 'border-[#D6B25E]/30' : 'border-white/20'}`}>🏗️</div>
              }
              <div className="flex flex-col gap-2">
                <button onClick={() => logoRef.current?.click()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold
                    ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white'}`}>
                  📁 {t('Logo', 'Logo')}
                </button>
                {company.logoUrl && (
                  <button onClick={() => setCompany({ logoUrl: '' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">
                    🗑️
                  </button>
                )}
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('Nom compagnie','Company Name'), key: 'name', placeholder: 'Hailite Xteriors', span: 2 },
                { label: t('Propriétaire','Owner'), key: 'ownerName', placeholder: 'Patrick Bisaillon', span: 2 },
                { label: t('Adresse','Address'), key: 'address', placeholder: '123 Main St', span: 2 },
                { label: t('Ville','City'), key: 'city', placeholder: 'Calgary', span: 1 },
                { label: t('Province','Province'), key: 'province', placeholder: 'AB', span: 1 },
                { label: t('Code postal','Postal Code'), key: 'postalCode', placeholder: 'T2X 1A1', span: 1 },
                { label: t('Téléphone','Phone'), key: 'phone', placeholder: '403-555-1234', span: 1 },
                { label: t('Courriel','Email'), key: 'email', placeholder: 'info@hailite.ca', span: 2 },
                { label: t('N° TPS/GST','GST Number'), key: 'gstNumber', placeholder: '123456789 RT0001', span: 1 },
                { label: t('N° WCB','WCB Number'), key: 'wcbNumber', placeholder: 'WCB-XXXXXX', span: 1 },
              ].map(f => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className={labelClass}>{f.label}</label>
                  <input className={inputClass}
                    value={(company as any)[f.key] ?? ''}
                    onChange={e => setCompany({ [f.key]: e.target.value })}
                    placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ═══ TAB 1 — EMPLOYÉS ════════════════════════════════════════════ */}
        {activeTab === 1 && (
          <div className="space-y-4">

            {/* Liste employés existants */}
            {employees.map(emp => (
              <div key={emp.id} className={card}>
                {isDeco && <DecoCorners />}
                {editingId === emp.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>{t('Nom','Name')}</label>
                      <input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('Taux $/h','Rate $/h')}</label>
                      <input className={inputClass} type="number" value={editRate} onChange={e => setEditRate(e.target.value)} />
                    </div>

                    {/* Type de travailleur */}
                    <div>
                      <label className={labelClass}>{t('Type de travailleur','Worker Type')}</label>
                      <div className="flex gap-2">
                        {[
                          { val: 'contractor', icon: '📋', label: t('Contracteur','Contractor') },
                          { val: 'salaried',   icon: '💼', label: t('Salarié','Salaried') },
                        ].map(opt => (
                          <button key={opt.val}
                            onClick={() => setEditWorkerType(opt.val as any)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                              ${editWorkerType === opt.val
                                ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]'
                                  : isQuantum ? 'bg-violet-600 text-white'
                                  : 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/50'}`}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Champs salarié */}
                    {editWorkerType === 'salaried' && (
                      <div className="space-y-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <label className={labelClass}>{t('Pays','Country')}</label>
                          <select className={inputClass} value={editCountry}
                            onChange={e => { setEditCountry(e.target.value as any); setEditProvince(e.target.value === 'CA' ? 'AB' : 'TX') }}>
                            <option value="CA">🇨🇦 Canada</option>
                            <option value="US">🇺🇸 États-Unis / USA</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{editCountry === 'CA' ? t('Province','Province') : t('État','State')}</label>
                          <ProvinceSelect country={editCountry} value={editProvince} onChange={setEditProvince} />
                        </div>
                        <div>
                          <label className={labelClass}>{t('Fréquence de paie','Pay Frequency')}</label>
                          <select className={inputClass} value={editFrequency} onChange={e => setEditFrequency(e.target.value as PayFrequency)}>
                            {Object.entries(PAY_FREQUENCY_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{lang === 'fr' ? v.fr : v.en}</option>
                            ))}
                          </select>
                        </div>
                        {editDeductions && <DeductionsCard result={editDeductions} />}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateEmployee(emp.id, {
                            name: editName,
                            hourlyRate: parseFloat(editRate) || 0,
                            workerType: editWorkerType,
                            employeeCountry: editWorkerType === 'salaried' ? editCountry : undefined,
                            employeeProvince: editWorkerType === 'salaried' ? editProvince : undefined,
                            payFrequency: editWorkerType === 'salaried' ? editFrequency : undefined,
                          })
                          setEditingId(null)
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold
                          ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>
                        ✅ {t('Sauvegarder','Save')}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">
                        ✕ {t('Annuler','Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{emp.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${emp.role === 'admin'
                            ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-white/10 text-white/60'}`}>
                          {emp.role === 'admin' ? '👑 Admin' : '👷 Emp.'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${emp.workerType === 'salaried'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-green-500/20 text-green-300'}`}>
                          {emp.workerType === 'salaried' ? '💼 ' + t('Salarié','Salaried') : '📋 ' + t('Contracteur','Contractor')}
                        </span>
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {emp.hourlyRate ? `$${emp.hourlyRate}/h` : '—'}
                        {emp.workerType === 'salaried' && emp.employeeProvince
                          ? ` · ${emp.employeeProvince} · ${emp.payFrequency ?? ''}`
                          : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(emp.id)
                          setEditName(emp.name)
                          setEditRate(String(emp.hourlyRate || ''))
                          setEditWorkerType(emp.workerType ?? 'contractor')
                          setEditCountry(emp.employeeCountry ?? 'CA')
                          setEditProvince(emp.employeeProvince ?? 'AB')
                          setEditFrequency(emp.payFrequency ?? 'weekly')
                        }}
                        className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
                        ✏️
                      </button>
                      {emp.role !== 'admin' && (
                        <button onClick={() => deleteEmployee(emp.id)}
                          className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Ajouter un employé */}
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                ➕ {t('Ajouter un employé', 'Add Employee')}
              </div>

              <div>
                <label className={labelClass}>{t('Nom complet','Full Name')}</label>
                <input className={inputClass} value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('Prénom Nom','First Last')} />
              </div>
              <div>
                <label className={labelClass}>{t('PIN (4+ chiffres)','PIN (4+ digits)')}</label>
                <input className={inputClass} value={newPin} onChange={e => setNewPin(e.target.value)} type="password" placeholder="••••" />
              </div>
              <div>
                <label className={labelClass}>{t('Taux horaire $/h','Hourly Rate $/h')}</label>
                <input className={inputClass} value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder="25" />
              </div>
              <div>
                <label className={labelClass}>{t('Rôle','Role')}</label>
                <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                  <option value="employee">👷 {t('Employé','Employee')}</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              {/* Type de travailleur */}
              <div>
                <label className={labelClass}>{t('Type de travailleur','Worker Type')}</label>
                <div className="flex gap-2">
                  {[
                    { val: 'contractor', icon: '📋', labelFR: 'Contracteur', labelEN: 'Contractor' },
                    { val: 'salaried',   icon: '💼', labelFR: 'Salarié',     labelEN: 'Salaried' },
                  ].map(opt => (
                    <button key={opt.val}
                      onClick={() => setNewWorkerType(opt.val as any)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all
                        ${newWorkerType === opt.val
                          ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]'
                            : isQuantum ? 'bg-violet-600 text-white'
                            : 'bg-white/20 text-white ring-2 ring-white/20'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {opt.icon} {lang === 'fr' ? opt.labelFR : opt.labelEN}
                    </button>
                  ))}
                </div>
              </div>

              {/* Champs supplémentaires si salarié */}
              {newWorkerType === 'salaried' && (
                <div className="space-y-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`text-xs font-bold ${isDeco ? 'text-[#D6B25E]/70' : 'text-white/50'}`}>
                    💼 {t('Paramètres de paie','Payroll Settings')}
                  </div>
                  <div>
                    <label className={labelClass}>{t('Pays','Country')}</label>
                    <select className={inputClass} value={newCountry}
                      onChange={e => {
                        setNewCountry(e.target.value as any)
                        setNewProvince(e.target.value === 'CA' ? 'AB' : 'TX')
                      }}>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="US">🇺🇸 États-Unis / USA</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{newCountry === 'CA' ? t('Province','Province') : t('État','State')}</label>
                    <ProvinceSelect country={newCountry} value={newProvince} onChange={setNewProvince} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('Fréquence de paie','Pay Frequency')}</label>
                    <select className={inputClass} value={newFrequency} onChange={e => setNewFrequency(e.target.value as PayFrequency)}>
                      {Object.entries(PAY_FREQUENCY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{lang === 'fr' ? v.fr : v.en}</option>
                      ))}
                    </select>
                  </div>
                  {/* Déductions calculées */}
                  {newDeductions && <DeductionsCard result={newDeductions} />}
                  {newRate && !newDeductions && (
                    <div className="text-white/40 text-xs text-center py-2">
                      {t('Entrez un taux horaire pour voir les déductions','Enter hourly rate to see deductions')}
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleAdd} className={btnPrimary}>
                ✅ {t('Ajouter','Add')}
              </button>
            </div>

            {/* Reset PIN admin */}
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                🔐 {t('Reset PIN Admin','Reset Admin PIN')}
              </div>
              {showResetPin ? (
                <div className="space-y-3">
                  <input className={inputClass} value={resetPinVal}
                    onChange={e => setResetPinVal(e.target.value)}
                    type="password" placeholder={t('Nouveau PIN (4+ chiffres)','New PIN (4+ digits)')} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const admin = employees.find(e => e.role === 'admin')
                        if (admin && resetPinVal.length >= 4) {
                          updateEmployee(admin.id, { pin: resetPinVal })
                          setShowResetPin(false); setResetPinVal('')
                        }
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold
                        ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>
                      ✅ {t('Confirmer','Confirm')}
                    </button>
                    <button onClick={() => setShowResetPin(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">
                      ✕ {t('Annuler','Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowResetPin(true)}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  🔐 {t('Réinitialiser PIN Admin','Reset Admin PIN')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 2 — THÈME ═══════════════════════════════════════════════ */}
        {activeTab === 2 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              🎨 {t('Choisir un thème','Choose a Theme')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id as any)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold text-sm transition-all
                    bg-gradient-to-br ${th.colors} text-white
                    ${themeId === th.id ? 'ring-2 ring-white/60 scale-105 shadow-xl' : 'opacity-80 hover:opacity-100'}`}>
                  <span className="text-2xl">{th.label.split(' ')[0]}</span>
                  <span>{th.label.split(' ').slice(1).join(' ')}</span>
                  {themeId === th.id && <span className="text-xs">✅ {t('Actif','Active')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 3 — LANGUE ══════════════════════════════════════════════ */}
        {activeTab === 3 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              🌐 {t('Langue / Language','Language / Langue')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'en', flag: '🇺🇸', label: 'English' }].map(l => (
                <button key={l.code} onClick={() => setLang(l.code as any)}
                  className={`p-5 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all
                    ${lang === l.code
                      ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] scale-105'
                        : isQuantum ? 'bg-violet-600 text-white scale-105'
                        : 'bg-white/20 text-white scale-105'
                      : 'bg-white/5 text-white/60'}`}>
                  <span className="text-4xl">{l.flag}</span>
                  <span className="text-sm">{l.label}</span>
                  {lang === l.code && <span className="text-xs">✅ {t('Actif','Active')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 4 — PAIEMENT ════════════════════════════════════════════ */}
        {activeTab === 4 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              💳 {t('Informations de paiement','Payment Information')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('Courriel Virement','E-Transfer Email'), key: 'etransferEmail', placeholder: 'paiement@hailite.ca', span: 2 },
                { label: t('Banque','Bank Name'), key: 'bankName', placeholder: 'TD Bank', span: 2 },
                { label: t('Transit','Transit'), key: 'bankTransit', placeholder: '00000', span: 1 },
                { label: t('Institution','Institution'), key: 'bankInstitution', placeholder: '004', span: 1 },
                { label: t('N° compte','Account #'), key: 'bankAccount', placeholder: '1234567', span: 2 },
              ].map(f => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className={labelClass}>{f.label}</label>
                  <input className={inputClass}
                    value={(company as any)[f.key] ?? ''}
                    onChange={e => setCompany({ [f.key]: e.target.value })}
                    placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 5 — RAPPELS ═════════════════════════════════════════════ */}
        {activeTab === 5 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              🔔 {t('Rappels vocaux Punch Out','Voice Punch Out Reminders')}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`font-semibold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                  {t('Rappels activés','Reminders Enabled')}
                </div>
                <div className="text-white/40 text-xs">{t('Progressifs : 4h → 8h → 9h → toutes les 15 min','Progressive: 4h → 8h → 9h → every 15 min')}</div>
              </div>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300
                  ${voiceEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
                  ${voiceEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            {voiceEnabled && (
              <>
                <div className="space-y-2 mb-4">
                  <label className={labelClass}>{t('Volume','Volume')} : {Math.round(voiceVolume * 100)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={voiceVolume}
                    onChange={e => setVoiceVolume(parseFloat(e.target.value))}
                    className="w-full accent-violet-500" />
                </div>
                <button
                  onClick={() => {
                    const u = new SpeechSynthesisUtterance(
                      lang === 'fr' ? 'Test rappel vocal — Pense à pointer ta sortie!'
                        : 'Voice reminder test — Don\'t forget to punch out!'
                    )
                    u.volume = voiceVolume
                    u.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'
                    speechSynthesis.speak(u)
                  }}
                  className={`w-full py-3 rounded-xl text-sm font-bold
                    ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : isQuantum ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white'}`}>
                  🔊 {t('Tester','Test')}
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══ TAB 6 — CONDITIONS ══════════════════════════════════════════ */}
        {activeTab === 6 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
              📋 {t('Conditions par défaut','Default Terms')}
            </div>
            <div>
              <label className={labelClass}>{t('Délai de paiement','Payment Terms')}</label>
              <select className={inputClass} value={company.defaultPaymentTerms ?? 'Net 30'}
                onChange={e => setCompany({ defaultPaymentTerms: e.target.value })}>
                <option value="Due on receipt">{t('Dû à réception','Due on Receipt')}</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('Notes par défaut','Default Notes')}</label>
              <textarea className={`${inputClass} min-h-[90px] resize-none`}
                value={company.defaultNotes ?? ''}
                onChange={e => setCompany({ defaultNotes: e.target.value })}
                placeholder={t('Merci pour votre confiance!','Thank you for your business!')} />
            </div>
          </div>
        )}

        {/* ═══ TAB 7 — AVANCÉ ══════════════════════════════════════════════ */}
        {activeTab === 7 && (
          <div className="space-y-4">
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                🗑️ {t('Vider le cache local','Clear Local Cache')}
              </div>
              <div className="text-white/40 text-xs">
                {t('Efface toutes les données enregistrées. Action irréversible.','Clears all stored data. Cannot be undone.')}
              </div>
              <button
                onClick={() => {
                  if (confirm(t('Êtes-vous certain? Toutes les données seront perdues.','Are you sure? All data will be lost.'))) {
                    localStorage.clear(); window.location.reload()
                  }
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                🗑️ {t('Vider le cache','Clear Cache')}
              </button>
            </div>

            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📱 PWA</div>
              <div className="text-white/40 text-xs">
                {t('Navigateur → Partager → Ajouter à l\'écran d\'accueil','Browser → Share → Add to Home Screen')}
              </div>
            </div>

            <div className={`${card} text-center`}>
              <div className="text-white/20 text-xs">
                Gestion Chantier Pro — Hailite Xteriors<br />
                v2.0 · Alberta GST 5% · 2026
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
