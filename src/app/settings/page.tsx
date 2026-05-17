'use client'

import { useState, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import {
  DecoSeparator, DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow, DecoFlower, DecoStarRow,
} from '@/components/DecoElements'

const THEMES = [
  { id: 'quantum',  label: '⚡ Quantum',  colors: 'from-violet-600 to-cyan-500' },
  { id: 'xp',       label: '🟣 XP',       colors: 'from-purple-600 to-cyan-400' },
  { id: 'aventure', label: '🌿 Aventure', colors: 'from-emerald-600 to-lime-400' },
  { id: 'deco',     label: '✨ Deco',     colors: 'from-yellow-600 to-amber-400' },
  { id: 'zen',      label: '🌸 Zen',      colors: 'from-pink-400 to-rose-300' },
  { id: 'ludique',  label: '🎮 Ludique',  colors: 'from-orange-500 to-pink-500' },
]

const TABS_FR = ['🏢 Compagnie', '👤 Employés', '🎨 Thème', '🌐 Langue', '💳 Paiement', '🔔 Rappels', '📋 Conditions', '⚙️ Avancé']
const TABS_EN = ['🏢 Company',   '👤 Employees', '🎨 Theme', '🌐 Language', '💳 Payment', '🔔 Reminders', '📋 Terms',  '⚙️ Advanced']

export default function SettingsPage() {
  const { lang, setLang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const { themeId, setTheme } = useThemeStore()
  const isXP       = themeId === 'xp'
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const isZen      = themeId === 'zen'
  const isLudique  = themeId === 'ludique'

  const cardClass = isDeco
    ? 'deco-card-sweep'
    : isQuantum
    ? 'quantum-card-glow'
    : isAventure
    ? 'aventure-card-glow'
    : ''

  // ✅ FIX: deleteEmployee (pas deleteEmployee), pas de resetAdminPin
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { company, setCompany } = useCompanyStore()
  const { enabled: voiceEnabled, volume: voiceVolume, setEnabled: setVoiceEnabled, setVolume: setVoiceVolume } = useVoiceReminderStore()

  const TABS = lang === 'fr' ? TABS_FR : TABS_EN
  const [activeTab, setActiveTab] = useState(0)

  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'employee'>('employee')
  const [newRate, setNewRate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [editName, setEditName] = useState('')
  const [showResetPin, setShowResetPin] = useState(false)
  const [resetPinVal, setResetPinVal] = useState('')

  const logoRef = useRef<HTMLInputElement>(null)

  const handleAddEmployee = () => {
    if (!newName.trim() || newPin.length < 4) return
    addEmployee({
      name: newName.trim(),
      pin: newPin,
      role: newRole,
      hourlyRate: parseFloat(newRate) || 0,
      workMode: 'hourly',
      color: '#a855f7',
      active: true,
      invoiceSequence: 1,
    })
    setNewName(''); setNewPin(''); setNewRate(''); setNewRole('employee')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCompany({ logoUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco
      ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum
      ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'
    }`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const sectionTitle = (title: string) => (
    <div className="flex items-center gap-3 mb-4">
      {isDeco && <DecoOrnament />}
      <h3 className={`text-base font-bold uppercase tracking-wider
        ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>
        {title}
      </h3>
      {isDeco && <DecoOrnament />}
    </div>
  )

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 relative" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {isDeco && <DecoBackground />}

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          {isDeco ? (
            <DecoTitle>{t('Réglages', 'Settings')}</DecoTitle>
          ) : (
            <h1 className={`text-2xl font-black tracking-tight
              ${isXP ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400'
                : isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400'
                : isAventure ? 'text-emerald-300'
                : isZen ? 'text-pink-300'
                : isLudique ? 'text-orange-300'
                : 'text-white'}`}>
              ⚙️ {t('Réglages', 'Settings')}
            </h1>
          )}
          <p className="text-white/50 text-sm mt-1">Hailite Xteriors</p>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                ${activeTab === i
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] shadow-lg shadow-[#D6B25E]/30'
                    : isQuantum ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ─── TAB 0 : COMPAGNIE ─── */}
        {activeTab === 0 && (
          <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('Informations compagnie', 'Company Information'))}
            <div>
              <label className={labelClass}>{t('Logo compagnie', 'Company Logo')}</label>
              <div className="flex items-center gap-4">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-white/20" />
                ) : (
                  <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl
                    ${isDeco ? 'border-[#D6B25E]/30' : 'border-white/20'}`}>🏗️</div>
                )}
                <div className="flex flex-col gap-2">
                  <button onClick={() => logoRef.current?.click()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                      ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E] hover:bg-[#D6B25E]/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {t('📁 Choisir image', '📁 Choose image')}
                  </button>
                  {company.logoUrl && (
                    <button onClick={() => setCompany({ logoUrl: '' })}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      {t('🗑️ Supprimer', '🗑️ Remove')}
                    </button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>{t('Nom compagnie', 'Company Name')}</label>
                <input className={inputClass} value={company.name} onChange={e => setCompany({ name: e.target.value })} placeholder="Hailite Xteriors" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t('Nom propriétaire', "Owner's Name")}</label>
                <input className={inputClass} value={company.ownerName} onChange={e => setCompany({ ownerName: e.target.value })} placeholder="Patrick Bisaillon" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t('Adresse', 'Address')}</label>
                <input className={inputClass} value={company.address} onChange={e => setCompany({ address: e.target.value })} placeholder="123 Main St" />
              </div>
              <div>
                <label className={labelClass}>{t('Ville', 'City')}</label>
                <input className={inputClass} value={company.city} onChange={e => setCompany({ city: e.target.value })} placeholder="Calgary" />
              </div>
              <div>
                <label className={labelClass}>{t('Province', 'Province')}</label>
                <input className={inputClass} value={company.province} onChange={e => setCompany({ province: e.target.value })} placeholder="AB" />
              </div>
              <div>
                <label className={labelClass}>{t('Code postal', 'Postal Code')}</label>
                <input className={inputClass} value={company.postalCode} onChange={e => setCompany({ postalCode: e.target.value })} placeholder="T2X 1A1" />
              </div>
              <div>
                <label className={labelClass}>{t('Pays', 'Country')}</label>
                <select className={inputClass} value={company.country} onChange={e => setCompany({ country: e.target.value })}>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="US">🇺🇸 États-Unis / USA</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
                <input className={inputClass} value={company.phone} onChange={e => setCompany({ phone: e.target.value })} placeholder="403-555-1234" />
              </div>
              <div>
                <label className={labelClass}>{t('Courriel', 'Email')}</label>
                <input className={inputClass} value={company.email} onChange={e => setCompany({ email: e.target.value })} placeholder="info@hailite.ca" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t('Site web', 'Website')}</label>
                <input className={inputClass} value={company.website} onChange={e => setCompany({ website: e.target.value })} placeholder="www.hailite.ca" />
              </div>
              <div>
                <label className={labelClass}>{t('N° TPS/GST', 'GST Number')}</label>
                <input className={inputClass} value={company.gstNumber} onChange={e => setCompany({ gstNumber: e.target.value })} placeholder="123456789 RT0001" />
              </div>
              <div>
                <label className={labelClass}>{t('N° WCB', 'WCB Number')}</label>
                <input className={inputClass} value={company.wcbNumber} onChange={e => setCompany({ wcbNumber: e.target.value })} placeholder="WCB-XXXXXX" />
              </div>
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 1 : EMPLOYÉS ─── */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {employees.map(emp => (
              <div key={emp.id} className={`rounded-2xl p-4 ${cardClass}
                ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                  : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                  : 'bg-white/5 border border-white/10'}`}>
                {isDeco && <DecoCorners />}
                {editingId === emp.id ? (
                  <div className="space-y-3">
                    <input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} placeholder={t('Nom', 'Name')} />
                    <input className={inputClass} value={editRate} onChange={e => setEditRate(e.target.value)} type="number" placeholder={t('Taux horaire', 'Hourly Rate')} />
                    <div className="flex gap-2">
                      <button onClick={() => {
                        updateEmployee(emp.id, { name: editName, hourlyRate: parseFloat(editRate) || 0 })
                        setEditingId(null)
                      }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>
                        ✅ {t('Sauvegarder', 'Save')}
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">
                        ✕ {t('Annuler', 'Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                        {emp.name}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full
                          ${emp.role === 'admin'
                            ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-white/10 text-white/60'}`}>
                          {emp.role === 'admin' ? '👑 Admin' : '👷 Employé'}
                        </span>
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {emp.hourlyRate ? `$${emp.hourlyRate}/h` : t('Taux non défini', 'Rate not set')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(emp.id); setEditName(emp.name); setEditRate(String(emp.hourlyRate || '')) }}
                        className="w-8 h-8 rounded-xl bg-white/10 text-white text-sm flex items-center justify-center">✏️</button>
                      {emp.role !== 'admin' && (
                        // ✅ FIX: deleteEmployee
                        <button onClick={() => deleteEmployee(emp.id)}
                          className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 text-sm flex items-center justify-center">🗑️</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className={`rounded-2xl p-5 space-y-3 ${cardClass}
              ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                : 'bg-white/5 border border-white/10'}`}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('➕ Ajouter employé', '➕ Add Employee'))}
              <input className={inputClass} value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('Prénom Nom', 'First Last')} />
              <input className={inputClass} value={newPin} onChange={e => setNewPin(e.target.value)} type="password" placeholder={t('PIN (4+ chiffres)', 'PIN (4+ digits)')} />
              <input className={inputClass} value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder={t('Taux horaire $/h', 'Hourly Rate $/h')} />
              <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'employee')}>
                <option value="employee">👷 {t('Employé', 'Employee')}</option>
                <option value="admin">👑 Admin</option>
              </select>
              <button onClick={handleAddEmployee}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                  ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00] shadow-lg shadow-[#D6B25E]/20'
                    : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'}`}>
                {t('✅ Ajouter', '✅ Add')}
              </button>
            </div>

            {/* ✅ FIX: Reset PIN via updateEmployee */}
            <div className={`rounded-2xl p-5 space-y-3 ${cardClass}
              ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
                : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
                : 'bg-white/5 border border-white/10'}`}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('🔐 Reset PIN Admin', '🔐 Reset Admin PIN'))}
              {showResetPin ? (
                <div className="space-y-3">
                  <input className={inputClass} value={resetPinVal} onChange={e => setResetPinVal(e.target.value)}
                    type="password" placeholder={t('Nouveau PIN admin', 'New admin PIN')} />
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const admin = employees.find(e => e.role === 'admin')
                      if (admin && resetPinVal.length >= 4) {
                        updateEmployee(admin.id, { pin: resetPinVal })
                        setShowResetPin(false); setResetPinVal('')
                      }
                    }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>
                      ✅ {t('Confirmer', 'Confirm')}
                    </button>
                    <button onClick={() => setShowResetPin(false)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">
                      ✕ {t('Annuler', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowResetPin(true)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                  🔐 {t('Réinitialiser PIN', 'Reset PIN')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2 : THÈME ─── */}
        {activeTab === 2 && (
          <div className={`rounded-2xl p-5 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🎨 Choisir un thème', '🎨 Choose a Theme'))}
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id as any)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold text-sm transition-all
                    ${themeId === th.id ? 'ring-2 ring-white/60 scale-105 shadow-xl' : 'hover:scale-102 opacity-80'}
                    bg-gradient-to-br ${th.colors} text-white`}>
                  <span className="text-2xl">{th.label.split(' ')[0]}</span>
                  <span>{th.label.split(' ').slice(1).join(' ')}</span>
                  {themeId === th.id && <span className="text-xs">✅ {t('Actif', 'Active')}</span>}
                </button>
              ))}
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 3 : LANGUE ─── */}
        {activeTab === 3 && (
          <div className={`rounded-2xl p-5 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🌐 Langue / Language', '🌐 Language / Langue'))}
            <div className="grid grid-cols-2 gap-4">
              {[
                { code: 'fr', flag: '🇫🇷', label: 'Français' },
                { code: 'en', flag: '🇺🇸', label: 'English' },
              ].map(l => (
                <button key={l.code} onClick={() => setLang(l.code as 'fr' | 'en')}
                  className={`p-5 rounded-2xl flex flex-col items-center gap-2 font-bold text-lg transition-all
                    ${lang === l.code
                      ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] ring-2 ring-[#D6B25E]/50 scale-105'
                        : isQuantum ? 'bg-violet-600 text-white ring-2 ring-violet-400/50 scale-105'
                        : 'bg-white/20 text-white ring-2 ring-white/30 scale-105'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                  <span className="text-4xl">{l.flag}</span>
                  <span className="text-sm">{l.label}</span>
                  {lang === l.code && <span className="text-xs">✅ {t('Actif', 'Active')}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4 : PAIEMENT ─── */}
        {activeTab === 4 && (
          <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('💳 Informations de paiement', '💳 Payment Information'))}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>{t('Courriel Virement (e-Transfer)', 'E-Transfer Email')}</label>
                <input className={inputClass} value={company.etransferEmail} onChange={e => setCompany({ etransferEmail: e.target.value })} placeholder="paiement@hailite.ca" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t('Nom de la banque', 'Bank Name')}</label>
                <input className={inputClass} value={company.bankName} onChange={e => setCompany({ bankName: e.target.value })} placeholder="TD Bank" />
              </div>
              <div>
                <label className={labelClass}>{t('Transit', 'Transit')}</label>
                <input className={inputClass} value={company.bankTransit} onChange={e => setCompany({ bankTransit: e.target.value })} placeholder="00000" />
              </div>
              <div>
                <label className={labelClass}>{t('Institution', 'Institution')}</label>
                <input className={inputClass} value={company.bankInstitution} onChange={e => setCompany({ bankInstitution: e.target.value })} placeholder="004" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>{t('N° de compte', 'Account Number')}</label>
                <input className={inputClass} value={company.bankAccount} onChange={e => setCompany({ bankAccount: e.target.value })} placeholder="1234567" />
              </div>
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 5 : RAPPELS VOCAUX ─── */}
        {activeTab === 5 && (
          <div className={`rounded-2xl p-5 space-y-5 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🔔 Rappels vocaux Punch Out', '🔔 Voice Punch Out Reminders'))}
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-semibold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                  {t('Rappels activés', 'Reminders Enabled')}
                </div>
                <div className="text-white/40 text-xs mt-0.5">
                  {t('Rappels vocaux progressifs', 'Progressive voice reminders')}
                </div>
              </div>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300
                  ${voiceEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${voiceEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            {voiceEnabled && (
              <div className="space-y-2">
                <label className={labelClass}>{t('Volume', 'Volume')} : {Math.round(voiceVolume * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={voiceVolume}
                  onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-violet-500" />
                <div className="text-white/40 text-xs">
                  {t('Rappels à 4h, 8h, 9h, puis toutes les 15 min à 10h+', 'Reminders at 4h, 8h, 9h, then every 15 min at 10h+')}
                </div>
              </div>
            )}
            {voiceEnabled && (
              <button onClick={() => {
                const utterance = new SpeechSynthesisUtterance(
                  lang === 'fr' ? 'Test de rappel vocal — Pense à pointer ta sortie!' : "Voice reminder test — Don't forget to punch out!"
                )
                utterance.volume = voiceVolume
                utterance.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'
                speechSynthesis.speak(utterance)
              }} className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E] hover:bg-[#D6B25E]/30'
                  : isQuantum ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'}`}>
                🔊 {t('Tester le rappel vocal', 'Test Voice Reminder')}
              </button>
            )}
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 6 : CONDITIONS ─── */}
        {activeTab === 6 && (
          <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('📋 Conditions par défaut', '📋 Default Terms'))}
            <div>
              <label className={labelClass}>{t('Délai de paiement', 'Payment Terms')}</label>
              <select className={inputClass} value={company.defaultPaymentTerms} onChange={e => setCompany({ defaultPaymentTerms: e.target.value })}>
                <option value="Due on receipt">{t('Dû à réception', 'Due on Receipt')}</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('Notes par défaut sur documents', 'Default Notes on Documents')}</label>
              <textarea className={`${inputClass} min-h-[100px] resize-none`}
                value={company.defaultNotes} onChange={e => setCompany({ defaultNotes: e.target.value })}
                placeholder={t('Merci pour votre confiance. Intérêts de 2% par mois sur les comptes en souffrance.',
                  'Thank you for your business. 2% monthly interest on overdue accounts.')} />
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 7 : AVANCÉ ─── */}
        {activeTab === 7 && (
          <div className={`rounded-2xl p-5 space-y-4 ${cardClass}
            ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20'
              : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20'
              : 'bg-white/5 border border-white/10'}`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('⚙️ Options avancées', '⚙️ Advanced Options'))}
            <div className={`p-4 rounded-xl ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
              <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                {t('🗑️ Vider le cache local', '🗑️ Clear Local Cache')}
              </div>
              <div className="text-white/50 text-xs mb-3">
                {t('Efface toutes les données enregistrées localement. Action irréversible.',
                  'Clears all locally stored data. This action cannot be undone.')}
              </div>
              <button onClick={() => {
                if (confirm(t('Êtes-vous certain? Toutes les données seront perdues.', 'Are you sure? All data will be lost.'))) {
                  localStorage.clear(); window.location.reload()
                }
              }} className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                🗑️ {t('Vider le cache', 'Clear Cache')}
              </button>
            </div>
            <div className={`p-4 rounded-xl ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
              <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📱 PWA</div>
              <div className="text-white/50 text-xs">
                {t("Pour installer l'app sur votre téléphone : Navigateur → Partager → Ajouter à l'écran d'accueil",
                  'To install the app on your phone: Browser → Share → Add to Home Screen')}
              </div>
            </div>
            <div className={`p-4 rounded-xl text-center ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
              <div className="text-white/30 text-xs">
                Gestion Chantier Pro — Hailite Xteriors<br />
                v2.0 • Alberta GST 5% • Made with ❤️
              </div>
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

      </div>
    </div>
  )
}
