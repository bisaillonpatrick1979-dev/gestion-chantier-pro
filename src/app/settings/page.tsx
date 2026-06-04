'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useCompanyStore } from '@/store/useCompanyStore'
import { useVoiceReminderStore } from '@/store/useVoiceReminderStore'
import { useClientStore } from '@/store/useClientStore'
import { usePayrollRulesStore } from '@/store/usePayrollRulesStore'
import { useHREngine } from '@/hooks/useHREngine'
import { useCatalogueStore } from '@/store/useCatalogueStore'
import type { Category } from '@/store/useCatalogueStore'
import {
  DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow,
} from '@/components/DecoElements'

const THEMES = [
  { id: 'quantum', label: '⚡ Quantum', colors: 'from-blue-700 to-cyan-500' },
  { id: 'xp',      label: '🎮 XP',      colors: 'from-purple-700 to-cyan-400' },
  { id: 'deco',    label: '✨ Deco',    colors: 'from-yellow-700 to-amber-400' },
  { id: 'inferno', label: '🔥 Infernal', colors: 'from-red-700 to-orange-500' },
  { id: 'arctic',  label: '🧊 Arctic',  colors: 'from-cyan-600 to-blue-400' },
  { id: 'carbon',  label: '🪙 Carbon',  colors: 'from-zinc-600 to-zinc-400' },
  ]

const TABS_FR = ['🏢 Compagnie','👤 Employés','🎨 Thème','🌐 Langue','💳 Paiement','🔔 Rappels','📋 Conditions','👥 Clients','📦 Catalogue','📊 Comptab.','📍 Géofenc.','🚨 RH']
const TABS_EN = ['🏢 Company','👤 Employees','🎨 Theme','🌐 Language','💳 Payment','🔔 Reminders','📋 Terms','👥 Clients','📦 Catalog','📊 Accounting','📍 Geofenc.','🚨 HR']

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
  const isInferno  = themeId === 'inferno'
  const isArctic   = themeId === 'arctic'
  const isCarbon   = themeId === 'carbon'
  const isMoonTide = themeId === 'moon-tide'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : isInferno ? 'inferno-card-glow' : isArctic ? 'arctic-card-glow' : isCarbon ? 'carbon-card-glow' : isMoonTide ? 'quantum-card-glow' : ''

  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore()
  const { company, setCompany, syncToCloud: syncCompanyToCloud } = useCompanyStore()
  const { enabled: voiceEnabled, volume: voiceVolume, setEnabled: setVoiceEnabled, setVolume: setVoiceVolume } = useVoiceReminderStore()
  const { clients, addClient, deleteClient } = useClientStore()
  const { materials, deleteMaterial } = useCatalogueStore()
  const { alerts, acknowledgeAlert, dismissAllAlerts } = usePayrollRulesStore()
  const { hrStatuses, summary } = useHREngine()

  const TABS = lang === 'fr' ? TABS_FR : TABS_EN
  const [activeTab, setActiveTab] = useState(0)
  const [companySaved, setCompanySaved] = useState(false)

  // ── Validation errors ─────────────────────────────────────────────────────
  const [empFormError, setEmpFormError] = useState('')
  const [clientFormError, setClientFormError] = useState('')
  const [confirmDeleteClientId, setConfirmDeleteClientId] = useState<string | null>(null)
  const [confirmDeleteEmpId, setConfirmDeleteEmpId] = useState<string | null>(null)

  // ── Géofencing UI state ───────────────────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [geoErrorMsg, setGeoErrorMsg] = useState('')

  // ── Formulaire nouvel employé ─────────────────────────────────────────────
  const [newName, setNewName]                     = useState('')
  const [newPin, setNewPin]                       = useState('')
  const [newRole, setNewRole]                     = useState<'admin' | 'employee'>('employee')
  const [newRate, setNewRate]                     = useState('')
  const [newWorkerType, setNewWorkerType]         = useState<'contractor' | 'salaried'>('contractor')
  const [newWorkMode, setNewWorkMode]             = useState<'heure' | 'forfait' | 'surface'>('surface')
  const [newPhone, setNewPhone]                   = useState('')
  const [newEmail, setNewEmail]                   = useState('')
  const [newAddress, setNewAddress]               = useState('')
  const [newCity, setNewCity]                     = useState('')
  const [newProvince, setNewProvince]             = useState('AB')
  const [newPostalCode, setNewPostalCode]         = useState('')
  const [newEmergencyContact, setNewEmergencyContact]   = useState('')
  const [newEmergencyPhone, setNewEmergencyPhone]       = useState('')
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('')
  const [newPayProvince, setNewPayProvince]       = useState('AB')
  const [newPayFrequency, setNewPayFrequency]     = useState<'weekly' | 'biweekly' | 'semimonthly' | 'monthly'>('biweekly')
  const [newPayPeriodStart, setNewPayPeriodStart] = useState<'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'|'sunday'>('monday')
  const [newAnnualSalary, setNewAnnualSalary]     = useState('')
  const [newBusinessName, setNewBusinessName]     = useState('')
  const [newGstNumber, setNewGstNumber]           = useState('')
  const [newSin, setNewSin]                       = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate]   = useState('')
  const [editName, setEditName]   = useState('')

  const [newClientName, setNewClientName]   = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientCity, setNewClientCity]   = useState('')

  const logoRef = useRef<HTMLInputElement>(null)

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
    if (!newName.trim()) { setEmpFormError(t('Le nom est obligatoire.', 'Name is required.')); return }
    if (newPin.length < 4) { setEmpFormError(t('Le PIN doit contenir 4 chiffres.', 'PIN must be 4 digits.')); return }
    setEmpFormError('')
    addEmployee({
      name: newName.trim(),
      pin: newPin,
      role: newRole,
      hourlyRate: parseFloat(newRate) || 0,
      workMode: newWorkerType === 'contractor' ? newWorkMode : 'heure',
      color: '#a855f7',
      active: true,
      workerType: newWorkerType,
      phone:      newPhone.trim()      || undefined,
      email:      newEmail.trim()      || undefined,
      address:    newAddress.trim()    || undefined,
      city:       newCity.trim()       || undefined,
      province:   newProvince          || undefined,
      postalCode: newPostalCode.trim() || undefined,
      emergencyContact:  newEmergencyContact.trim()  || undefined,
      emergencyPhone:    newEmergencyPhone.trim()    || undefined,
      emergencyRelation: newEmergencyRelation.trim() || undefined,
      employeeProvince: newWorkerType === 'salaried' ? newPayProvince : undefined,
      payFrequency:     newWorkerType === 'salaried' ? newPayFrequency : undefined,
      payPeriodStart:   newWorkerType === 'salaried' ? newPayPeriodStart : undefined,
      annualSalary:     newWorkerType === 'salaried' && newAnnualSalary ? parseFloat(newAnnualSalary) : undefined,
      businessName: newWorkerType === 'contractor' && newBusinessName.trim() ? newBusinessName.trim() : undefined,
      gstNumber:    newWorkerType === 'contractor' && newGstNumber.trim()    ? newGstNumber.trim()    : undefined,
      sin:          newWorkerType === 'contractor' && newSin.trim()          ? newSin.trim()          : undefined,
    })
    resetNewForm()
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirmDeleteEmpId === id) {
      deleteEmployee(id)
      setConfirmDeleteEmpId(null)
    } else {
      setConfirmDeleteEmpId(id)
    }
  }

  const handleDeleteClient = (id: string) => {
    if (confirmDeleteClientId === id) {
      deleteClient(id)
      setConfirmDeleteClientId(null)
    } else {
      setConfirmDeleteClientId(id)
    }
  }

  const handleDeleteMaterial = (id: string, name: string) => {
    if (confirm(t(`Supprimer "${name}" du catalogue ? Cette action est irréversible.`, `Delete "${name}" from catalog? This cannot be undone.`))) {
      deleteMaterial(id)
    }
  }

  const handleClearCache = () => {
    if (confirm(t('Vider le cache ? Toutes les données seront effacées. Cette action est irréversible.', 'Clear cache? All data will be erased. This cannot be undone.'))) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCompany({ logoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const handleAddClient = () => {
    if (!newClientName.trim()) { setClientFormError(t('Le nom du client est obligatoire.', 'Client name is required.')); return }
    setClientFormError('')
    addClient({ name: newClientName.trim(), phone: newClientPhone, email: newClientEmail, city: newClientCity, address: '', province: 'AB', postalCode: '', notes: '' })
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewClientCity('')
  }

  const handleSaveCompany = async () => {
    await syncCompanyToCloud()
    setCompanySaved(true)
    setTimeout(() => setCompanySaved(false), 2500)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoErrorMsg(t('GPS non supporté par ce navigateur.', 'GPS not supported by this browser.'))
      return
    }
    setGeoStatus('loading')
    setGeoErrorMsg('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6)
        const lng = pos.coords.longitude.toFixed(6)
        setCompany({ jobsiteLatLng: `${lat},${lng}` })
        setGeoStatus('success')
        setTimeout(() => setGeoStatus('idle'), 3000)
      },
      (err) => {
        setGeoStatus('error')
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoErrorMsg(t('Permission GPS refusée. Activez la localisation dans les réglages du téléphone.', 'GPS permission denied. Enable location in phone settings.'))
            break
          case err.POSITION_UNAVAILABLE:
            setGeoErrorMsg(t('Position GPS indisponible.', 'GPS position unavailable.'))
            break
          case err.TIMEOUT:
            setGeoErrorMsg(t('Délai GPS dépassé. Réessayez.', 'GPS timeout. Try again.'))
            break
          default:
            setGeoErrorMsg(t('Erreur GPS inconnue.', 'Unknown GPS error.'))
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const parsedCoords = (() => {
    if (!company.jobsiteLatLng) return null
    const parts = company.jobsiteLatLng.split(',')
    if (parts.length !== 2) return null
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  })()

  const googleMapsUrl = parsedCoords
    ? `https://maps.google.com/?q=${parsedCoords.lat},${parsedCoords.lng}`
    : null

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
            {subHeader(`💼 ${t('Paramètres paie salariés', 'Salaried Payroll Settings')}`)}
            <p className={`text-xs mb-3 ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/30'}`}>
              {t('Ces montants s\'appliquent automatiquement à tous les talons de paie.', 'These amounts apply automatically to all pay stubs.')}
            </p>
            <div className="grid grid-cols-2 gap-3">
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
              <div><label className={labelClass}>🏥 {t('Assurance santé', 'Health Ins.')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollHealthInsurance || ''} onChange={e => setCompany({ payrollHealthInsurance: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>🦷 {t('Assurance dentaire', 'Dental Ins.')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollDentalInsurance || ''} onChange={e => setCompany({ payrollDentalInsurance: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>💛 {t('Assurance vie', 'Life Ins.')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollLifeInsurance || ''} onChange={e => setCompany({ payrollLifeInsurance: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>♿ {t('Invalidité LT', 'LTD')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollLTD || ''} onChange={e => setCompany({ payrollLTD: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>💰 REER {t('collectif', 'Group')} % {t('du brut', 'of gross')}</label><input className={inputClass} type="number" min="0" max="18" step="0.1" value={company.payrollRRSP || ''} onChange={e => setCompany({ payrollRRSP: parseFloat(e.target.value) || 0 })} placeholder="0" /></div>
              <div><label className={labelClass}>🧠 PAE $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollEAP || ''} onChange={e => setCompany({ payrollEAP: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>➕ {t('Déduction custom 1 — Nom', 'Custom Deduction 1 — Name')}</label><input className={inputClass} value={company.payrollCustom1Name} onChange={e => setCompany({ payrollCustom1Name: e.target.value })} placeholder={t('Ex: Stationnement', 'Ex: Parking')} /></div>
              <div><label className={labelClass}>{t('Montant', 'Amount')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollCustom1Amount || ''} onChange={e => setCompany({ payrollCustom1Amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
              <div><label className={labelClass}>➕ {t('Déduction custom 2 — Nom', 'Custom Deduction 2 — Name')}</label><input className={inputClass} value={company.payrollCustom2Name} onChange={e => setCompany({ payrollCustom2Name: e.target.value })} placeholder={t('Ex: Uniforme', 'Ex: Uniform')} /></div>
              <div><label className={labelClass}>{t('Montant', 'Amount')} $/période</label><input className={inputClass} type="number" min="0" step="0.01" value={company.payrollCustom2Amount || ''} onChange={e => setCompany({ payrollCustom2Amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
            </div>
            {isDeco && <DecoDiamondRow />}

            {/* ── Bouton Sauvegarder compagnie ── */}
            <button
              onClick={handleSaveCompany}
              className={`w-full py-4 rounded-2xl font-black text-sm mt-4 transition-all active:scale-95
                ${companySaved
                  ? 'bg-emerald-500 text-white'
                  : isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]'
                  : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>
              {companySaved ? `✅ ${t('Sauvegardé!', 'Saved!')}` : `💾 ${t('Sauvegarder les infos compagnie', 'Save Company Info')}`}
            </button>
          </div>
        )}

        {/* ─── TAB 1 : EMPLOYÉS ─── */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {employees.map(emp => (
              <div key={emp.id} className={cardStyle}>
                {isDeco && <DecoCorners />}
                {editingId === emp.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className={labelClass}>{t('Nom', 'Name')}</label><input className={inputClass} value={editName} onChange={e => setEditName(e.target.value)} /></div>
                      <div className="col-span-2"><label className={labelClass}>{getRateLabel(emp.workMode as any || 'heure')}</label><input className={inputClass} value={editRate} onChange={e => setEditRate(e.target.value)} type="number" /></div>
                    </div>
                    <div>
                      <label className={labelClass}>💼 {t('Type de travailleur', 'Worker Type')}</label>
                      <select className={inputClass} defaultValue={emp.workerType || 'contractor'} onChange={e => updateEmployee(emp.id, { workerType: e.target.value as any })}>
                        <option value="contractor">🔧 {t('Sous-traitant autonome', 'Independent Contractor')}</option>
                        <option value="salaried">💼 {t('Salarié (employé)', 'Salaried Employee')}</option>
                      </select>
                    </div>
                    {(emp.workerType === 'contractor' || !emp.workerType) && (
                      <div>
                        <label className={labelClass}>⚙️ {t('Mode de facturation', 'Billing Mode')}</label>
                        <select className={inputClass} defaultValue={emp.workMode || 'surface'} onChange={e => updateEmployee(emp.id, { workMode: e.target.value as any })}>
                          <option value="surface">🦶 {t('Pied carré ($/pi²)', 'Square foot ($/sqft)')}</option>
                          <option value="heure">⏱️ {t('Heure ($/h)', 'Hourly ($/h)')}</option>
                          <option value="forfait">💼 {t('À la job — forfait fixe', 'Fixed price — flat rate')}</option>
                        </select>
                      </div>
                    )}
                    {subHeader(`🗓 ${t('Infos RH', 'HR Info')}`)}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className={labelClass}>📅 {t('Date d\'embauche', 'Hire Date')}</label><input className={inputClass} type="date" defaultValue={emp.hireDate || ''} onChange={e => updateEmployee(emp.id, { hireDate: e.target.value || undefined })} /></div>
                      <div className="col-span-2"><label className={labelClass}>📄 {t('Renouvellement contrat', 'Contract Renewal')}</label><input className={inputClass} type="date" defaultValue={emp.contractRenewalDate || ''} onChange={e => updateEmployee(emp.id, { contractRenewalDate: e.target.value || undefined })} /></div>
                      <div className="col-span-2"><label className={labelClass}>🏖️ {t('Taux vacances override %', 'Vacation Rate Override %')}</label><input className={inputClass} type="number" min="0" max="25" step="0.5" defaultValue={emp.vacationRateOverride || ''} onChange={e => updateEmployee(emp.id, { vacationRateOverride: parseFloat(e.target.value) || undefined })} placeholder={t('Laisser vide = palier auto', 'Leave blank = auto tier')} /></div>
                    </div>
                    {subHeader(`📞 ${t('Coordonnées', 'Contact Info')}`)}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} defaultValue={emp.phone || ''} onChange={e => updateEmployee(emp.id, { phone: e.target.value || undefined })} placeholder="403-555-1234" /></div>
                      <div className="col-span-2"><label className={labelClass}>{t('Courriel', 'Email')}</label><input className={inputClass} defaultValue={emp.email || ''} onChange={e => updateEmployee(emp.id, { email: e.target.value || undefined })} placeholder="marc@exemple.ca" /></div>
                      <div className="col-span-2"><label className={labelClass}>{t('Adresse civique', 'Street Address')}</label><input className={inputClass} defaultValue={emp.address || ''} onChange={e => updateEmployee(emp.id, { address: e.target.value || undefined })} placeholder="123 Rue Principale" /></div>
                      <div><label className={labelClass}>{t('Ville', 'City')}</label><input className={inputClass} defaultValue={emp.city || ''} onChange={e => updateEmployee(emp.id, { city: e.target.value || undefined })} placeholder="Calgary" /></div>
                      <div><label className={labelClass}>{t('Province', 'Prov.')}</label>
                        <select className={inputClass} defaultValue={emp.province || 'AB'} onChange={e => updateEmployee(emp.id, { province: e.target.value })}>
                          {['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2"><label className={labelClass}>{t('Code postal', 'Postal Code')}</label><input className={inputClass} defaultValue={emp.postalCode || ''} onChange={e => updateEmployee(emp.id, { postalCode: e.target.value || undefined })} placeholder="T2X 1A1" /></div>
                    </div>
                    {subHeader(`🚨 ${t('Contact d\'urgence', 'Emergency Contact')}`)}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className={labelClass}>{t('Nom', 'Name')}</label><input className={inputClass} defaultValue={emp.emergencyContact || ''} onChange={e => updateEmployee(emp.id, { emergencyContact: e.target.value || undefined })} placeholder={t('Marie Tremblay', 'Marie Smith')} /></div>
                      <div><label className={labelClass}>{t('Téléphone', 'Phone')}</label><input className={inputClass} defaultValue={emp.emergencyPhone || ''} onChange={e => updateEmployee(emp.id, { emergencyPhone: e.target.value || undefined })} placeholder="403-555-9999" /></div>
                      <div><label className={labelClass}>{t('Lien', 'Relation')}</label><input className={inputClass} defaultValue={emp.emergencyRelation || ''} onChange={e => updateEmployee(emp.id, { emergencyRelation: e.target.value || undefined })} placeholder={t('Conjointe', 'Spouse')} /></div>
                    </div>
                    {(emp.workerType === 'contractor' || !emp.workerType) && (
                      <>
                        {subHeader(`🔧 ${t('Infos sous-traitant', 'Contractor Info')}`)}
                        <div><label className={labelClass}>🏢 {t("Nom d'entreprise", 'Business Name')}</label><input className={inputClass} defaultValue={emp.businessName || ''} onChange={e => updateEmployee(emp.id, { businessName: e.target.value || undefined })} placeholder={t('Optionnel', 'Optional')} /></div>
                        <div>
                          <label className={labelClass}>🇨🇦 {t('N° GST', 'GST #')}</label>
                          <input className={inputClass} defaultValue={emp.gstNumber || ''} onChange={e => updateEmployee(emp.id, { gstNumber: e.target.value || undefined })} placeholder="123456789 RT0001" />
                          <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>{emp.gstNumber ? `✅ GST applicable` : `⚠️ ${t('Sans GST → T4A si > 500$/an', 'No GST → T4A if > $500/yr')}`}</p>
                        </div>
                        {!emp.gstNumber && (<div><label className={labelClass}>🪪 {t('NAS (si pas de GST)', 'SIN (if no GST)')}</label><input className={inputClass} defaultValue={emp.sin || ''} onChange={e => updateEmployee(emp.id, { sin: e.target.value.replace(/\D/g,'').slice(0,9) || undefined })} placeholder="123456789" inputMode="numeric" /></div>)}
                      </>
                    )}
                    {emp.workerType === 'salaried' && (
                      <>
                        {subHeader(`💼 ${t('Infos paie', 'Payroll Info')}`)}
                        <div><label className={labelClass}>{t('Province (paie)', 'Province (payroll)')}</label><select className={inputClass} defaultValue={emp.employeeProvince || 'AB'} onChange={e => updateEmployee(emp.id, { employeeProvince: e.target.value })}>{['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div><label className={labelClass}>{t('Fréquence de paie', 'Pay Frequency')}</label><select className={inputClass} defaultValue={emp.payFrequency || 'biweekly'} onChange={e => updateEmployee(emp.id, { payFrequency: e.target.value as any })}><option value="weekly">{t('Hebdomadaire (40h)', 'Weekly (40h)')}</option><option value="biweekly">{t('Aux 2 semaines (80h)', 'Biweekly (80h)')}</option><option value="semimonthly">{t('2x/mois (86.67h)', 'Semi-monthly (86.67h)')}</option><option value="monthly">{t('Mensuel (173.33h)', 'Monthly (173.33h)')}</option></select></div>
                        <div><label className={labelClass}>{t('Début semaine de paie', 'Pay Period Start')}</label><select className={inputClass} defaultValue={emp.payPeriodStart || 'monday'} onChange={e => updateEmployee(emp.id, { payPeriodStart: e.target.value as any })}>{['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d, i) => (<option key={d} value={d}>{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}</option>))}</select></div>
                        <div><label className={labelClass}>{t('Salaire annuel $', 'Annual Salary $')}</label><input className={inputClass} type="number" defaultValue={emp.annualSalary || ''} onChange={e => updateEmployee(emp.id, { annualSalary: parseFloat(e.target.value) || undefined })} placeholder="Ex: 52000" /></div>
                      </>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { updateEmployee(emp.id, { name: editName, hourlyRate: parseFloat(editRate) || 0 }); setEditingId(null) }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isDeco ? 'bg-[#D6B25E] text-[#0d0a00]' : 'bg-emerald-500 text-white'}`}>✅ {t('Sauvegarder', 'Save')}</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/10 text-white">✕ {t('Annuler', 'Cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold flex flex-wrap items-center gap-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>
                          {emp.name}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${emp.role === 'admin' ? isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-white/60'}`}>{emp.role === 'admin' ? '👑 Admin' : '👷'}</span>
                          {emp.workerType && (<span className={`text-xs px-2 py-0.5 rounded-full ${emp.workerType === 'salaried' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>{emp.workerType === 'salaried' ? '💼 Salarié' : '🔧 S-traitant'}</span>)}
                          {emp.hireDate && (<span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">🗓 {new Date(emp.hireDate).getFullYear()}</span>)}
                        </div>
                        <div className="text-white/40 text-xs mt-1 flex flex-wrap gap-2">
                          {emp.hourlyRate ? <span>${emp.hourlyRate}/{emp.workMode === 'surface' ? 'pi²' : emp.workMode === 'forfait' ? 'job' : 'h'}</span> : null}
                          {emp.phone && <span>📞 {emp.phone}</span>}
                          {emp.city && <span>📍 {emp.city}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <button onClick={() => { setEditingId(emp.id); setEditName(emp.name); setEditRate(String(emp.hourlyRate || '')); setConfirmDeleteEmpId(null) }} className="w-8 h-8 rounded-xl bg-white/10 text-white text-sm flex items-center justify-center">✏️</button>
                        {emp.role !== 'admin' && (
                          <button onClick={() => handleDeleteEmployee(emp.id)} className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center ${confirmDeleteEmpId === emp.id ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'}`}>🗑️</button>
                        )}
                      </div>
                    </div>
                    {confirmDeleteEmpId === emp.id && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleDeleteEmployee(emp.id)} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">{t('Supprimer définitivement', 'Delete permanently')}</button>
                        <button onClick={() => setConfirmDeleteEmpId(null)} className="flex-1 py-1.5 rounded-lg bg-white/10 text-white/60 text-xs font-bold">{t('Annuler', 'Cancel')}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Formulaire ajout */}
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('➕ Ajouter employé', '➕ Add Employee'))}
              <div className="space-y-3">
                <input className={inputClass} value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('Prénom Nom *', 'First Last *')} />
                <input className={inputClass} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))} type="password" maxLength={4} inputMode="numeric" placeholder={t('PIN 4 chiffres *', 'PIN 4 digits *')} />
                <select className={inputClass} value={newRole} onChange={e => setNewRole(e.target.value as any)}><option value="employee">👷 {t('Employé', 'Employee')}</option><option value="admin">👑 Admin</option></select>
                <select className={inputClass} value={newWorkerType} onChange={e => { setNewWorkerType(e.target.value as any); setNewWorkMode('surface') }}><option value="contractor">🔧 {t('Sous-traitant autonome', 'Independent Contractor')}</option><option value="salaried">💼 {t('Salarié', 'Salaried Employee')}</option></select>
                {newWorkerType === 'contractor' && (<div><label className={labelClass}>⚙️ {t('Mode de facturation', 'Billing Mode')}</label><select className={inputClass} value={newWorkMode} onChange={e => setNewWorkMode(e.target.value as any)}><option value="surface">🦶 {t('Pied carré ($/pi²)', 'Square foot ($/sqft)')}</option><option value="heure">⏱️ {t('Heure ($/h)', 'Hourly ($/h)')}</option><option value="forfait">💼 {t('À la job — forfait fixe', 'Fixed price — flat rate')}</option></select></div>)}
                <div><label className={labelClass}>{newWorkerType === 'contractor' ? getRateLabel(newWorkMode) : t('Taux horaire ($/h)', 'Hourly Rate ($/h)')}</label><input className={inputClass} value={newRate} onChange={e => setNewRate(e.target.value)} type="number" placeholder={newWorkerType === 'contractor' ? newWorkMode === 'surface' ? '$/pi²' : newWorkMode === 'forfait' ? '$' : '$/h' : '$/h'} /></div>
                <ContactFields phone={newPhone} setPhone={setNewPhone} email={newEmail} setEmail={setNewEmail} address={newAddress} setAddress={setNewAddress} city={newCity} setCity={setNewCity} prov={newProvince} setProv={setNewProvince} postalCode={newPostalCode} setPostalCode={setNewPostalCode} emergencyContact={newEmergencyContact} setEmergencyContact={setNewEmergencyContact} emergencyPhone={newEmergencyPhone} setEmergencyPhone={setNewEmergencyPhone} emergencyRelation={newEmergencyRelation} setEmergencyRelation={setNewEmergencyRelation} />
                {newWorkerType === 'contractor' && (
                  <>
                    {subHeader(`🔧 ${t('Infos sous-traitant', 'Contractor Info')}`)}
                    <div><label className={labelClass}>🏢 {t("Nom d'entreprise", 'Business Name')}</label><input className={inputClass} value={newBusinessName} onChange={e => setNewBusinessName(e.target.value)} placeholder={t('Optionnel', 'Optional')} /></div>
                    <div><label className={labelClass}>🇨🇦 {t('N° GST (si inscrit)', 'GST # (if registered)')}</label><input className={inputClass} value={newGstNumber} onChange={e => setNewGstNumber(e.target.value)} placeholder="123456789 RT0001" /></div>
                    {!newGstNumber.trim() && (<div><label className={labelClass}>🪪 {t('NAS (si pas de GST)', 'SIN (if no GST)')}</label><input className={inputClass} value={newSin} onChange={e => setNewSin(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder="123456789" inputMode="numeric" /></div>)}
                  </>
                )}
                {newWorkerType === 'salaried' && (
                  <>
                    {subHeader(`💼 ${t('Infos paie', 'Payroll Info')}`)}
                    <select className={inputClass} value={newPayProvince} onChange={e => setNewPayProvince(e.target.value)}>{['AB','BC','ON','QC','MB','SK','NS','NB','NL','PE','NT','NU','YT'].map(p => <option key={p} value={p}>{p}</option>)}</select>
                    <select className={inputClass} value={newPayFrequency} onChange={e => setNewPayFrequency(e.target.value as any)}><option value="weekly">{t('Hebdomadaire (40h)', 'Weekly (40h)')}</option><option value="biweekly">{t('Aux 2 semaines (80h)', 'Biweekly (80h)')}</option><option value="semimonthly">{t('2x/mois (86.67h)', 'Semi-monthly (86.67h)')}</option><option value="monthly">{t('Mensuel (173.33h)', 'Monthly (173.33h)')}</option></select>
                    <select className={inputClass} value={newPayPeriodStart} onChange={e => setNewPayPeriodStart(e.target.value as any)}>{['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d, i) => (<option key={d} value={d}>📅 {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}</option>))}</select>
                    <input className={inputClass} value={newAnnualSalary} onChange={e => setNewAnnualSalary(e.target.value)} type="number" placeholder={t('Salaire annuel $ (optionnel)', 'Annual Salary $ (optional)')} />
                  </>
                )}
                <button onClick={handleAddEmployee} className={`w-full py-3 rounded-xl font-bold text-sm mt-2 ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>✅ {t('Ajouter', 'Add')}</button>
                {empFormError && <p className="text-red-400 text-sm font-semibold text-center mt-1">⚠️ {empFormError}</p>}
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
                    <input type="password" maxLength={4} inputMode="numeric" placeholder="PIN" className={`${inputClass} w-24 text-center`}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g,'').slice(0,4)
                        e.target.value = val
                        if (val.length === 4) { updateEmployee(emp.id, { pin: val }); e.target.style.border = '2px solid #22c55e'; setTimeout(() => { e.target.style.border = ''; e.target.value = '' }, 1500) }
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
                <button key={th.id} onClick={() => setTheme(th.id as any)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 font-bold text-sm transition-all ${themeId === th.id ? 'ring-2 ring-white/60 scale-105 shadow-xl' : 'opacity-80'} bg-gradient-to-br ${th.colors} text-white`}>
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
                <button key={l.code} onClick={() => setLang(l.code as 'fr' | 'en')} className={`p-5 rounded-2xl flex flex-col items-center gap-2 font-bold text-lg transition-all ${lang === l.code ? isDeco ? 'bg-[#D6B25E] text-[#0d0a00] scale-105' : isQuantum ? 'bg-violet-600 text-white scale-105' : 'bg-white/20 text-white scale-105' : 'bg-white/5 text-white/60'}`}>
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
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`relative w-14 h-7 rounded-full transition-all duration-300 ${voiceEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${voiceEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
            {voiceEnabled && (
              <>
                <div className="space-y-2">
                  <label className={labelClass}>{t('Volume', 'Volume')} : {Math.round(voiceVolume * 100)}%</label>
                  <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={e => setVoiceVolume(parseFloat(e.target.value))} className="w-full accent-violet-500" />
                </div>
                <button onClick={() => { const u = new SpeechSynthesisUtterance(lang === 'fr' ? 'Test rappel vocal!' : 'Voice reminder test!'); u.volume = voiceVolume; u.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'; speechSynthesis.speak(u) }} className={`w-full py-3 rounded-xl font-bold text-sm ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : isQuantum ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white'}`}>🔊 {t('Tester', 'Test')}</button>
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
              <textarea className={`${inputClass} min-h-[100px] resize-none`} value={company.defaultNotes} onChange={e => setCompany({ defaultNotes: e.target.value })} placeholder={t('Merci pour votre confiance...', 'Thank you for your business...')} />
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
                <button onClick={handleAddClient} className={`w-full py-3 rounded-xl font-bold text-sm ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'}`}>✅ {t('Ajouter client', 'Add Client')}</button>
                {clientFormError && <p className="text-red-400 text-sm font-semibold text-center mt-1">⚠️ {clientFormError}</p>}
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
                    <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between p-3">
                        <div>
                          <p className={`font-bold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{c.name}</p>
                          <p className="text-white/40 text-xs">{c.phone || c.email || c.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => router.push('/clients')} className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs">→</button>
                          <button onClick={() => handleDeleteClient(c.id)} className={`px-3 py-1 rounded-lg text-xs font-bold ${confirmDeleteClientId === c.id ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400'}`}>
                            {confirmDeleteClientId === c.id ? t('⚠️ Confirmer', '⚠️ Confirm') : '🗑️'}
                          </button>
                        </div>
                      </div>
                      {confirmDeleteClientId === c.id && (
                        <div className="px-3 pb-3 flex gap-2">
                          <button onClick={() => handleDeleteClient(c.id)} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">{t('Supprimer définitivement', 'Delete permanently')}</button>
                          <button onClick={() => setConfirmDeleteClientId(null)} className="flex-1 py-1.5 rounded-lg bg-white/10 text-white/60 text-xs font-bold">{t('Annuler', 'Cancel')}</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => router.push('/clients')} className={`w-full mt-3 py-2 rounded-xl text-xs font-bold border ${isDeco ? 'border-[#D6B25E]/40 text-[#D6B25E]' : 'border-white/20 text-white/60'}`}>
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
                      <button onClick={() => handleDeleteMaterial(m.id, m.name)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">🗑️</button>
                    </div>
                  ))}
                  {materials.length > 10 && <p className="text-white/40 text-xs text-center">+{materials.length - 10} {t('autres', 'more')}</p>}
                </div>
              )}
              <button onClick={() => router.push('/catalogue')} className={`w-full mt-3 py-3 rounded-xl text-sm font-bold border ${isDeco ? 'border-[#D6B25E]/40 text-[#D6B25E]' : 'border-white/20 text-white/60'}`}>
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
            <button onClick={() => router.push('/comptabilite')} className={`w-full py-4 rounded-xl font-bold text-sm ${isDeco ? 'bg-gradient-to-r from-[#D6B25E] to-[#c9a84c] text-[#0d0a00]' : isQuantum ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'}`}>
              📊 {t('Ouvrir la comptabilité', 'Open Accounting')}
            </button>
            {isDeco && <DecoDiamondRow />}
          </div>
        )}

        {/* ─── TAB 10 : GÉOFENCING ─── */}
        {activeTab === 10 && (
          <div className="space-y-4">
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('📍 Géofencing Chantier', '📍 Jobsite Geofencing'))}
              <div className={`p-3 rounded-xl mb-4 ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/15' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/40'}`}>
                  💡 {t('Le géofencing se configure maintenant directement dans chaque Projet. Activez ou désactivez globalement ici.', 'Geofencing is now configured directly in each Project. Enable or disable globally here.')}
                </p>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
                <div>
                  <div className={`font-semibold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('Activer le géofencing', 'Enable Geofencing')}</div>
                  <div className="text-white/40 text-xs mt-0.5">{t('Punch In seulement sur le chantier', 'Punch In only on jobsite')}</div>
                </div>
                <button onClick={() => setCompany({ geofencingEnabled: !company.geofencingEnabled })} className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${company.geofencingEnabled ? isDeco ? 'bg-[#D6B25E]' : isQuantum ? 'bg-violet-500' : 'bg-emerald-500' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${company.geofencingEnabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <div className="mb-4">
                <label className={labelClass}>🎯 {t('Rayon autorisé', 'Allowed Radius')} — {company.geofencingRadius}m</label>
                <input type="range" min="25" max="500" step="25" value={company.geofencingRadius} onChange={e => setCompany({ geofencingRadius: parseInt(e.target.value) })} className={`w-full mt-1 ${isDeco ? 'accent-[#D6B25E]' : isQuantum ? 'accent-violet-500' : 'accent-emerald-500'}`} />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>25m</span>
                  <span className={`font-bold ${isDeco ? 'text-[#D6B25E]/60' : 'text-white/50'}`}>{company.geofencingRadius}m</span>
                  <span>500m</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
                <p className={`text-xs ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/30'}`}>
                  👉 {t('Pour configurer les coordonnées GPS d\'un chantier, ouvre le projet dans la page Projets et entre les coordonnées dans la section GPS.', 'To configure GPS coordinates for a jobsite, open the project in the Projects page and enter coordinates in the GPS section.')}
                </p>
              </div>
            </div>
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(t('⚙️ Options avancées', '⚙️ Advanced Options'))}
              <div className={`p-4 rounded-xl ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
                <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('🗑️ Vider le cache local', '🗑️ Clear Local Cache')}</div>
                <div className="text-white/50 text-xs mb-3">{t('Efface toutes les données. Action irréversible.', 'Clears all data. Cannot be undone.')}</div>
                <button onClick={handleClearCache} className="w-full py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400">
                  🗑️ {t('Vider le cache', 'Clear Cache')}
                </button>
              </div>
              <div className={`p-4 rounded-xl mt-3 ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
                <div className={`font-semibold mb-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>📱 PWA</div>
                <div className="text-white/50 text-xs">{t("Navigateur → Partager → Ajouter à l'écran d'accueil", 'Browser → Share → Add to Home Screen')}</div>
              </div>
              <div className={`p-4 rounded-xl text-center mt-3 ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
                <div className="text-white/30 text-xs">Gestion Chantier Pro — Hailite Xteriors<br />v2.0 • Alberta GST 5% • Made with ❤️</div>
              </div>
              {isDeco && <DecoDiamondRow />}
            </div>
          </div>
        )}

        {/* ─── TAB 11 : RH ALERTES ─── */}
        {activeTab === 11 && (
          <div className="space-y-4">
            <div className={cardStyle}>
              {isDeco && <DecoCorners />}
              {sectionTitle(`🚨 ${t('Alertes RH', 'HR Alerts')}`)}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: t('Salariés', 'Salaried'), value: summary.totalSalaried, color: isQuantum ? 'text-violet-400' : 'text-white' },
                  { label: t('Conformes', 'Compliant'), value: summary.compliant, color: 'text-emerald-400' },
                  { label: t('Non-conf.', 'Non-comp.'), value: summary.nonCompliant, color: summary.nonCompliant > 0 ? 'text-red-400' : 'text-emerald-400' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-xl p-3 text-center ${isDeco ? 'bg-[#D6B25E]/10 border border-[#D6B25E]/20' : 'bg-white/5 border border-white/10'}`}>
                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/40'}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
              {summary.activeAlerts === 0 ? (
                <div className={`rounded-xl p-6 text-center ${isDeco ? 'bg-[#D6B25E]/5 border border-[#D6B25E]/10' : 'bg-white/5 border border-white/10'}`}>
                  <p className="text-3xl mb-2">✅</p>
                  <p className={`font-bold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{t('Aucune alerte active', 'No active alerts')}</p>
                  <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>{t('Tous les employés sont conformes', 'All employees are compliant')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).sort((a, b) => { const order = { critical: 0, warning: 1, info: 2 }; return order[a.severity] - order[b.severity] }).map(alert => (
                    <div key={alert.id} className={`rounded-xl p-4 border ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : alert.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase tracking-wider ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>{alert.severity === 'critical' ? t('CRITIQUE', 'CRITICAL') : alert.severity === 'warning' ? t('AVERTISSEMENT', 'WARNING') : t('INFO', 'INFO')} — {alert.employeeName}</p>
                          <p className={`text-sm font-semibold mt-1 ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{lang === 'fr' ? alert.messageFR : alert.messageEN}</p>
                          {alert.dueDate && <p className={`text-xs mt-1 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>📅 {new Date(alert.dueDate).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA')}</p>}
                        </div>
                        <button onClick={() => acknowledgeAlert(alert.id)} className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isDeco ? 'bg-[#D6B25E]/20 text-[#D6B25E]' : 'bg-white/10 text-white/60'}`}>✓</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {summary.activeAlerts > 0 && (
                <button onClick={() => hrStatuses.forEach(s => dismissAllAlerts(s.employee.id))} className={`w-full mt-4 py-3 rounded-xl text-xs font-bold border ${isDeco ? 'border-[#D6B25E]/30 text-[#D6B25E]/60' : 'border-white/20 text-white/40'}`}>
                  ✓ {t('Tout marquer comme lu', 'Mark all as read')}
                </button>
              )}
            </div>
            {hrStatuses.length > 0 && (
              <div className={cardStyle}>
                {isDeco && <DecoCorners />}
                {sectionTitle(t('📊 Détail ancienneté', '📊 Seniority Detail'))}
                <div className="space-y-3">
                  {hrStatuses.map(({ employee, seniority, vacation, compliance }) => (
                    <div key={employee.id} className={`rounded-xl p-4 border ${compliance.isCompliant ? isDeco ? 'bg-[#D6B25E]/5 border-[#D6B25E]/15' : 'bg-white/5 border-white/10' : 'bg-red-500/8 border-red-500/25'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: employee.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{employee.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{employee.name}</p>
                          <p className={`text-xs ${isDeco ? 'text-[#D6B25E]/50' : 'text-white/40'}`}>🗓 {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA') : t('Date non définie', 'No hire date')}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-bold ${compliance.isCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{compliance.isCompliant ? '✅' : '🚨'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`rounded-lg p-2 text-center ${isDeco ? 'bg-[#D6B25E]/10' : 'bg-white/5'}`}><p className={`text-sm font-black ${isDeco ? 'text-[#D6B25E]' : 'text-white'}`}>{seniority.label}</p><p className={`text-xs mt-0.5 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>{t('Ancienneté', 'Seniority')}</p></div>
                        <div className={`rounded-lg p-2 text-center ${isDeco ? 'bg-[#D6B25E]/10' : 'bg-white/5'}`}><p className={`text-sm font-black ${vacation.isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>{vacation.effectiveRate}%</p><p className={`text-xs mt-0.5 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>{t('Vacances', 'Vacation')}</p></div>
                        <div className={`rounded-lg p-2 text-center ${isDeco ? 'bg-[#D6B25E]/10' : 'bg-white/5'}`}><p className={`text-sm font-black ${isDeco ? 'text-[#D6B25E]' : 'text-cyan-400'}`}>{vacation.nextTier ? `${vacation.monthsUntilNextTier}m` : '—'}</p><p className={`text-xs mt-0.5 ${isDeco ? 'text-[#D6B25E]/40' : 'text-white/30'}`}>{t('→ palier', '→ tier')}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
      } 
