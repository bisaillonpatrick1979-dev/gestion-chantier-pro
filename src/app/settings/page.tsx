'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import { useClientStore } from '@/store/useClientStore'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Category } from '@/store/useCatalogueStore'
import {
  DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow,
} from '@/components/DecoElements'

const THEMES = [
  { id: 'quantum',  label: '⚡ Quantum',  colors: 'from-violet-600 to-cyan-500' },
  { id: 'xp',       label: '🟣 XP',       colors: 'from-purple-600 to-cyan-400' },
  { id: 'aventure', label: '🌿 Aventure', colors: 'from-emerald-600 to-lime-400' },
  { id: 'deco',     label: '✨ Deco',     colors: 'from-yellow-600 to-amber-400' },
  { id: 'zen',      label: '🌸 Zen',      colors: 'from-pink-400 to-rose-300' },
  { id: 'ludique',  label: '🎮 Ludique',  colors: 'from-orange-500 to-pink-500' },
]

const TABS_FR = ['🏢 Compagnie','👤 Employés','🎨 Thème','🌐 Langue','💳 Paiement','🔔 Rappels','📋 Conditions','👥 Clients','📦 Catalogue','📊 Comptab.','⚙️ Avancé']
const TABS_EN = ['🏢 Company','👤 Employees','🎨 Theme','🌐 Language','💳 Payment','🔔 Reminders','📋 Terms','👥 Clients','📦 Catalog','📊 Accounting','⚙️ Advanced']

export default function SettingsPage() {
  const router = useRouter()
  const { lang, setLang } = useLangStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const { themeId, setTheme } = useThemeStore()
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const isXP       = themeId === 'xp'
  const isZen      = themeId === 'zen'
  const isLudique  = themeId === 'ludique'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { company, setCompany } = useCompanyStore()
  const { enabled: voiceEnabled, volume: voiceVolume, setEnabled: setVoiceEnabled, setVolume: setVoiceVolume } = useVoiceReminderStore()
  const { clients, addClient, deleteClient } = useClientStore()
  const { materials, deleteMaterial } = useCatalogueStore()

  const TABS = lang === 'fr' ? TABS_FR : TABS_EN
  const [activeTab, setActiveTab] = useState(0)

  // ── Formulaire nouvel employé ─────────────────────────────────────────────
  const [newName, setNewName]                     = useState('')
  const [newPin, setNewPin]                       = useState('')
  const [newRole, setNewRole]                     = useState<'admin' | 'employee'>('employee')
  const [newRate, setNewRate]                     = useState('')
  const [newWorkerType, setNewWorkerType]         = useState<'contractor' | 'salaried'>('contractor')
  const [newWorkMode, setNewWorkMode]             = useState<'heure' | 'forfait' | 'surface'>('surface')
  // Coordonnées — tous
  const [newPhone, setNewPhone]                   = useState('')
  const [newEmail, setNewEmail]                   = useState('')
  const [newAddress, setNewAddress]               = useState('')
  const [newCity, setNewCity]                     = useState('')
  const [newProvince, setNewProvince]             = useState('AB')
  const [newPostalCode, setNewPostalCode]         = useState('')
  // Urgence — tous
  const [newEmergencyContact, setNewEmergencyContact]   = useState('')
  const [newEmergencyPhone, setNewEmergencyPhone]       = useState('')
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('')
  // Salarié
  const [newPayProvince, setNewPayProvince]       = useState('AB')
  const [newPayFrequency, setNewPayFrequency]     = useState<'weekly' | 'biweekly' | 'semimonthly' | 'monthly'>('biweekly')
  const [newPayPeriodStart, setNewPayPeriodStart] = useState<'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'|'sunday'>('monday')
  const [newAnnualSalary, setNewAnnualSalary]     = useState('')
  // Contractor
  const [newBusinessName, setNewBusinessName]     = useState('')
  const [newGstNumber, setNewGstNumber]           = useState('')
  const [newSin, setNewSin]                       = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate]   = useState('')
  const [editName, setEditName]   = useState('')

  // Client form
  const [newClientName, setNewClientName]   = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientCity, setNewClientCity]   = useState('')

  const logoRef = useRef<HTMLInputElement>(null)

  // ── Label taux selon mode de travail ─────────────────────────────────────
  const getRateLabel = (mode: 'heure' | 'forfait' | 'surface') => {
    if (mode === 'surface') return t('Taux pi² ($/pi²)', 'Rate ($/sqft)')
    if (mode === 'forfait') return t('Montant forfait ($)', 'Flat Rate ($)')
    return t('Taux horaire ($/h)', 'Hourly Rate ($/h)')
  }

  const resetNewForm = () => {
    setNewName(''); setNewPin(''); setNewRate(''); setNewRole('employee')
    setNewWorkerType('contractor'); setNewWorkMode('surface')
    setNewPhone(''); setNewEmail(''); setNewAddress(''); setNewCity('')
    setNewProvince('AB'); setNewPostalCode('')
    setNewEmergencyContact(''); setNewEmergencyPhone(''); setNewEmergencyRelation('')
    setNewPayProvince('AB'); setNewPayFrequency('biweekly')
    setNewPayPeriodStart('monday'); setNewAnnualSalary('')
    setNewBusinessName(''); setNewGstNumber(''); setNewSin('')
  }

  const handleAddEmployee = () => {
    if (!newName.trim() || newPin.length < 4) return
    addEmployee({
      name: newName.trim(),
      pin: newPin,
      role: newRole,
      hourlyRate: parseFloat(newRate) || 0,
      workMode: newWorkerType === 'contractor' ? newWorkMode : 'heure',
      color: '#a855f7',
      active: true,
      workerType: newWorkerType,
      // Coordonnées
      phone:      newPhone.trim()      || undefined,
      email:      newEmail.trim()      || undefined,
      address:    newAddress.trim()    || undefined,
      city:       newCity.trim()       || undefined,
      province:   newProvince          || undefined,
      postalCode: newPostalCode.trim() || undefined,
      // Urgence
      emergencyContact:  newEmergencyContact.trim()  || undefined,
      emergencyPhone:    newEmergencyPhone.trim()    || undefined,
      emergencyRelation: newEmergencyRelation.trim() || undefined,
      // Salarié
      employeeProvince: newWorkerType === 'salaried' ? newPayProvince : undefined,
      payFrequency:     newWorkerType === 'salaried' ? newPayFrequency : undefined,
      payPeriodStart:   newWorkerType === 'salaried' ? newPayPeriodStart : undefined,
      annualSalary:     newWorkerType === 'salaried' && newAnnualSalary ? parseFloat(newAnnualSalary) : undefined,
      // Contractor
      businessName: newWorkerType === 'contractor' && newBusinessName.trim() ? newBusinessName.trim() : undefined,
      gstNumber:    newWorkerType === 'contractor' && newGstNumber.trim()    ? newGstNumber.trim()    : undefined,
      sin:          newWorkerType === 'contractor' && newSin.trim()          ? newSin.trim()          : undefined,
    })
    resetNewForm()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCompany({ logoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const handleAddClient = () => {
    if (!newClientName.trim()) return
    addClient({ name: newClientName.trim(), phone: newClientPhone, email: newClientEmail, city: newClientCity, address: '', province: 'AB', postalCode: '', notes: '' })
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewClientCity('')
  }

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all
    ${isDeco ? 'bg-[#1a1500]/80 border-[#D6B25E]/30 text-[#D6B25E] placeholder-[#D6B25E]/40 focus:border-[#D6B25E]'
      : isQuantum ? 'bg-[#0a0015]/80 border-violet-500/30 text-violet-100 placeholder-violet-400/40 focus:border-violet-400'
      : 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'}`

  const labelClass = `text-xs font-semibold uppercase tracking-widest mb-1 block
    ${isDeco ? 'text-[#D6B25E]/70' : isQuantum ? 'text-violet-400/70' : 'text-white/60'}`

  const cardStyle = `rounded-2xl p-5 ${cardClass} ${isDeco ? 'bg-[#0d0a00]/80 border border-[#D6B25E]/20' : isQuantum ? 'bg-[#0a0015]/80 border border-violet-500/20' : 'bg-white/5 border border-white/10'}`

  const sectionTitle = (title: string) => (
    <div className="flex items-center gap-3 mb-4">
      {isDeco && <DecoOrnament />}
      <h3 className={`text-base font-bold uppercase tracking-wider ${isDeco ? 'text-[#D6B25E]' : isQuantum ? 'text-violet-300' : 'text-white'}`}>{title}</h3>
      {isDeco && <DecoOrnament />}
    </div>
  )

  const subHeader = (label: string) => (
    <div className={`text-xs font-bold uppercase tracking-widest py-2 mt-2 border-t ${isDeco ? 'border-[#D6B25E]/15 text-[#D6B25E]/50' : 'border-white/10 text-white/30'}`}>
      {label}
    </div>
  )

  const ContactFields = ({
    phone, setPhone, email, setEmail,
    address, setAddress, city, setCity,
    prov, setProv, postalCode, setPostalCode,
    emergencyContact, setEmergencyContact,
    emergencyPhone, setEmergencyPhone,
    emergencyRelation, setEmergencyRelation,
  }: {
    phone: string; setPhone: (v: string) => void
    email: string; setEmail: (v: string) => void
    address: string; setAddress: (v: string) => void
    city: string; setCity: (v: string) => void
    prov: string; setProv: (v: string) => void
    postalCode: string; setPostalCode: (v: string) => void
    emergencyContact: string; setEmergencyContact: (v: string) => void
    emergencyPhone: string; setEmergencyPhone: (v: string) => void
    emergencyRelation: string; setEmergencyRelation: (v: string) => void
  }) => (
    <div className="space-y-3">
      {subHeader(`📞 ${t('Coordonnées', 'Contact Info')}`)}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
          <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="403-555-1234" inputMode="tel" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('Courriel', 'Email')}</label>
          <input className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="marc@exemple.ca" inputMode="email" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('Adresse civique', 'Street Address')}</label>
          <input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Rue Principale" />
        </div>
        <div>
          <label className={labelClass}>{t('Ville', 'City')}</label>
          <input className={inputClass} value={city} onChange={e => setCity(e.target.value)} placeholder="Calgary" />
        </div>
        <div>
          <label className={labelClass}>{t('Province', 'Province')}</label>
          <select className={inputClass} value={prov} onChange={e => setProv(e.target.value)}>
            {['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{t('Code postal', 'Postal Code')}</label>
          <input className={inputClass} value={postalCode} onChange={e => setPostalCode(e.target.value.toUpperCase())} placeholder="T2X 1A1" />
        </div>
      </div>
      {subHeader(`🚨 ${t('Contact d\'urgence', 'Emergency Contact')}`)}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelClass}>{t('Nom', 'Name')}</label>
          <input className={inputClass} value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder={t('Marie Tremblay', 'Marie Smith')} />
        </div>
        <div>
          <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
          <input className={inputClass} value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="403-555-9999" inputMode="tel" />
        </div>
        <div>
          <label className={labelClass}>{t('Lien', 'Relation')}</label>
          <input className={inputClass} value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} placeholder={t('Conjointe', 'Spouse')} />
        </div>
      </div>
    </div>
  )

  const CATEGORY_LABELS: Record<Category, string> = {
    toiture: '🏠 Toiture', siding: '🏡 Siding', fixations: '🔩 Fixations',
    etancheite: '💧 Étanchéité', structure: '🪵 Structure', maindoeuvre: '👷 Main-d\'œuvre',
  }

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 relative">
      {isDeco && <DecoBackground />}
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-6">
          {isDeco ? <DecoTitle>{t('Réglages', 'Settings')}</DecoTitle> : (
            <h1 className={`text-2xl font-black tracking-tight ${isXP ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400' : isQuantum ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400' : isAventure ? 'text-emerald-300' : isZen ? 'text-pink-300' : isLudique ? 'text-orange-300' : 'text-white'}`}>
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
                  ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] shadow-lg' : isQuantum ? 'bg-violet-600 text-white shadow-lg' : 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ─── TAB 0 : COMPAGNIE ─── */}
        {activeTab === 0 && (
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('Informations compagnie', 'Company Information'))}

            {/* Logo */}
            <div>
              <label className={labelClass}>{t('Logo compagnie', 'Company Logo')}</label>
              <div className="flex items-center gap-4">
                {company.logoUrl
                  ? <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-white/20" />
                  : <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl ${isDeco ? 'border-[#D6B25E]/30' : 'border-white/20'}`}>🏗️</div>
                }
                <div className="flex flex-col gap-2">
                  <button onClick={() => logoRef.current?.click()} className={`px-4 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white'}`}>
                    {t('📁 Choisir image', '📁 Choose image')}
                  </button>
                  {company.logoUrl && (
                    <button onClick={() => setCompany({ logoUrl: '' })} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">
                      {t('🗑️ Supprimer', '🗑️ Remove')}
                    </button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>

            {/* Infos de base */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="col-span-2"><label className={labelClass}>{t('Nom compagnie', 'Company Name')}</label><input className={inputClass} value={company.name} onChange={e => setCompany({ name: e.target.value })} placeholder="Hailite Xteriors" /></div>
              <div className="col-span-2"><label className={labelClass}>{t('Nom propriétaire', "Owner's Name")}</label><input className={inputClass} value={company.ownerName} onChange={e => setCompany({ ownerName: e.target.value })} placeholder="Patrick Bisaillon" /></div>
              <div className="col-span-2"><label className={labelClass}>{t('Adresse', 'Address')}</label><input className={inputClass} value={company.address} onChange={e => setCompany({ address: e.target.value })} placeholder="123 Main St" /></div>
              <div><label className={labelClass}>{t('Ville', 'City')}</label><input className={inputClass} value={company.city} onChange={e => setCompany({ city: e.target.value })} placeholder="Calgary" /></div>
              <div><label className={labelClass}>{t('Province', 'Province')}</label><input className={inputClass} value={company.province} onChange={e => setCompany({ province: e.target.value })} placeholder="AB" /></div>
              <div><label className={labelClass}>{t('Code postal', 'Postal Code')}</label><input className={inputClass} value={company.postalCode} onChange={e => setCompany({ postalCode: e.target.value })} placeholder="T2X 1A1" /></div>
              <div><label className={labelClass}>{t('Pays', 'Country')}</label>
                <select className={inputClass} value={company.country} onChange={e => setCompany({ country: e.target.value })}>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="US">🇺🇸 USA</option>
                </select>
              </div>
              <div><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} value={company.phone} onChange={e => setCompany({ phone: e.target.value })} placeholder="403-555-1234" /></div>
              <div><label className={labelClass}>{t('Courriel', 'Email')}</label><input className={inputClass} value={company.email} onChange={e => setCompany({ email: e.target.value })} placeholder="info@hailite.ca" /></div>
              <div className="col-span-2"><label className={labelClass}>{t('Site web', 'Website')}</label><input className={inputClass} value={company.website} onChange={e => setCompany({ website: e.target.value })} placeholder="www.hailite.ca" /></div>
              <div><label className={labelClass}>{t('N° TPS/GST', 'GST Number')}</label><input className={inputClass} value={company.gstNumber} onChange={e => setCompany({ gstNumber: e.target.value })} placeholder="123456789 RT0001" /></div>
              <div><label className={labelClass}>{t('N° WCB', 'WCB Number')}</label><input className={inputClass} value={company.wcbNumber} onChange={e => setCompany({ wcbNumber: e.target.value })} placeholder="WCB-XXXXXX" /></div>
            </div>

            {/* ══ PARAMÈTRES PAIE SALARIÉS ══ */}
            {subHeader(`💼 ${t('Paramètres paie salariés', 'Salaried Payroll Settings')}`)}
            <p className={`text-xs mb-3 ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/30'}`}>
              {t('Ces montants s\'appliquent automatiquement à tous les talons de paie.', 'These amounts apply automatically to all pay stubs.')}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Vacances */}
              <div className="col-span-2">
                <label className={labelClass}>🏖️ {t('% Vacances', 'Vacation %')}
                  <span className={`ml-1 text-xs normal-case font-normal ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>
                    ({t('min. 6% construction AB', 'min. 6% AB construction')})
                  </span>
                </label>
                <input className={inputClass} type="number" min="0" max="20" step="0.5"
                  value={company.payrollVacationRate}
                  onChange={e => setCompany({ payrollVacationRate: parseFloat(e.target.value) || 0 })}
                  placeholder="6" />
              </div>

              {/* Assurances */}
              <div>
                <label className={labelClass}>🏥 {t('Assurance santé', 'Health Ins.')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollHealthInsurance || ''}
                  onChange={e => setCompany({ payrollHealthInsurance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>🦷 {t('Assurance dentaire', 'Dental Ins.')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollDentalInsurance || ''}
                  onChange={e => setCompany({ payrollDentalInsurance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>💛 {t('Assurance vie', 'Life Ins.')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollLifeInsurance || ''}
                  onChange={e => setCompany({ payrollLifeInsurance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>♿ {t('Invalidité LT', 'LTD')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollLTD || ''}
                  onChange={e => setCompany({ payrollLTD: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>

              {/* REER */}
              <div>
                <label className={labelClass}>💰 REER {t('collectif', 'Group')} % {t('du brut', 'of gross')}</label>
                <input className={inputClass} type="number" min="0" max="18" step="0.1"
                  value={company.payrollRRSP || ''}
                  onChange={e => setCompany({ payrollRRSP: parseFloat(e.target.value) || 0 })}
                  placeholder="0" />
              </div>

              {/* PAE */}
              <div>
                <label className={labelClass}>🧠 PAE $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollEAP || ''}
                  onChange={e => setCompany({ payrollEAP: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>

              {/* Custom 1 */}
              <div>
                <label className={labelClass}>➕ {t('Déduction custom 1 — Nom', 'Custom Deduction 1 — Name')}</label>
                <input className={inputClass}
                  value={company.payrollCustom1Name}
                  onChange={e => setCompany({ payrollCustom1Name: e.target.value })}
                  placeholder={t('Ex: Stationnement', 'Ex: Parking')} />
              </div>
              <div>
                <label className={labelClass}>{t('Montant', 'Amount')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollCustom1Amount || ''}
                  onChange={e => setCompany({ payrollCustom1Amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>

              {/* Custom 2 */}
              <div>
                <label className={labelClass}>➕ {t('Déduction custom 2 — Nom', 'Custom Deduction 2 — Name')}</label>
                <input className={inputClass}
                  value={company.payrollCustom2Name}
                  onChange={e => setCompany({ payrollCustom2Name: e.target.value })}
                  placeholder={t('Ex: Uniforme', 'Ex: Uniform')} />
              </div>
              <div>
                <label className={labelClass}>{t('Montant', 'Amount')} $/période</label>
                <input className={inputClass} type="number" min="0" step="0.01"
                  value={company.payrollCustom2Amount || ''}
                  onChange={e => setCompany({ payrollCustom2Amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00" />
              </div>
            </div>

            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 1 : EMPLOYÉS ─── */}
        {activeTab === 1 && (
          <div className="space-y-4">

            {/* Liste employés existants */}
            {employees.map(emp => (
              <div key={emp.id} className={cardStyle}>
                {isDeco && <DecoCorners />}
                {editingId === emp.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Nom', 'Name')}</label>
                        <input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>{getRateLabel(emp.workMode as any || 'heure')}</label>
                        <input className={inputClass} value={editRate} onChange={e => setEditRate(e.target.value)} type="number" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>💼 {t('Type de travailleur', 'Worker Type')}</label>
                      <select className={inputClass} defaultValue={emp.workerType || 'contractor'}
                        onChange={e => updateEmployee(emp.id, { workerType: e.target.value as any })}>
                        <option value="contractor">🔧 {t('Sous-traitant autonome', 'Independent Contractor')}</option>
                        <option value="salaried">💼 {t('Salarié (employé)', 'Salaried Employee')}</option>
                      </select>
                    </div>

                    {/* Mode de travail — contracteurs */}
                    {(emp.workerType === 'contractor' || !emp.workerType) && (
                      <div>
                        <label className={labelClass}>⚙️ {t('Mode de facturation', 'Billing Mode')}</label>
                        <select className={inputClass} defaultValue={emp.workMode || 'surface'}
                          onChange={e => updateEmployee(emp.id, { workMode: e.target.value as any })}>
                          <option value="surface">🦶 {t('Pied carré ($/pi²)', 'Square foot ($/sqft)')}</option>
                          <option value="heure">⏱️ {t('Heure ($/h)', 'Hourly ($/h)')}</option>
                          <option value="forfait">💼 {t('À la job — forfait fixe', 'Fixed price — flat rate')}</option>
                        </select>
                      </div>
                    )}

                    {/* Coordonnées */}
                    {subHeader(`📞 ${t('Coordonnées', 'Contact Info')}`)}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
                        <input className={inputClass} defaultValue={emp.phone || ''} onChange={e => updateEmployee(emp.id, { phone: e.target.value || undefined })} placeholder="403-555-1234" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Courriel', 'Email')}</label>
                        <input className={inputClass} defaultValue={emp.email || ''} onChange={e => updateEmployee(emp.id, { email: e.target.value || undefined })} placeholder="marc@exemple.ca" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Adresse civique', 'Street Address')}</label>
                        <input className={inputClass} defaultValue={emp.address || ''} onChange={e => updateEmployee(emp.id, { address: e.target.value || undefined })} placeholder="123 Rue Principale" />
                      </div>
                      <div>
                        <label className={labelClass}>{t('Ville', 'City')}</label>
                        <input className={inputClass} defaultValue={emp.city || ''} onChange={e => updateEmployee(emp.id, { city: e.target.value || undefined })} placeholder="Calgary" />
                      </div>
                      <div>
                        <label className={labelClass}>{t('Province', 'Prov.')}</label>
                        <select className={inputClass} defaultValue={emp.province || 'AB'} onChange={e => updateEmployee(emp.id, { province: e.target.value })}>
                          {['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Code postal', 'Postal Code')}</label>
                        <input className={inputClass} defaultValue={emp.postalCode || ''} onChange={e => updateEmployee(emp.id, { postalCode: e.target.value || undefined })} placeholder="T2X 1A1" />
                      </div>
                    </div>

                    {/* Contact d'urgence */}
                    {subHeader(`🚨 ${t('Contact d\'urgence', 'Emergency Contact')}`)}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelClass}>{t('Nom', 'Name')}</label>
                        <input className={inputClass} defaultValue={emp.emergencyContact || ''} onChange={e => updateEmployee(emp.id, { emergencyContact: e.target.value || undefined })} placeholder={t('Marie Tremblay', 'Marie Smith')} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('Téléphone', 'Phone')}</label>
                        <input className={inputClass} defaultValue={emp.emergencyPhone || ''} onChange={e => updateEmployee(emp.id, { emergencyPhone: e.target.value || undefined })} placeholder="403-555-9999" />
                      </div>
                      <div>
                        <label className={labelClass}>{t('Lien', 'Relation')}</label>
                        <input className={inputClass} defaultValue={emp.emergencyRelation || ''} onChange={e => updateEmployee(emp.id, { emergencyRelation: e.target.value || undefined })} placeholder={t('Conjointe', 'Spouse')} />
                      </div>
                    </div>

                    {/* Champs contractor */}
                    {(emp.workerType === 'contractor' || !emp.workerType) && (
                      <>
                        {subHeader(`🔧 ${t('Infos sous-traitant', 'Contractor Info')}`)}
                        <div>
                          <label className={labelClass}>🏢 {t("Nom d'entreprise", 'Business Name')}</label>
                          <input className={inputClass} defaultValue={emp.businessName || ''} onChange={e => updateEmployee(emp.id, { businessName: e.target.value || undefined })} placeholder={t('Optionnel', 'Optional')} />
                        </div>
                        <div>
                          <label className={labelClass}>🇨🇦 {t('N° GST', 'GST #')}</label>
                          <input className={inputClass} defaultValue={emp.gstNumber || ''} onChange={e => updateEmployee(emp.id, { gstNumber: e.target.value || undefined })} placeholder="123456789 RT0001" />
                          <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>
                            {emp.gstNumber ? `✅ GST applicable` : `⚠️ ${t('Sans GST → T4A si > 500$/an', 'No GST → T4A if > $500/yr')}`}
                          </p>
                        </div>
                        {!emp.gstNumber && (
                          <div>
                            <label className={labelClass}>🪪 {t('NAS (si pas de GST)', 'SIN (if no GST)')}</label>
                            <input className={inputClass} defaultValue={emp.sin || ''} onChange={e => updateEmployee(emp.id, { sin: e.target.value.replace(/\D/g,'').slice(0,9) || undefined })} placeholder="123456789" inputMode="numeric" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Champs salarié */}
                    {emp.workerType === 'salaried' && (
                      <>
                        {subHeader(`💼 ${t('Infos paie', 'Payroll Info')}`)}
                        <div>
                          <label className={labelClass}>{t('Province (paie)', 'Province (payroll)')}</label>
                          <select className={inputClass} defaultValue={emp.employeeProvince || 'AB'} onChange={e => updateEmployee(emp.id, { employeeProvince: e.target.value })}>
                            {['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('Fréquence de paie', 'Pay Frequency')}</label>
                          <select className={inputClass} defaultValue={emp.payFrequency || 'biweekly'} onChange={e => updateEmployee(emp.id, { payFrequency: e.target.value as any })}>
                            <option value="weekly">{t('Hebdomadaire (40h)', 'Weekly (40h)')}</option>
                            <option value="biweekly">{t('Aux 2 semaines (80h)', 'Biweekly (80h)')}</option>
                            <option value="semimonthly">{t('2x/mois (86.67h)', 'Semi-monthly (86.67h)')}</option>
                            <option value="monthly">{t('Mensuel (173.33h)', 'Monthly (173.33h)')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('Début semaine de paie', 'Pay Period Start')}</label>
                          <select className={inputClass} defaultValue={emp.payPeriodStart || 'monday'} onChange={e => updateEmployee(emp.id, { payPeriodStart: e.target.value as any })}>
                            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d, i) => (
                              <option key={d} value={d}>{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{t('Salaire annuel $', 'Annual Salary $')}</label>
                          <input className={inputClass} type="number" defaultValue={emp.annualSalary || ''} onChange={e => updateEmployee(emp.id, { annualSalary: parseFloat(e.target.value) || undefined })} placeholder="Ex: 52000" />
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { updateEmployee(emp.id, { name: editName, hourlyRate: parseFloat(editRate) || 0 }); setEditingId(null) }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>
                        ✅ {t('Sauvegarder', 'Save')}
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">
                        ✕ {t('Annuler', 'Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold flex flex-wrap items-center gap-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                        {emp.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${emp.role === 'admin' ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-white/60'}`}>
                          {emp.role === 'admin' ? '👑 Admin' : '👷'}
                        </span>
                        {emp.workerType && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${emp.workerType === 'salaried' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {emp.workerType === 'salaried' ? '💼 Salarié' : '🔧 S-traitant'}
                          </span>
                        )}
                        {emp.workerType === 'contractor' && emp.workMode && emp.workMode !== 'heure' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                            {emp.workMode === 'surface' ? '🦶 pi²' : '💼 forfait'}
                          </span>
                        )}
                      </div>
                      <div className="text-white/40 text-xs mt-1 flex flex-wrap gap-2">
                        {emp.hourlyRate ? <span>${emp.hourlyRate}/{emp.workMode === 'surface' ? 'pi²' : emp.workMode === 'forfait' ? 'job' : 'h'}</span> : null}
                        {emp.businessName && <span>🏢 {emp.businessName}</span>}
                        {emp.phone && <span>📞 {emp.phone}</span>}
                        {emp.email && <span>✉️ {emp.email}</span>}
                        {emp.city && <span>📍 {emp.city}</span>}
                        {emp.workerType === 'contractor' && emp.gstNumber && <span className="text-emerald-400/70">GST ✓</span>}
                        {emp.workerType === 'contractor' && !emp.gstNumber && emp.sin && <span className="text-amber-400/70">T4A</span>}
                        {emp.emergencyContact && <span className="text-red-400/60">🚨 {emp.emergencyContact}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <button onClick={() => { setEditingId(emp.id); setEditName(emp.name); setEditRate(String(emp.hourlyRate || '')) }}
                        className="w-8 h-8 rounded-xl bg-white/10 text-white text-sm flex items-center justify-center">✏️</button>
                      {emp.role !== 'admin' && (
                        <button onClick={() => deleteEmployee(emp.id)}
                          className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 text-sm flex items-center justify-center">🗑️</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* ── Formulaire ajout employé ── */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('➕ Ajouter employé', '➕ Add Employee'))}
              <div className="space-y-3">

                <input className={inputClass} value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('Prénom Nom *', 'First Last *')} />
                <input className={inputClass} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))} type="password" maxLength={4} inputMode="numeric" placeholder={t('PIN 4 chiffres *', 'PIN 4 digits *')} />

                <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                  <option value="employee">👷 {t('Employé', 'Employee')}</option>
                  <option value="admin">👑 Admin</option>
                </select>

                <select className={inputClass} value={newWorkerType} onChange={e => { setNewWorkerType(e.target.value as any); setNewWorkMode('surface') }}>
                  <option value="contractor">🔧 {t('Sous-traitant autonome', 'Independent Contractor')}</option>
                  <option value="salaried">💼 {t('Salarié', 'Salaried Employee')}</option>
                </select>

                {/* Mode de facturation — contracteurs */}
                {newWorkerType === 'contractor' && (
                  <div>
                    <label className={labelClass}>⚙️ {t('Mode de facturation', 'Billing Mode')}</label>
                    <select className={inputClass} value={newWorkMode} onChange={e => setNewWorkMode(e.target.value as any)}>
                      <option value="surface">🦶 {t('Pied carré ($/pi²)', 'Square foot ($/sqft)')}</option>
                      <option value="heure">⏱️ {t('Heure ($/h)', 'Hourly ($/h)')}</option>
                      <option value="forfait">💼 {t('À la job — forfait fixe', 'Fixed price — flat rate')}</option>
                    </select>
                  </div>
                )}

                {/* Taux — label dynamique */}
                <div>
                  <label className={labelClass}>
                    {newWorkerType === 'contractor' ? getRateLabel(newWorkMode) : t('Taux horaire ($/h)', 'Hourly Rate ($/h)')}
                  </label>
                  <input className={inputClass} value={newRate} onChange={e => setNewRate(e.target.value)} type="number"
                    placeholder={newWorkerType === 'contractor'
                      ? newWorkMode === 'surface' ? '$/pi²' : newWorkMode === 'forfait' ? '$' : '$/h'
                      : '$/h'} />
                </div>

                {/* Coordonnées + urgence */}
                <ContactFields
                  phone={newPhone} setPhone={setNewPhone}
                  email={newEmail} setEmail={setNewEmail}
                  address={newAddress} setAddress={setNewAddress}
                  city={newCity} setCity={setNewCity}
                  prov={newProvince} setProv={setNewProvince}
                  postalCode={newPostalCode} setPostalCode={setNewPostalCode}
                  emergencyContact={newEmergencyContact} setEmergencyContact={setNewEmergencyContact}
                  emergencyPhone={newEmergencyPhone} setEmergencyPhone={setNewEmergencyPhone}
                  emergencyRelation={newEmergencyRelation} setEmergencyRelation={setNewEmergencyRelation}
                />

                {/* Contractor */}
                {newWorkerType === 'contractor' && (
                  <>
                    {subHeader(`🔧 ${t('Infos sous-traitant', 'Contractor Info')}`)}
                    <div>
                      <label className={labelClass}>🏢 {t("Nom d'entreprise", 'Business Name')}</label>
                      <input className={inputClass} value={newBusinessName} onChange={e => setNewBusinessName(e.target.value)} placeholder={t('Optionnel — ex: Toiture Leblanc Inc.', 'Optional — ex: Leblanc Roofing Inc.')} />
                    </div>
                    <div>
                      <label className={labelClass}>🇨🇦 {t('N° GST (si inscrit)', 'GST # (if registered)')}</label>
                      <input className={inputClass} value={newGstNumber} onChange={e => setNewGstNumber(e.target.value)} placeholder="123456789 RT0001" />
                      <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>
                        {newGstNumber.trim()
                          ? `✅ ${t('GST applicable → vous lui payez la taxe', 'GST applies → you pay the tax')}`
                          : `⚠️ ${t('Sans GST → T4A requis si > 500$/an', 'No GST → T4A required if > $500/yr')}`}
                      </p>
                    </div>
                    {!newGstNumber.trim() && (
                      <div>
                        <label className={labelClass}>🪪 {t('NAS (si pas de GST)', 'SIN (if no GST)')}</label>
                        <input className={inputClass} value={newSin} onChange={e => setNewSin(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="123456789" inputMode="numeric" />
                      </div>
                    )}
                  </>
                )}

                {/* Salarié */}
                {newWorkerType === 'salaried' && (
                  <>
                    {subHeader(`💼 ${t('Infos paie', 'Payroll Info')}`)}
                    <select className={inputClass} value={newPayProvince} onChange={e => setNewPayProvince(e.target.value)}>
                      {['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select className={inputClass} value={newPayFrequency} onChange={e => setNewPayFrequency(e.target.value as any)}>
                      <option value="weekly">{t('Hebdomadaire (40h)', 'Weekly (40h)')}</option>
                      <option value="biweekly">{t('Aux 2 semaines (80h)', 'Biweekly (80h)')}</option>
                      <option value="semimonthly">{t('2x/mois (86.67h)', 'Semi-monthly (86.67h)')}</option>
                      <option value="monthly">{t('Mensuel (173.33h)', 'Monthly (173.33h)')}</option>
                    </select>
                    <select className={inputClass} value={newPayPeriodStart} onChange={e => setNewPayPeriodStart(e.target.value as any)}>
                      {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d, i) => (
                        <option key={d} value={d}>📅 {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}</option>
                      ))}
                    </select>
                    <input className={inputClass} value={newAnnualSalary} onChange={e => setNewAnnualSalary(e.target.value)} type="number" placeholder={t('Salaire annuel $ (optionnel)', 'Annual Salary $ (optional)')} />
                  </>
                )}

                <button onClick={handleAddEmployee}
                  className={`w-full py-3 rounded-xl font-bold text-sm mt-2 ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
                  ✅ {t('Ajouter', 'Add')}
                </button>
              </div>
            </div>

            {/* Reset PIN */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('🔐 Reset PIN', '🔐 Reset PIN'))}
              <div className="space-y-3">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: emp.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>{emp.name[0]}</div>
                    <p className={`flex-1 text-sm font-bold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{emp.name}</p>
                    <input type="password" maxLength={4} inputMode="numeric" placeholder="PIN"
                      className={`${inputClass} w-24 text-center`}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g,'').slice(0,4)
                        e.target.value = val
                        if (val.length === 4) {
                          updateEmployee(emp.id, { pin: val })
                          e.target.style.border = '2px solid #22c55e'
                          setTimeout(() => { e.target.style.border = ''; e.target.value = '' }, 1500)
                        }
                      }} />
                  </div>
                ))}
                <p className="text-white/30 text-xs text-center">{t('Tapez 4 chiffres pour sauvegarder automatiquement', 'Type 4 digits to save automatically')}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2 : THÈME ─── */}
        {activeTab === 2 && (
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🎨 Choisir un thème', '🎨 Choose a Theme'))}
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id as any)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold text-sm transition-all ${themeId === th.id ? 'ring-2 ring-white/60 scale-105 shadow-xl' : 'opacity-80'} bg-gradient-to-br ${th.colors} text-white`}>
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
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🌐 Langue / Language', '🌐 Language / Langue'))}
            <div className="grid grid-cols-2 gap-4">
              {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'en', flag: '🇺🇸', label: 'English' }].map(l => (
                <button key={l.code} onClick={() => setLang(l.code as 'fr' | 'en')}
                  className={`p-5 rounded-2xl flex flex-col items-center gap-2 font-bold text-lg transition-all ${lang === l.code ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] scale-105' : isQuantum ? 'bg-violet-600 text-white scale-105' : 'bg-white/20 text-white scale-105' : 'bg-white/5 text-white/60'}`}>
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
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('💳 Informations de paiement', '💳 Payment Information'))}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={labelClass}>{t('Courriel Virement (e-Transfer)', 'E-Transfer Email')}</label><input className={inputClass} value={company.etransferEmail} onChange={e => setCompany({ etransferEmail: e.target.value })} placeholder="paiement@hailite.ca" /></div>
              <div className="col-span-2"><label className={labelClass}>{t('Nom de la banque', 'Bank Name')}</label><input className={inputClass} value={company.bankName} onChange={e => setCompany({ bankName: e.target.value })} placeholder="TD Bank" /></div>
              <div><label className={labelClass}>{t('Transit', 'Transit')}</label><input className={inputClass} value={company.bankTransit} onChange={e => setCompany({ bankTransit: e.target.value })} placeholder="00000" /></div>
              <div><label className={labelClass}>{t('Institution', 'Institution')}</label><input className={inputClass} value={company.bankInstitution} onChange={e => setCompany({ bankInstitution: e.target.value })} placeholder="004" /></div>
              <div className="col-span-2"><label className={labelClass}>{t('N° de compte', 'Account Number')}</label><input className={inputClass} value={company.bankAccount} onChange={e => setCompany({ bankAccount: e.target.value })} placeholder="1234567" /></div>
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 5 : RAPPELS ─── */}
        {activeTab === 5 && (
          <div className={`${cardStyle} space-y-5`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('🔔 Rappels vocaux Punch Out', '🔔 Voice Punch Out Reminders'))}
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-semibold ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('Rappels activés', 'Reminders Enabled')}</div>
                <div className="text-white/40 text-xs mt-0.5">{t('Rappels vocaux progressifs', 'Progressive voice reminders')}</div>
              </div>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${voiceEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${voiceEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            {voiceEnabled && (
              <>
                <div className="space-y-2">
                  <label className={labelClass}>{t('Volume', 'Volume')} : {Math.round(voiceVolume * 100)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-violet-500" />
                </div>
                <button onClick={() => { const u = new SpeechSynthesisUtterance(lang === 'fr' ? 'Test rappel vocal!' : 'Voice reminder test!'); u.volume = voiceVolume; u.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'; speechSynthesis.speak(u) }}
                  className={`w-full py-3 rounded-xl font-bold text-sm ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : isQuantum ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white'}`}>
                  🔊 {t('Tester', 'Test')}
                </button>
              </>
            )}
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 6 : CONDITIONS ─── */}
        {activeTab === 6 && (
          <div className={`${cardStyle} space-y-4`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('📋 Conditions par défaut', '📋 Default Terms'))}
            <div>
              <label className={labelClass}>{t('Délai de paiement', 'Payment Terms')}</label>
              <select className={inputClass} value={company.defaultPaymentTerms} onChange={e => setCompany({ defaultPaymentTerms: e.target.value })}>
                <option value="Due on receipt">{t('Dû à réception', 'Due on Receipt')}</option>
                <option value="Net 15">Net 15</option><option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option><option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('Notes par défaut', 'Default Notes')}</label>
              <textarea className={`${inputClass} min-h-[100px] resize-none`} value={company.defaultNotes} onChange={e => setCompany({ defaultNotes: e.target.value })}
                placeholder={t('Merci pour votre confiance...', 'Thank you for your business...')} />
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 7 : CLIENTS ─── */}
        {activeTab === 7 && (
          <div className="space-y-4">
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('➕ Ajouter client', '➕ Add Client'))}
              <div className="space-y-3">
                <input className={inputClass} value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder={t('Nom complet *', 'Full Name *')} />
                <input className={inputClass} value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder={t('Téléphone', 'Phone')} />
                <input className={inputClass} value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="Email" />
                <input className={inputClass} value={newClientCity} onChange={e => setNewClientCity(e.target.value)} placeholder={t('Ville', 'City')} />
                <button onClick={handleAddClient}
                  className={`w-full py-3 rounded-xl font-bold text-sm ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
                  ✅ {t('Ajouter client', 'Add Client')}
                </button>
              </div>
            </div>
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(`👥 ${t('Clients', 'Clients')} (${clients.length})`)}
              {clients.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">{t('Aucun client', 'No clients yet')}</p>
              ) : (
                <div className="space-y-2">
                  {clients.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className={`font-bold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{c.name}</p>
                        <p className="text-white/40 text-xs">{c.phone || c.email || c.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push('/clients')} className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs">→</button>
                        <button onClick={() => deleteClient(c.id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => router.push('/clients')}
                className={`w-full mt-3 py-2 rounded-xl text-xs font-bold border ${isDeco ? 'border-[#D6B25E]/40 text-[#D6B25E]' : 'border-white/20 text-white/60'}`}>
                {t('→ Voir page clients complète', '→ View full clients page')}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 8 : CATALOGUE ─── */}
        {activeTab === 8 && (
          <div className="space-y-4">
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(`📦 ${t('Catalogue', 'Catalog')} (${materials.length})`)}
              {materials.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">{t('Aucun matériau', 'No materials yet')}</p>
              ) : (
                <div className="space-y-2">
                  {materials.slice(0, 10).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.emoji || '📦'}</span>
                        <div>
                          <p className={`font-bold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{m.name}</p>
                          <p className="text-white/40 text-xs">{CATEGORY_LABELS[m.category]} {m.prixClient ? `· ${m.prixClient}$` : ''}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteMaterial(m.id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">🗑️</button>
                    </div>
                  ))}
                  {materials.length > 10 && <p className="text-white/40 text-xs text-center">+{materials.length - 10} {t('autres', 'more')}</p>}
                </div>
              )}
              <button onClick={() => router.push('/catalogue')}
                className={`w-full mt-3 py-3 rounded-xl text-sm font-bold border ${isDeco ? 'border-[#D6B25E]/40 text-[#D6B25E]' : 'border-white/20 text-white/60'}`}>
                {t('→ Gérer le catalogue complet', '→ Manage full catalog')}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 9 : COMPTABILITÉ ─── */}
        {activeTab === 9 && (
          <div className={cardStyle}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('📊 Comptabilité', '📊 Accounting'))}
            <p className="text-white/50 text-sm mb-4">{t('Accédez à la page comptabilité complète pour voir les revenus, salaires et graphiques.', 'Access the full accounting page for revenues, wages and charts.')}</p>
            <button onClick={() => router.push('/comptabilite')}
              className={`w-full py-4 rounded-xl font-bold text-sm ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'}`}>
              📊 {t('Ouvrir la comptabilité', 'Open Accounting')}
            </button>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 10 : AVANCÉ ─── */}
        {activeTab === 10 && (
          <div className={`${cardStyle} space-y-4`}>
            {isDeco && <DecoCorners />}
            {sectionTitle(t('⚙️ Options avancées', '⚙️ Advanced Options'))}
            <div className={`p-4 rounded-xl ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
              <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('🗑️ Vider le cache local', '🗑️ Clear Local Cache')}</div>
              <div className="text-white/50 text-xs mb-3">{t('Efface toutes les données. Action irréversible.', 'Clears all data. Cannot be undone.')}</div>
              <button onClick={() => { if (confirm(t('Certain?', 'Sure?'))) { localStorage.clear(); window.location.reload() } }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">
                🗑️ {t('Vider le cache', 'Clear Cache')}
              </button>
            </div>
            <div className={`p-4 rounded-xl ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
              <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📱 PWA</div>
              <div className="text-white/50 text-xs">{t("Navigateur → Partager → Ajouter à l'écran d'accueil", 'Browser → Share → Add to Home Screen')}</div>
            </div>
            <div className={`p-4 rounded-xl text-center ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
              <div className="text-white/30 text-xs">Gestion Chantier Pro — Hailite Xteriors<br />v2.0 • Alberta GST 5% • Made with ❤️</div>
            </div>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

      </div>
    </div>
  )
}
