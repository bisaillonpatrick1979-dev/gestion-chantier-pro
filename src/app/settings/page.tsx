'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import { useClientStore } from '@/store/useClientStore'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Category, Unit } from '@/store/useCatalogueStore'
import { CANADA_PROVINCES, USA_STATES } from '@/lib/payrollrates'
import { calculatePayroll, PAY_FREQUENCY_LABELS, formatPayrollResult } from '@/lib/payrollCalculator'
import type { PayFrequency } from '@/lib/payrollCalculator'
import {
  DecoCorners, DecoTitle, DecoBackground, DecoDiamondRow,
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

const CATEGORIES: { id: Category; labelFR: string; labelEN: string; emoji: string }[] = [
  { id: 'toiture',     labelFR: 'Toiture',       labelEN: 'Roofing',      emoji: '🏠' },
  { id: 'siding',      labelFR: 'Siding',         labelEN: 'Siding',       emoji: '🏡' },
  { id: 'fixations',   labelFR: 'Fixations',      labelEN: 'Fasteners',    emoji: '🔩' },
  { id: 'etancheite',  labelFR: 'Étanchéité',     labelEN: 'Waterproofing',emoji: '💧' },
  { id: 'structure',   labelFR: 'Structure',      labelEN: 'Structure',    emoji: '🪵' },
  { id: 'maindoeuvre', labelFR: "Main-d'œuvre",   labelEN: 'Labour',       emoji: '👷' },
]

const UNITS: Unit[] = ['pi²', 'pi lin.', 'boîte', 'rouleau', 'feuille', 'tube', 'unité', 'heure']

const HOURS_PER_PERIOD: Record<string, number> = {
  weekly: 40, biweekly: 80, semimonthly: 86.67, monthly: 173.33,
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)

const TABS_FR = ['🏢 Co.','👤 Emp.','👥 Clients','📦 Catalogue','📊 Compta','🎨 Thème','🌐 Langue','💳 Paiement','🔔 Rappels','📋 Conditions','⚙️ Avancé']
const TABS_EN = ['🏢 Co.','👤 Emp.','👥 Clients','📦 Catalogue','📊 Accounting','🎨 Theme','🌐 Language','💳 Payment','🔔 Reminders','📋 Terms','⚙️ Advanced']

export default function SettingsPage() {
  const router = useRouter()
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

  // ── Stores ────────────────────────────────────────────────────────────────
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { company, setCompany } = useCompanyStore()
  const { enabled: voiceEnabled, volume: voiceVolume, setEnabled: setVoiceEnabled, setVolume: setVoiceVolume } = useVoiceReminderStore()
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useCatalogueStore()

  const TABS = lang === 'fr' ? TABS_FR : TABS_EN
  const [activeTab, setActiveTab] = useState(0)

  // ── UI Classes ────────────────────────────────────────────────────────────
  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco
      ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum
      ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'}`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const btnPrimary = `w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95
    ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]'
      : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
      : isAventure ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
      : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'}`

  const card = `rounded-2xl p-5 space-y-3 relative ${cardClass}
    ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
      : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
      : 'bg-white/5 border border-white/10'}`

  // ── État Employés ─────────────────────────────────────────────────────────
  const [newName, setNewName]             = useState('')
  const [newPin, setNewPin]               = useState('')
  const [newRole, setNewRole]             = useState<'admin' | 'employee'>('employee')
  const [newRate, setNewRate]             = useState('')
  const [newWorkerType, setNewWorkerType] = useState<'contractor' | 'salaried'>('contractor')
  const [newCountry, setNewCountry]       = useState<'CA' | 'US'>('CA')
  const [newProvince, setNewProvince]     = useState('AB')
  const [newFrequency, setNewFrequency]   = useState<PayFrequency>('weekly')
  const [addEmpError, setAddEmpError]     = useState('')
  const [addEmpSuccess, setAddEmpSuccess] = useState(false)

  const [editingEmpId, setEditingEmpId]           = useState<string | null>(null)
  const [editName, setEditName]                   = useState('')
  const [editRate, setEditRate]                   = useState('')
  const [editWorkerType, setEditWorkerType]       = useState<'contractor' | 'salaried'>('contractor')
  const [editCountry, setEditCountry]             = useState<'CA' | 'US'>('CA')
  const [editProvince, setEditProvince]           = useState('AB')
  const [editFrequency, setEditFrequency]         = useState<PayFrequency>('weekly')
  const [showResetPin, setShowResetPin]           = useState(false)
  const [resetPinVal, setResetPinVal]             = useState('')

  // ── État Clients ──────────────────────────────────────────────────────────
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', address: '', city: '', province: 'AB', postalCode: '', notes: '' })
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [showAddClient, setShowAddClient]     = useState(false)
  const [clientError, setClientError]         = useState('')

  // ── État Catalogue ─────────────────────────────────────────────────────────
  const [matForm, setMatForm] = useState({ name: '', category: 'toiture' as Category, emoji: '', unit: 'pi²' as Unit, prixFournisseur: '', prixClient: '', prixEmploye: '' })
  const [showAddMat, setShowAddMat]   = useState(false)
  const [catFilter, setCatFilter]     = useState<Category | 'all'>('all')
  const [matError, setMatError]       = useState('')

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoRef = useRef<HTMLInputElement>(null)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCompany({ logoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  // ── Déductions employé ─────────────────────────────────────────────────────
  const calcDeductions = (emp: { hourlyRate: number; workerType?: string; employeeCountry?: 'CA'|'US'; employeeProvince?: string; payFrequency?: PayFrequency }) => {
    if (emp.workerType !== 'salaried' || !emp.employeeProvince || !emp.payFrequency) return null
    const grossPay = emp.hourlyRate * (HOURS_PER_PERIOD[emp.payFrequency] || 40)
    if (!grossPay || grossPay <= 0) return null
    try { return calculatePayroll(grossPay, emp.employeeCountry || 'CA', emp.employeeProvince, emp.payFrequency) }
    catch { return null }
  }

  const newDeductions = useMemo(() => calcDeductions({ hourlyRate: parseFloat(newRate) || 0, workerType: newWorkerType, employeeCountry: newCountry, employeeProvince: newProvince, payFrequency: newFrequency }), [newRate, newWorkerType, newCountry, newProvince, newFrequency])

  const editDeductions = useMemo(() => calcDeductions({ hourlyRate: parseFloat(editRate) || 0, workerType: editWorkerType, employeeCountry: editCountry, employeeProvince: editProvince, payFrequency: editFrequency }), [editRate, editWorkerType, editCountry, editProvince, editFrequency])

  // ── Ajouter employé ────────────────────────────────────────────────────────
  const handleAddEmployee = () => {
    if (!newName.trim()) { setAddEmpError(t('⚠️ Le nom est requis.', '⚠️ Name is required.')); return }
    if (newPin.length < 4) { setAddEmpError(t('⚠️ PIN de 4 chiffres minimum requis.', '⚠️ PIN must be at least 4 digits.')); return }
    setAddEmpError('')
    addEmployee({
      name: newName.trim(), pin: newPin, role: newRole,
      hourlyRate: parseFloat(newRate) || 0,
      workMode: 'heure', color: '#a855f7', active: true,
      workerType: newWorkerType,
      employeeCountry: newWorkerType === 'salaried' ? newCountry : undefined,
      employeeProvince: newWorkerType === 'salaried' ? newProvince : undefined,
      payFrequency: newWorkerType === 'salaried' ? newFrequency : undefined,
    })
    setNewName(''); setNewPin(''); setNewRate(''); setNewRole('employee')
    setNewWorkerType('contractor')
    setAddEmpSuccess(true)
    setTimeout(() => setAddEmpSuccess(false), 2500)
  }

  // ── Sauvegarder employé ───────────────────────────────────────────────────
  const handleSaveEmployee = (id: string) => {
    updateEmployee(id, {
      name: editName, hourlyRate: parseFloat(editRate) || 0,
      workerType: editWorkerType,
      employeeCountry: editWorkerType === 'salaried' ? editCountry : undefined,
      employeeProvince: editWorkerType === 'salaried' ? editProvince : undefined,
      payFrequency: editWorkerType === 'salaried' ? editFrequency : undefined,
    })
    setEditingEmpId(null)
  }

  // ── Ajouter client ────────────────────────────────────────────────────────
  const handleAddClient = () => {
    if (!clientForm.name.trim()) { setClientError(t('⚠️ Le nom est requis.', '⚠️ Name is required.')); return }
    setClientError('')
    if (editingClientId) {
      updateClient(editingClientId, clientForm)
      setEditingClientId(null)
    } else {
      addClient(clientForm)
    }
    setClientForm({ name: '', phone: '', email: '', address: '', city: '', province: 'AB', postalCode: '', notes: '' })
    setShowAddClient(false)
  }

  // ── Ajouter matériau ──────────────────────────────────────────────────────
  const handleAddMaterial = () => {
    if (!matForm.name.trim()) { setMatError(t('⚠️ Le nom est requis.', '⚠️ Name is required.')); return }
    setMatError('')
    addMaterial({
      ...matForm,
      prixFournisseur: parseFloat(matForm.prixFournisseur) || undefined,
      prixClient: parseFloat(matForm.prixClient) || undefined,
      prixEmploye: parseFloat(matForm.prixEmploye) || undefined,
    })
    setMatForm({ name: '', category: 'toiture', emoji: '', unit: 'pi²', prixFournisseur: '', prixClient: '', prixEmploye: '' })
    setShowAddMat(false)
  }

  // ── Province/État selector ─────────────────────────────────────────────────
  const ProvinceSelect = ({ country, value, onChange }: { country: 'CA'|'US'; value: string; onChange: (v: string) => void }) => (
    <select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>
      {country === 'CA'
        ? Object.values(CANADA_PROVINCES).map(p => <option key={p.code} value={p.code}>{lang === 'fr' ? p.nameFR : p.name} ({p.code})</option>)
        : Object.values(USA_STATES).sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)
      }
    </select>
  )

  // ── Déductions card ────────────────────────────────────────────────────────
  const DeductionsCard = ({ result }: { result: NonNullable<ReturnType<typeof calcDeductions>> }) => {
    const rows = formatPayrollResult(result, lang as 'fr'|'en')
    return (
      <div className={`rounded-xl p-3 space-y-1.5 ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
        <div className={`text-xs font-bold uppercase tracking-widest ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/40'}`}>
          📊 {t('Déductions estimées / période', 'Estimated deductions / period')}
        </div>
        {rows.filter(r => r.label !== '─────').map((row, i) => (
          <div key={i} className={`flex justify-between items-center text-xs
            ${row.type === 'net' ? 'pt-1 border-t border-white/10 font-black'
              : row.type === 'total' ? 'pt-1 border-t border-white/10 font-bold'
              : ''}`}>
            <span className={row.type === 'net' ? isDeco ? 'text-[#D6B25E]' : 'text-emerald-400'
              : row.type === 'total' ? isDeco ? 'text-[#D6B25E]' : 'text-violet-300'
              : row.isEmployer ? 'text-orange-300/70' : 'text-white/60'}>
              {row.label}
            </span>
            <div className="flex items-center gap-1.5">
              {(row as any).rateInfo && (
                <span className="text-white/30 text-xs bg-white/5 px-1.5 py-0.5 rounded-full">
                  {(row as any).rateInfo}
                </span>
              )}
              <span className={row.type === 'net' ? isDeco ? 'text-[#D6B25E]' : 'text-emerald-400'
                : row.amount < 0 ? 'text-red-400' : row.isEmployer ? 'text-orange-300/70' : 'text-white/80'}>
                {fmt(Math.abs(row.amount))}
              </span>
            </div>
          </div>
        ))}
        <p className="text-white/30 text-xs pt-1 border-t border-white/10">
          ⚠️ {t('Estimation — vérifier avec un comptable', 'Estimate — verify with accountant')}
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 pt-4 px-4 relative">
      {isDeco && <DecoBackground />}
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-5">
          {isDeco ? <DecoTitle>⚙️ {t('Réglages', 'Settings')}</DecoTitle>
            : <h1 className={`text-2xl font-black tracking-tight
                ${isXP||isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'
                  : isAventure ? 'text-emerald-300' : isZen ? 'text-pink-300' : isLudique ? 'text-orange-300' : 'text-white'}`}>
                ⚙️ {t('Réglages', 'Settings')}
              </h1>}
          <p className="text-white/40 text-xs mt-1">Hailite Xteriors</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                ${activeTab === i
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ═══ TAB 0 — COMPAGNIE ════════════════════════════════════════════ */}
        {activeTab === 0 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🏢 {t('Informations compagnie', 'Company Information')}</div>

            {/* Logo */}
            <div className="flex items-center gap-4">
              {company.logoUrl
                ? <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl border border-white/20" />
                : <div className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl ${isDeco ? 'border-[#D6B25E]/30' : 'border-white/20'}`}>🏗️</div>}
              <div className="flex flex-col gap-2">
                <button onClick={() => logoRef.current?.click()} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white'}`}>📁 {t('Logo', 'Logo')}</button>
                {company.logoUrl && <button onClick={() => setCompany({ logoUrl: '' })} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">🗑️</button>}
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
                  <input className={inputClass} value={(company as any)[f.key] ?? ''} onChange={e => setCompany({ [f.key]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ═══ TAB 1 — EMPLOYÉS ════════════════════════════════════════════ */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Liste employés */}
            {employees.map(emp => (
              <div key={emp.id} className={card}>
                {isDeco && <DecoCorners />}
                {editingEmpId === emp.id ? (
                  <div className="space-y-3">
                    <div><label className={labelClass}>{t('Nom','Name')}</label>
                      <input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} /></div>
                    <div><label className={labelClass}>{t('Taux $/h','Rate $/h')}</label>
                      <input className={inputClass} type="number" value={editRate} onChange={e => setEditRate(e.target.value)} /></div>
                    <div>
                      <label className={labelClass}>{t('Type','Type')}</label>
                      <div className="flex gap-2">
                        {[{ val: 'contractor', icon: '📋', fr: 'Contracteur', en: 'Contractor' }, { val: 'salaried', icon: '💼', fr: 'Salarié', en: 'Salaried' }].map(o => (
                          <button key={o.val} onClick={() => setEditWorkerType(o.val as any)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                              ${editWorkerType === o.val ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                            {o.icon} {lang === 'fr' ? o.fr : o.en}
                          </button>
                        ))}
                      </div>
                    </div>
                    {editWorkerType === 'salaried' && (
                      <div className="space-y-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div><label className={labelClass}>{t('Pays','Country')}</label>
                          <select className={inputClass} value={editCountry} onChange={e => { setEditCountry(e.target.value as any); setEditProvince(e.target.value === 'CA' ? 'AB' : 'TX') }}>
                            <option value="CA">🇨🇦 Canada</option><option value="US">🇺🇸 USA</option>
                          </select></div>
                        <div><label className={labelClass}>{editCountry === 'CA' ? t('Province','Province') : t('État','State')}</label>
                          <ProvinceSelect country={editCountry} value={editProvince} onChange={setEditProvince} /></div>
                        <div><label className={labelClass}>{t('Fréquence','Frequency')}</label>
                          <select className={inputClass} value={editFrequency} onChange={e => setEditFrequency(e.target.value as PayFrequency)}>
                            {Object.entries(PAY_FREQUENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{lang === 'fr' ? v.fr : v.en}</option>)}
                          </select></div>
                        {editDeductions && <DeductionsCard result={editDeductions} />}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEmployee(emp.id)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>✅ {t('Sauvegarder','Save')}</button>
                      <button onClick={() => setEditingEmpId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">✕ {t('Annuler','Cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{emp.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${emp.role === 'admin' ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-white/60'}`}>
                          {emp.role === 'admin' ? '👑 Admin' : '👷 Emp.'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${emp.workerType === 'salaried' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                          {emp.workerType === 'salaried' ? '💼' : '📋'} {emp.workerType === 'salaried' ? t('Salarié','Salaried') : t('Contracteur','Contractor')}
                        </span>
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {emp.hourlyRate ? `$${emp.hourlyRate}/h` : '—'}
                        {emp.workerType === 'salaried' && emp.employeeProvince ? ` · ${emp.employeeProvince}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingEmpId(emp.id); setEditName(emp.name); setEditRate(String(emp.hourlyRate || '')); setEditWorkerType(emp.workerType ?? 'contractor'); setEditCountry(emp.employeeCountry ?? 'CA'); setEditProvince(emp.employeeProvince ?? 'AB'); setEditFrequency(emp.payFrequency ?? 'weekly') }}
                        className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">✏️</button>
                      {emp.role !== 'admin' && (
                        <button onClick={() => deleteEmployee(emp.id)} className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">🗑️</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Formulaire ajout */}
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>➕ {t('Ajouter un employé','Add Employee')}</div>

              <div><label className={labelClass}>{t('Nom complet *','Full Name *')}</label>
                <input className={inputClass} value={newName} onChange={e => { setNewName(e.target.value); setAddEmpError('') }} placeholder={t('Prénom Nom','First Last')} /></div>

              <div><label className={labelClass}>{t('PIN (4+ chiffres) *','PIN (4+ digits) *')}</label>
                <input className={inputClass} value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g,'').slice(0,8)); setAddEmpError('') }} type="password" placeholder="••••" maxLength={8} /></div>

              <div><label className={labelClass}>{t('Taux $/h','Rate $/h')}</label>
                <input className={inputClass} value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder="25" /></div>

              <div><label className={labelClass}>{t('Rôle','Role')}</label>
                <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                  <option value="employee">👷 {t('Employé','Employee')}</option>
                  <option value="admin">👑 Admin</option>
                </select></div>

              <div>
                <label className={labelClass}>{t('Type de travailleur','Worker Type')}</label>
                <div className="flex gap-2">
                  {[{ val: 'contractor', icon: '📋', fr: 'Contracteur', en: 'Contractor' }, { val: 'salaried', icon: '💼', fr: 'Salarié', en: 'Salaried' }].map(o => (
                    <button key={o.val} onClick={() => { setNewWorkerType(o.val as any); setAddEmpError('') }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all
                        ${newWorkerType === o.val ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : isQuantum ? 'bg-violet-600 text-white' : 'bg-white/20 text-white ring-1 ring-white/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {o.icon} {lang === 'fr' ? o.fr : o.en}
                    </button>
                  ))}
                </div>
              </div>

              {newWorkerType === 'salaried' && (
                <div className="space-y-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`text-xs font-bold ${isDeco ? 'text-[#D6B25E]/70' : 'text-white/50'}`}>💼 {t('Paramètres paie','Payroll Settings')}</div>
                  <div><label className={labelClass}>{t('Pays','Country')}</label>
                    <select className={inputClass} value={newCountry} onChange={e => { setNewCountry(e.target.value as any); setNewProvince(e.target.value === 'CA' ? 'AB' : 'TX') }}>
                      <option value="CA">🇨🇦 Canada</option><option value="US">🇺🇸 USA</option>
                    </select></div>
                  <div><label className={labelClass}>{newCountry === 'CA' ? t('Province','Province') : t('État','State')}</label>
                    <ProvinceSelect country={newCountry} value={newProvince} onChange={setNewProvince} /></div>
                  <div><label className={labelClass}>{t('Fréquence de paie','Pay Frequency')}</label>
                    <select className={inputClass} value={newFrequency} onChange={e => setNewFrequency(e.target.value as PayFrequency)}>
                      {Object.entries(PAY_FREQUENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{lang === 'fr' ? v.fr : v.en}</option>)}
                    </select></div>
                  {newDeductions && <DeductionsCard result={newDeductions} />}
                </div>
              )}

              {/* Erreur + succès */}
              {addEmpError && (
                <div className="rounded-xl p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold text-center">
                  {addEmpError}
                </div>
              )}
              {addEmpSuccess && (
                <div className="rounded-xl p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold text-center">
                  ✅ {t('Employé ajouté avec succès !', 'Employee added successfully!')}
                </div>
              )}

              <button onClick={handleAddEmployee} className={btnPrimary}>
                ✅ {t('Ajouter', 'Add')}
              </button>
            </div>

            {/* Reset PIN admin */}
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🔐 {t('Reset PIN Admin','Reset Admin PIN')}</div>
              {showResetPin ? (
                <div className="space-y-3">
                  <input className={inputClass} value={resetPinVal} onChange={e => setResetPinVal(e.target.value.replace(/\D/g,'').slice(0,8))} type="password" placeholder={t('Nouveau PIN (4+ chiffres)','New PIN (4+ digits)')} />
                  <div className="flex gap-2">
                    <button onClick={() => { const admin = employees.find(e => e.role === 'admin'); if (admin && resetPinVal.length >= 4) { updateEmployee(admin.id, { pin: resetPinVal }); setShowResetPin(false); setResetPinVal('') } }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>✅ {t('Confirmer','Confirm')}</button>
                    <button onClick={() => setShowResetPin(false)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">✕ {t('Annuler','Cancel')}</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowResetPin(true)} className="w-full py-3 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  🔐 {t('Réinitialiser PIN Admin','Reset Admin PIN')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 2 — CLIENTS ════════════════════════════════════════════ */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {/* Liste clients */}
            {clients.length === 0 && !showAddClient && (
              <div className={`${card} text-center py-8`}>
                <p className="text-white/40 text-sm mb-3">👥 {t('Aucun client encore', 'No clients yet')}</p>
              </div>
            )}
            {clients.map(cl => (
              <div key={cl.id} className={card}>
                {isDeco && <DecoCorners />}
                {editingClientId === cl.id ? (
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: t('Nom *','Name *'), placeholder: 'Jean Tremblay' },
                      { key: 'phone', label: t('Téléphone','Phone'), placeholder: '403-555-1234' },
                      { key: 'email', label: t('Courriel','Email'), placeholder: 'client@email.com' },
                      { key: 'address', label: t('Adresse','Address'), placeholder: '123 Main St' },
                      { key: 'city', label: t('Ville','City'), placeholder: 'Calgary' },
                      { key: 'province', label: t('Province','Province'), placeholder: 'AB' },
                      { key: 'postalCode', label: t('Code postal','Postal Code'), placeholder: 'T2X 1A1' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className={labelClass}>{f.label}</label>
                        <input className={inputClass} value={(clientForm as any)[f.key]} onChange={e => setClientForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={handleAddClient} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>✅ {t('Sauvegarder','Save')}</button>
                      <button onClick={() => { setEditingClientId(null); setClientForm({ name: '', phone: '', email: '', address: '', city: '', province: 'AB', postalCode: '', notes: '' }) }} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{cl.name}</p>
                      <p className="text-white/50 text-xs">{cl.phone} {cl.city ? `· ${cl.city}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingClientId(cl.id); setClientForm({ name: cl.name, phone: cl.phone, email: cl.email, address: cl.address, city: cl.city, province: cl.province, postalCode: cl.postalCode, notes: cl.notes }) }}
                        className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">✏️</button>
                      <button onClick={() => deleteClient(cl.id)} className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Formulaire ajout client */}
            {showAddClient ? (
              <div className={card}>
                {isDeco && <DecoCorners />}
                <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>➕ {t('Nouveau client','New Client')}</div>
                {[
                  { key: 'name', label: t('Nom *','Name *'), placeholder: 'Jean Tremblay' },
                  { key: 'phone', label: t('Téléphone','Phone'), placeholder: '403-555-1234' },
                  { key: 'email', label: t('Courriel','Email'), placeholder: 'client@email.com' },
                  { key: 'address', label: t('Adresse','Address'), placeholder: '123 Main St' },
                  { key: 'city', label: t('Ville','City'), placeholder: 'Calgary' },
                  { key: 'province', label: t('Province','Province'), placeholder: 'AB' },
                  { key: 'postalCode', label: t('Code postal','Postal Code'), placeholder: 'T2X 1A1' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input className={inputClass} value={(clientForm as any)[f.key]} onChange={e => { setClientForm(prev => ({ ...prev, [f.key]: e.target.value })); setClientError('') }} placeholder={f.placeholder} />
                  </div>
                ))}
                {clientError && <div className="rounded-xl p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold text-center">{clientError}</div>}
                <div className="flex gap-2">
                  <button onClick={handleAddClient} className={`flex-1 ${btnPrimary}`}>✅ {t('Ajouter','Add')}</button>
                  <button onClick={() => { setShowAddClient(false); setClientError('') }} className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/10 text-white">✕ {t('Annuler','Cancel')}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddClient(true)} className={btnPrimary}>➕ {t('Ajouter un client','Add Client')}</button>
            )}

            <button onClick={() => router.push('/clients')} className={`w-full py-3 rounded-xl text-sm font-bold border transition-all
              ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/70 hover:bg-[#D6B25E]/10' : 'border-white/20 text-white/50 hover:bg-white/10'}`}>
              📋 {t('Voir page Clients complète →', 'View full Clients page →')}
            </button>
          </div>
        )}

        {/* ═══ TAB 3 — CATALOGUE ════════════════════════════════════════════ */}
        {activeTab === 3 && (
          <div className="space-y-4">
            {/* Filtre catégorie */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button onClick={() => setCatFilter('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${catFilter === 'all' ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                {t('Tout','All')}
              </button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCatFilter(c.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                    ${catFilter === c.id ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>
                  {c.emoji} {lang === 'fr' ? c.labelFR : c.labelEN}
                </button>
              ))}
            </div>

            {/* Liste matériaux */}
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                📦 {t('Matériaux','Materials')} ({materials.filter(m => catFilter === 'all' || m.category === catFilter).length})
              </div>
              <div className="space-y-2">
                {materials
                  .filter(m => catFilter === 'all' || m.category === catFilter)
                  .map(m => (
                    <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
                      <div>
                        <p className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{m.emoji ?? ''} {m.name}</p>
                        <div className="flex gap-2 text-xs text-white/40 mt-0.5">
                          {m.prixFournisseur && <span>🏭 {fmt(m.prixFournisseur)}</span>}
                          {m.prixClient && <span>🏷️ {fmt(m.prixClient)}</span>}
                          {m.prixEmploye && <span>👷 {fmt(m.prixEmploye)}</span>}
                          {m.unit && <span>/{m.unit}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteMaterial(m.id)} className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xs flex-shrink-0">🗑️</button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Formulaire ajout matériau */}
            {showAddMat ? (
              <div className={card}>
                {isDeco && <DecoCorners />}
                <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>➕ {t('Nouveau matériau','New Material')}</div>
                <div>
                  <label className={labelClass}>{t('Nom *','Name *')}</label>
                  <input className={inputClass} value={matForm.name} onChange={e => { setMatForm(p => ({ ...p, name: e.target.value })); setMatError('') }} placeholder={t('Bardeau asphalte...','Asphalt shingle...')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>{t('Emoji','Emoji')}</label>
                    <input className={inputClass} value={matForm.emoji} onChange={e => setMatForm(p => ({ ...p, emoji: e.target.value }))} placeholder="🏠" maxLength={2} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('Unité','Unit')}</label>
                    <select className={inputClass} value={matForm.unit} onChange={e => setMatForm(p => ({ ...p, unit: e.target.value as Unit }))}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('Catégorie','Category')}</label>
                  <select className={inputClass} value={matForm.category} onChange={e => setMatForm(p => ({ ...p, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {lang === 'fr' ? c.labelFR : c.labelEN}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'prixFournisseur', label: '🏭 ' + t('Fournisseur','Supplier') },
                    { key: 'prixClient', label: '🏷️ ' + t('Client','Client') },
                    { key: 'prixEmploye', label: '👷 ' + t('Employé','Employee') },
                  ].map(f => (
                    <div key={f.key}>
                      <label className={labelClass}>{f.label}</label>
                      <input className={inputClass} type="number" value={(matForm as any)[f.key]} onChange={e => setMatForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder="0.00" />
                    </div>
                  ))}
                </div>
                {matError && <div className="rounded-xl p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold text-center">{matError}</div>}
                <div className="flex gap-2">
                  <button onClick={handleAddMaterial} className={`flex-1 ${btnPrimary}`}>✅ {t('Ajouter','Add')}</button>
                  <button onClick={() => { setShowAddMat(false); setMatError('') }} className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/10 text-white">✕</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddMat(true)} className={btnPrimary}>➕ {t('Ajouter un matériau','Add Material')}</button>
            )}

            <button onClick={() => router.push('/catalogue')} className={`w-full py-3 rounded-xl text-sm font-bold border transition-all
              ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/70 hover:bg-[#D6B25E]/10' : 'border-white/20 text-white/50 hover:bg-white/10'}`}>
              📦 {t('Voir catalogue complet →','View full catalogue →')}
            </button>
          </div>
        )}

        {/* ═══ TAB 4 — COMPTABILITÉ ════════════════════════════════════════ */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📊 {t('Comptabilité','Accounting')}</div>
              <p className="text-white/50 text-sm">{t('Accédez à la page Comptabilité pour voir revenus, dépenses et marge brute.','Access the Accounting page to view revenues, expenses and gross margin.')}</p>
              <button onClick={() => router.push('/accounting')} className={btnPrimary}>
                📊 {t('Ouvrir la Comptabilité','Open Accounting')}
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB 5 — THÈME ════════════════════════════════════════════════ */}
        {activeTab === 5 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🎨 {t('Choisir un thème','Choose a Theme')}</div>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id as any)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold text-sm transition-all bg-gradient-to-br ${th.colors} text-white
                    ${themeId === th.id ? 'ring-2 ring-white/60 scale-105 shadow-xl' : 'opacity-80 hover:opacity-100'}`}>
                  <span className="text-2xl">{th.label.split(' ')[0]}</span>
                  <span>{th.label.split(' ').slice(1).join(' ')}</span>
                  {themeId === th.id && <span className="text-xs">✅ {t('Actif','Active')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 6 — LANGUE ════════════════════════════════════════════════ */}
        {activeTab === 6 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🌐 {t('Langue / Language','Language / Langue')}</div>
            <div className="grid grid-cols-2 gap-4">
              {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'en', flag: '🇺🇸', label: 'English' }].map(l => (
                <button key={l.code} onClick={() => setLang(l.code as any)}
                  className={`p-5 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all
                    ${lang === l.code ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] scale-105' : isQuantum ? 'bg-violet-600 text-white scale-105' : 'bg-white/20 text-white scale-105' : 'bg-white/5 text-white/60'}`}>
                  <span className="text-4xl">{l.flag}</span>
                  <span className="text-sm">{l.label}</span>
                  {lang === l.code && <span className="text-xs">✅ {t('Actif','Active')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 7 — PAIEMENT ════════════════════════════════════════════ */}
        {activeTab === 7 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-2 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>💳 {t('Informations de paiement','Payment Information')}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('Virement e-Transfer','E-Transfer Email'), key: 'etransferEmail', placeholder: 'paiement@hailite.ca', span: 2 },
                { label: t('Banque','Bank'), key: 'bankName', placeholder: 'TD Bank', span: 2 },
                { label: t('Transit','Transit'), key: 'bankTransit', placeholder: '00000', span: 1 },
                { label: t('Institution','Institution'), key: 'bankInstitution', placeholder: '004', span: 1 },
                { label: t('N° compte','Account #'), key: 'bankAccount', placeholder: '1234567', span: 2 },
              ].map(f => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className={labelClass}>{f.label}</label>
                  <input className={inputClass} value={(company as any)[f.key] ?? ''} onChange={e => setCompany({ [f.key]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 8 — RAPPELS ════════════════════════════════════════════════ */}
        {activeTab === 8 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🔔 {t('Rappels vocaux Punch Out','Voice Punch Out Reminders')}</div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`font-semibold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('Rappels activés','Reminders Enabled')}</div>
                <div className="text-white/40 text-xs">{t('4h → 8h → 9h → toutes les 15 min','4h → 8h → 9h → every 15 min')}</div>
              </div>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${voiceEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${voiceEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            {voiceEnabled && (
              <>
                <div className="space-y-2 mb-4">
                  <label className={labelClass}>{t('Volume','Volume')} : {Math.round(voiceVolume * 100)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-violet-500" />
                </div>
                <button onClick={() => { const u = new SpeechSynthesisUtterance(lang === 'fr' ? 'Test rappel vocal — Pense à pointer ta sortie!' : "Voice reminder test — Don't forget to punch out!"); u.volume = voiceVolume; u.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'; speechSynthesis.speak(u) }}
                  className={`w-full py-3 rounded-xl text-sm font-bold ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : isQuantum ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white'}`}>
                  🔊 {t('Tester','Test')}
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══ TAB 9 — CONDITIONS ════════════════════════════════════════════ */}
        {activeTab === 9 && (
          <div className={card}>
            {isDeco && <DecoCorners />}
            <div className={`text-sm font-bold mb-3 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📋 {t('Conditions par défaut','Default Terms')}</div>
            <div>
              <label className={labelClass}>{t('Délai de paiement','Payment Terms')}</label>
              <select className={inputClass} value={company.defaultPaymentTerms ?? 'Net 30'} onChange={e => setCompany({ defaultPaymentTerms: e.target.value })}>
                <option value="Due on receipt">{t('Dû à réception','Due on Receipt')}</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('Notes par défaut','Default Notes')}</label>
              <textarea className={`${inputClass} min-h-[90px] resize-none`} value={company.defaultNotes ?? ''} onChange={e => setCompany({ defaultNotes: e.target.value })} placeholder={t('Merci pour votre confiance!','Thank you for your business!')} />
            </div>
          </div>
        )}

        {/* ═══ TAB 10 — AVANCÉ ════════════════════════════════════════════════ */}
        {activeTab === 10 && (
          <div className="space-y-4">
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>🗑️ {t('Vider le cache local','Clear Local Cache')}</div>
              <div className="text-white/40 text-xs">{t('Efface toutes les données. Action irréversible.','Clears all data. Cannot be undone.')}</div>
              <button onClick={() => { if (confirm(t('Êtes-vous certain?','Are you sure?'))) { localStorage.clear(); window.location.reload() } }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                🗑️ {t('Vider le cache','Clear Cache')}
              </button>
            </div>
            <div className={card}>
              {isDeco && <DecoCorners />}
              <div className={`text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📱 PWA</div>
              <div className="text-white/40 text-xs">{t('Navigateur → Partager → Ajouter à l\'écran d\'accueil','Browser → Share → Add to Home Screen')}</div>
            </div>
            <div className={`${card} text-center`}>
              <div className="text-white/20 text-xs">Gestion Chantier Pro — Hailite Xteriors<br />v2.0 · Alberta GST 5% · 2026</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
