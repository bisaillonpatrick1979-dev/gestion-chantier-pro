'use client'
import { useState } from 'react'
import { useWorkStore } from '@/store/useWorkStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useLangStore } from '@/store/useLangStore'
import { themes } from '@/lib/themes'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ==================
// COMPANY STORE
// ==================
interface CompanyInfo {
  name: string
  ownerName: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  rbq: string
  neq: string
  tps: string
  tvq: string
  gst: string
  pst: string
  hst: string
  liabilityInsurer: string
  liabilityPolicyNumber: string
  liabilityAmount: string
  liabilityExpiry: string
  workerCompInsurer: string
  workerCompNumber: string
  workerCompExpiry: string
  errorOmissionInsurer: string
  errorOmissionNumber: string
  errorOmissionExpiry: string
  paymentMethods: string
  bankName: string
  bankTransitNumber: string
  interacEmail: string
  legalNotes: string
  warrantyText: string
}

interface CompanyStore {
  company: CompanyInfo
  updateCompany: (updates: Partial<CompanyInfo>) => void
}

const defaultCompany: CompanyInfo = {
  name: 'Hailite Xteriors',
  ownerName: '',
  phone: '514-555-0000',
  email: 'info@hailite.com',
  website: '',
  address: '123 Rue Principale',
  city: 'Montréal',
  province: 'QC',
  postalCode: 'H1A 1A1',
  country: 'Canada',
  rbq: 'RBQ-123456',
  neq: '',
  tps: '',
  tvq: '',
  gst: '',
  pst: '',
  hst: '',
  liabilityInsurer: '',
  liabilityPolicyNumber: '',
  liabilityAmount: '',
  liabilityExpiry: '',
  workerCompInsurer: '',
  workerCompNumber: '',
  workerCompExpiry: '',
  errorOmissionInsurer: '',
  errorOmissionNumber: '',
  errorOmissionExpiry: '',
  paymentMethods: 'Chèque, Virement Interac, Comptant',
  bankName: '',
  bankTransitNumber: '',
  interacEmail: '',
  legalNotes: '',
  warrantyText: "Tous les travaux sont garantis pour une période de 1 an contre les défauts de main-d'oeuvre.",
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: defaultCompany,
      updateCompany: (updates: Partial<CompanyInfo>) => set((state: CompanyStore) => ({
        company: { ...state.company, ...updates } as CompanyInfo
      })),
    }),
    { name: 'company-store-v1' }
  )
)

// Helper to get company field safely
const getField = (company: CompanyInfo, field: string): string => {
  return (company as unknown as Record<string, string>)[field] ?? ''
}

export default function SettingsPage() {
  const { hourlyRate, forfaitAmount, surfaceRate, surfaceArea,
    setHourlyRate, setForfaitAmount, setSurfaceRate, setSurfaceArea,
    resetAllData } = useWorkStore()
  const { theme, themeId, setTheme } = useThemeStore()
  const { employees, addEmployee, deleteEmployee } = useEmployeeStore()
  const { lang, setLang } = useLangStore()
  const { company, updateCompany } = useCompanyStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('company')
  const [newEmployee, setNewEmployee] = useState({
    name: '', pin: '', workMode: 'heure' as const,
    hourlyRate: 45, role: 'employee' as const, active: true,
  })

  const handleReset = () => {
    if (window.confirm(t('Effacer toutes les données ? Irréversible.', 'Clear all data? Irreversible.'))) {
      resetAllData()
    }
  }

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  }

  const inputStyle = {
    width: '100%',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '10px 12px',
    color: theme.colors.text,
    fontSize: '15px',
    outline: 'none',
    marginTop: '4px',
  }

  const labelStyle = {
    color: theme.colors.textMuted,
    fontSize: '11px',
    fontWeight: '600' as const,
    letterSpacing: '0.5px',
  }

  const sectionBtnStyle = (active: boolean) => ({
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: active ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
    background: active ? theme.colors.glow1 : 'transparent',
    color: active ? theme.colors.primary : theme.colors.textMuted,
    fontSize: '12px',
    fontWeight: '700' as const,
    whiteSpace: 'nowrap' as const,
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  })

  const sections = [
    { id: 'company',    emoji: '🏢', fr: 'Compagnie',   en: 'Company'    },
    { id: 'taxes',      emoji: '🧾', fr: 'Taxes',        en: 'Taxes'      },
    { id: 'insurance',  emoji: '🛡️', fr: 'Assurances',  en: 'Insurance'  },
    { id: 'payment',    emoji: '💳', fr: 'Paiement',     en: 'Payment'    },
    { id: 'legal',      emoji: '📋', fr: 'Légal',        en: 'Legal'      },
    { id: 'employees',  emoji: '👥', fr: 'Employés',     en: 'Employees'  },
    { id: 'rates',      emoji: '💰', fr: 'Tarifs',       en: 'Rates'      },
    { id: 'appearance', emoji: '🎨', fr: 'Apparence',    en: 'Appearance' },
    { id: 'app',        emoji: 'ℹ️', fr: 'Application',  en: 'Application'},
  ]

  const renderField = (label: string, field: keyof CompanyInfo, placeholder?: string, type = 'text') => (
    <div key={field}>
      <label style={labelStyle}>{label}</label>
      <input
        value={company[field]}
        onChange={e => updateCompany({ [field]: e.target.value })}
        placeholder={placeholder}
        type={type}
        style={inputStyle}
      />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>
        ⚙️ {t('RÉGLAGES', 'SETTINGS')}
      </h1>

      {/* SECTION TABS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={sectionBtnStyle(activeSection === s.id)}>
            {s.emoji} {t(s.fr, s.en)}
          </button>
        ))}
      </div>

      {/* COMPANY */}
      {activeSection === 'company' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🏢 {t('INFORMATIONS DE LA COMPAGNIE', 'COMPANY INFORMATION')}
          </p>
          {renderField(t('Nom de la compagnie', 'Company name'), 'name')}
          {renderField(t('Nom du propriétaire', 'Owner name'), 'ownerName')}
          {renderField(t('Téléphone', 'Phone'), 'phone')}
          {renderField('Email', 'email')}
          {renderField(t('Site web', 'Website'), 'website')}

          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700', marginTop: '8px' }}>
            📍 {t('ADRESSE', 'ADDRESS')}
          </p>
          {renderField(t('Adresse', 'Address'), 'address')}
          {renderField(t('Ville', 'City'), 'city')}
          {renderField(t('Province', 'Province'), 'province')}
          {renderField(t('Code postal', 'Postal code'), 'postalCode')}
          {renderField(t('Pays', 'Country'), 'country')}

          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700', marginTop: '8px' }}>
            🪪 {t('NUMÉROS LÉGAUX', 'LEGAL NUMBERS')}
          </p>
          {renderField('RBQ', 'rbq')}
          {renderField('NEQ', 'neq')}
        </div>
      )}

      {/* TAXES */}
      {activeSection === 'taxes' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🧾 {t('NUMÉROS DE TAXES', 'TAX NUMBERS')}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
            {t('Ces numéros apparaîtront sur toutes vos factures.', 'These numbers will appear on all your invoices.')}
          </p>
          {renderField(t('TPS (Taxe fédérale)', 'GST (Federal tax)'), 'tps', 'Ex: 123456789 RT0001')}
          {renderField(t('TVQ (Taxe provinciale QC)', 'QST (Provincial tax QC)'), 'tvq', 'Ex: 1234567890 TQ0001')}
          {renderField('GST', 'gst', 'Ex: 123456789 RT0001')}
          {renderField('PST', 'pst', 'Ex: PST-1234567')}
          {renderField(t('HST (Harmonisée)', 'HST (Harmonized)'), 'hst', 'Ex: 123456789 RT0001')}
        </div>
      )}

      {/* INSURANCE */}
      {activeSection === 'insurance' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🛡️ {t('ASSURANCES', 'INSURANCE')}
          </p>

          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: '3px solid #22c55e' }}>
            <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              ✅ {t('Responsabilité civile', 'General liability')}
            </p>
            {renderField(t('Assureur', 'Insurer'), 'liabilityInsurer')}
            {renderField(t('Numéro de police', 'Policy number'), 'liabilityPolicyNumber')}
            {renderField(t('Montant de couverture', 'Coverage amount'), 'liabilityAmount', 'Ex: 2 000 000 $')}
            {renderField(t("Date d'expiration", 'Expiry date'), 'liabilityExpiry', '', 'date')}
          </div>

          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: '3px solid #3b82f6' }}>
            <p style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              🏥 {t('CNESST / Accident de travail', 'Workers compensation')}
            </p>
            {renderField(t('Assureur / organisme', 'Insurer / organization'), 'workerCompInsurer')}
            {renderField(t('Numéro de dossier', 'File number'), 'workerCompNumber')}
            {renderField(t("Date d'expiration", 'Expiry date'), 'workerCompExpiry', '', 'date')}
          </div>

          <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', borderLeft: '3px solid #f59e0b' }}>
            <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
              📋 {t('Erreurs et omissions', 'Errors & omissions')}
            </p>
            {renderField(t('Assureur', 'Insurer'), 'errorOmissionInsurer')}
            {renderField(t('Numéro de police', 'Policy number'), 'errorOmissionNumber')}
            {renderField(t("Date d'expiration", 'Expiry date'), 'errorOmissionExpiry', '', 'date')}
          </div>
        </div>
      )}

      {/* PAYMENT */}
      {activeSection === 'payment' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            💳 {t('MÉTHODES DE PAIEMENT', 'PAYMENT METHODS')}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
            {t('Ces informations apparaîtront sur vos factures.', 'This information will appear on your invoices.')}
          </p>
          {renderField(t('Méthodes acceptées', 'Accepted methods'), 'paymentMethods', t('Ex: Chèque, Virement, Comptant', 'Ex: Check, Transfer, Cash'))}
          {renderField(t('Nom de la banque', 'Bank name'), 'bankName', 'Ex: Desjardins, RBC...')}
          {renderField(t('Numéro de transit', 'Transit number'), 'bankTransitNumber', 'Ex: 12345-678')}
          {renderField(t('Email Interac', 'Interac email'), 'interacEmail', 'Ex: paiement@hailite.com')}
        </div>
      )}

      {/* LEGAL */}
      {activeSection === 'legal' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            📋 {t('MENTIONS LÉGALES', 'LEGAL NOTICES')}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
            {t('Ces textes apparaîtront en bas de vos documents.', 'These texts will appear at the bottom of your documents.')}
          </p>
          <div>
            <label style={labelStyle}>{t('Garantie sur les travaux', 'Work warranty')}</label>
            <textarea
              value={company.warrantyText}
              onChange={e => updateCompany({ warrantyText: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('Notes légales additionnelles', 'Additional legal notes')}</label>
            <textarea
              value={company.legalNotes}
              onChange={e => updateCompany({ legalNotes: e.target.value })}
              placeholder={t(
                'Ex: En cas de non-paiement, des frais de 2% par mois seront appliqués...',
                'Ex: In case of non-payment, a 2% monthly fee will be applied...'
              )}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>
        </div>
      )}

      {/* EMPLOYEES */}
      {activeSection === 'employees' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
              👥 {t('EMPLOYÉS', 'EMPLOYEES')}
            </p>
            <button onClick={() => setShowAddEmployee(!showAddEmployee)} style={{
              padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${theme.colors.primary}`,
              background: 'transparent', color: theme.colors.primary,
              fontSize: '12px', fontWeight: '700',
            }}>+ {t('Ajouter', 'Add')}</button>
          </div>

          {showAddEmployee && (
            <div style={{ background: theme.colors.surface, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                value={newEmployee.name}
                onChange={e => setNewEmployee(p => ({ ...p, name: e.target.value }))}
                placeholder={t("Nom de l'employé", 'Employee name')}
                style={inputStyle}
              />
              <input
                value={newEmployee.pin}
                onChange={e => setNewEmployee(p => ({ ...p, pin: e.target.value.slice(0, 4) }))}
                placeholder={t('PIN 4 chiffres', '4-digit PIN')}
                type="password"
                maxLength={4}
                style={inputStyle}
              />
              <select
                value={newEmployee.workMode}
                onChange={e => setNewEmployee(p => ({ ...p, workMode: e.target.value as 'heure' | 'forfait' | 'surface' }))}
                style={{ ...inputStyle }}>
                <option value="heure">⏱ {t('Heure', 'Hour')}</option>
                <option value="forfait">📦 {t('Forfait', 'Flat rate')}</option>
                <option value="surface">📐 {t('Surface', 'Surface')}</option>
              </select>
              <input
                type="number"
                value={newEmployee.hourlyRate}
                onChange={e => setNewEmployee(p => ({ ...p, hourlyRate: Number(e.target.value) }))}
                placeholder={t('Taux horaire', 'Hourly rate')}
                style={inputStyle}
              />
              <select
                value={newEmployee.role}
                onChange={e => setNewEmployee(p => ({ ...p, role: e.target.value as 'admin' | 'employee' }))}
                style={{ ...inputStyle }}>
                <option value="employee">👤 {t('Employé', 'Employee')}</option>
                <option value="admin">👑 Admin</option>
              </select>
              <button onClick={() => {
                if (newEmployee.name && newEmployee.pin.length === 4) {
                  addEmployee(newEmployee)
                  setNewEmployee({ name: '', pin: '', workMode: 'heure', hourlyRate: 45, role: 'employee', active: true })
                  setShowAddEmployee(false)
                }
              }} style={{
                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                background: theme.colors.primary, border: 'none',
                color: 'white', fontSize: '14px', fontWeight: '700',
              }}>
                ✅ {t("Créer l'employé", 'Create employee')}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employees.map(emp => (
              <div key={emp.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: theme.colors.surface, borderRadius: '10px', padding: '12px',
                borderLeft: `3px solid ${emp.color}`,
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: emp.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '800', fontSize: '14px',
                }}>
                  {emp.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                    {emp.name} {emp.role === 'admin' ? '👑' : ''}
                  </p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                    {emp.workMode} · PIN: **** · {emp.hourlyRate}$/h
                  </p>
                </div>
                {emp.id !== 'admin' && (
                  <button onClick={() => {
                    if (window.confirm(`${t('Supprimer', 'Delete')} ${emp.name} ?`)) deleteEmployee(emp.id)
                  }} style={{
                    color: '#ef4444', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '20px',
                  }}>×</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATES */}
      {activeSection === 'rates' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            💰 {t('TARIFS PAR DÉFAUT', 'DEFAULT RATES')}
          </p>
          {[
            { label: t('Taux horaire ($/h)', 'Hourly rate ($/h)'), value: hourlyRate, fn: setHourlyRate, badge: '$/h' },
            { label: t('Montant forfait ($)', 'Flat rate ($)'), value: forfaitAmount, fn: setForfaitAmount, badge: '$' },
            { label: t('Tarif au pi² ($)', 'Rate per sq ft ($)'), value: surfaceRate, fn: setSurfaceRate, badge: '$/pi²' },
            { label: t('Surface (pi²)', 'Surface area (sq ft)'), value: surfaceArea, fn: setSurfaceArea, badge: 'pi²' },
          ].map(f => (
            <div key={f.label}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" value={f.value}
                  onChange={e => f.fn(Number(e.target.value))}
                  style={inputStyle} />
                <span style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' as const }}>
                  {f.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPEARANCE */}
      {activeSection === 'appearance' && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🎨 {t('APPARENCE', 'APPEARANCE')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {themes.map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                border: themeId === th.id ? `2px solid ${th.colors.primary}` : `1px solid ${theme.colors.border}`,
                background: themeId === th.id ? `${th.colors.glow1}` : theme.colors.surface,
                textAlign: 'left' as const,
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${th.colors.primary}, ${th.colors.secondary})`,
                  boxShadow: themeId === th.id ? `0 0 15px ${th.colors.primary}66` : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: themeId === th.id ? th.colors.primary : theme.colors.text, fontSize: '15px', fontWeight: '700' }}>
                    {th.emoji} {th.name}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {[th.colors.primary, th.colors.secondary, th.colors.primaryLight].map((c, i) => (
                      <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                </div>
                {themeId === th.id && (
                  <span style={{ color: th.colors.primary, fontSize: '20px', fontWeight: '800' }}>✓</span>
                )}
              </button>
            ))}
          </div>

          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700', marginTop: '8px' }}>
            🌐 {t('LANGUE', 'LANGUAGE')}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['fr', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                border: lang === l ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                background: lang === l ? theme.colors.glow1 : 'transparent',
                color: lang === l ? theme.colors.primary : theme.colors.textMuted,
                fontSize: '14px', fontWeight: '600',
              }}>
                {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* APP */}
      {activeSection === 'app' && (
        <>
          <div style={card}>
            <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
              ℹ️ {t('APPLICATION', 'APPLICATION')}
            </p>
            {([
              ['App', 'Gestion Chantier Pro'],
              ['Version', '1.0.0'],
              [t('Entreprise', 'Company'), 'Hailite Xteriors'],
              ['Stack', 'Next.js 16 + Zustand'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.colors.textMuted, fontSize: '13px' }}>{label}</span>
                <span style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '600' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, border: '1px solid rgba(239,68,68,0.4)' }}>
            <p style={{ color: '#ef4444', fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
              ⚠️ {t('ZONE DE DANGER', 'DANGER ZONE')}
            </p>
            <button onClick={handleReset} style={{
              width: '100%', padding: '14px', borderRadius: '10px', cursor: 'pointer',
              border: '1px solid #ef4444', background: 'transparent',
              color: '#ef4444', fontSize: '14px', fontWeight: '600',
            }}>🗑️ {t('Effacer toutes les données', 'Clear all data')}</button>
          </div>
        </>
      )}

    </div>
  )
}
