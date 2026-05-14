'use client'
import { useState } from 'react'
import { useWorkStore } from '@/store/useWorkStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { themes } from '@/lib/themes'
import { useLangStore } from '@/store/useLangStore'

export default function SettingsPage() {
  const { hourlyRate, forfaitAmount, surfaceRate, surfaceArea,
    setHourlyRate, setForfaitAmount, setSurfaceRate, setSurfaceArea,
    resetAllData } = useWorkStore()
  const { theme, themeId, setTheme } = useThemeStore()
  const { employees, addEmployee, deleteEmployee } = useEmployeeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState<{
    name: string
    pin: string
    workMode: 'heure' | 'forfait' | 'surface'
    hourlyRate: number
    role: 'admin' | 'employee'
    active: boolean
  }>({
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
    fontSize: '16px',
    outline: 'none',
    marginTop: '6px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{
        color: theme.colors.primary, fontSize: '14px',
        letterSpacing: '3px', fontWeight: '700'
      }}>{t('⚙️ RÉGLAGES', '⚙️ SETTINGS')}</h1>

      {/* THEME SKINS */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700'
        }}>{t('🎨 APPARENCE', '🎨 APPEARANCE')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {themes.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
              border: themeId === t.id
                ? `2px solid ${t.colors.primary}`
                : `1px solid ${theme.colors.border}`,
              background: themeId === t.id
                ? `${t.colors.glow1}`
                : theme.colors.surface,
              textAlign: 'left' as const,
              transition: 'all 0.2s',
            }}>
              {/* COLOR PREVIEW */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                boxShadow: themeId === t.id ? `0 0 15px ${t.colors.primary}66` : 'none',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  color: themeId === t.id ? t.colors.primary : theme.colors.text,
                  fontSize: '15px', fontWeight: '700',
                }}>
                  {t.emoji} {t.name}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {[t.colors.primary, t.colors.secondary, t.colors.primaryLight].map((c, i) => (
                    <div key={i} style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: c,
                    }} />
                  ))}
                </div>
              </div>
              {themeId === t.id && (
                <span style={{
                  color: t.colors.primary, fontSize: '20px', fontWeight: '800'
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* EMPLOYEES */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{
            color: theme.colors.primary, fontSize: '11px',
            letterSpacing: '2px', fontWeight: '700'
          }}>{t('👥 EMPLOYÉS', '👥 EMPLOYEES')}</p>
          <button onClick={() => setShowAddEmployee(!showAddEmployee)} style={{
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            border: `1px solid ${theme.colors.primary}`,
            background: 'transparent', color: theme.colors.primary,
            fontSize: '12px', fontWeight: '700',
          }}>{t('+ Ajouter', '+ Add')}</button>
        </div>

        {showAddEmployee && (
          <div style={{
            background: theme.colors.surface, borderRadius: '12px', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
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
              onChange={e => setNewEmployee(p => ({
                ...p, workMode: e.target.value as 'heure' | 'forfait' | 'surface'
              }))}
              style={{ ...inputStyle }}>
              <option value="heure">⏱ Heure</option>
              <option value="forfait">📦 Forfait</option>
              <option value="surface">📐 Surface</option>
            </select>
            <input
              type="number"
              value={newEmployee.hourlyRate}
              onChange={e => setNewEmployee(p => ({ ...p, hourlyRate: Number(e.target.value) }))}
              placeholder="Taux horaire"
              style={inputStyle}
            />
            <select
              value={newEmployee.role}
              onChange={e => setNewEmployee(p => ({
                ...p, role: e.target.value as 'admin' | 'employee'
              }))}
              style={{ ...inputStyle }}>
              <option value="employee">👤 Employé</option>
              <option value="admin">👑 Admin</option>
            </select>
            <button onClick={() => {
              if (newEmployee.name && newEmployee.pin.length === 4) {
                addEmployee({ ...newEmployee, color: "" })
                setNewEmployee({
                  name: '', pin: '', workMode: 'heure',
                  hourlyRate: 45, role: 'employee', active: true
                })
                setShowAddEmployee(false)
              }
            }} style={{
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              background: theme.colors.primary, border: 'none',
              color: 'white', fontSize: '14px', fontWeight: '700',
            }}>
              {t("✅ Créer l'employé", '✅ Create employee')}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {employees.map(emp => (
            <div key={emp.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: theme.colors.surface, borderRadius: '10px', padding: '12px',
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
                  {emp.workMode} · PIN: ****
                </p>
              </div>
              {emp.id !== 'admin' && (
                <button onClick={() => {
                  if (window.confirm(`Supprimer ${emp.name} ?`)) deleteEmployee(emp.id)
                }} style={{
                  color: '#ef4444', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '20px',
                }}>×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TARIFS */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700'
        }}>{t('💰 TARIFS PAR DÉFAUT', '💰 BILLING RATES')}</p>
        {[
          { label: 'Taux horaire ($/h)', value: hourlyRate, fn: setHourlyRate, badge: '$/h' },
          { label: 'Montant forfait ($)', value: forfaitAmount, fn: setForfaitAmount, badge: 'Fixe' },
          { label: 'Tarif au pi² ($)', value: surfaceRate, fn: setSurfaceRate, badge: '$/pi²' },
          { label: 'Surface (pi²)', value: surfaceArea, fn: setSurfaceArea, badge: 'pi²' },
        ].map(f => (
          <div key={f.label}>
            <label style={{ color: theme.colors.textMuted, fontSize: '12px' }}>{f.label}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="number" value={f.value}
                onChange={e => f.fn(Number(e.target.value))}
                style={inputStyle} />
              <span style={{
                color: theme.colors.primary, fontSize: '12px',
                fontWeight: '700', whiteSpace: 'nowrap' as const
              }}>{f.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* APP INFO */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '2px', fontWeight: '700'
        }}>{t('ℹ️ APPLICATION', 'ℹ️ APPLICATION')}</p>
        {[
          ['App', 'Gestion Chantier Pro'],
          ['Version', '1.0.0'],
          ['Entreprise', 'Hailite Xteriors'],
          ['Stack', 'Next.js 16 + Zustand'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted, fontSize: '13px' }}>{label}</span>
            <span style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '600' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* DANGER */}
      <div style={{ ...card, border: '1px solid rgba(239,68,68,0.4)' }}>
        <p style={{ color: '#ef4444', fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
          {t('⚠️ ZONE DE DANGER', '⚠️ DANGER ZONE')}
        </p>
        <button onClick={handleReset} style={{
          width: '100%', padding: '14px', borderRadius: '10px', cursor: 'pointer',
          border: '1px solid #ef4444', background: 'transparent',
          color: '#ef4444', fontSize: '14px', fontWeight: '600',
        }}>{t('🗑️ Effacer toutes les données', '🗑️ Clear all data')}</button>
      </div>

    </div>
  )
}
