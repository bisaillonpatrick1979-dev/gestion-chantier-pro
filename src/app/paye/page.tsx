'use client'
import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'

export default function PayePage() {
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { currentEmployeeId, employees, dayDetails } = useEmployeeStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = currentEmployee?.role === 'admin'

  const [showPinChange, setShowPinChange] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')
  const [pinError, setPinError] = useState(false)
  const [adminResetPins, setAdminResetPins] = useState<Record<string, string>>({})
  const [selectedEmpId, setSelectedEmpId] = useState(currentEmployeeId || '')

  const viewEmployee = isAdmin
    ? employees.find(e => e.id === selectedEmpId)
    : currentEmployee

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
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
    textAlign: 'center' as const,
    letterSpacing: '4px',
  }

  const empDetails = viewEmployee
    ? Object.entries(dayDetails)
        .filter(([key]) => key.startsWith(viewEmployee.id + '-'))
        .map(([, detail]) => detail)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

  const getWeekKey = (date: string): string => {
    const d = new Date(date + 'T12:00:00')
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    return monday.toISOString().split('T')[0]
  }

  const weekGroups: Record<string, typeof empDetails> = {}
  empDetails.forEach(detail => {
    const wk = getWeekKey(detail.date)
    if (!weekGroups[wk]) weekGroups[wk] = []
    weekGroups[wk].push(detail)
  })

  const totalRevenue = empDetails.reduce((s, d) => s + d.totalRevenue, 0)
  const totalHours = empDetails.reduce((s, d) => s + d.totalHours, 0)

  const handlePinChange = () => {
    if (!currentEmployee || !currentEmployeeId) return
    if (!isAdmin && oldPin !== currentEmployee.pin) {
      setPinError(true)
      setPinMsg(t('Ancien PIN incorrect', 'Incorrect old PIN'))
      return
    }
    if (newPin.length !== 4) {
      setPinError(true)
      setPinMsg(t('Le nouveau PIN doit avoir 4 chiffres', 'New PIN must be 4 digits'))
      return
    }
    if (newPin !== confirmPin) {
      setPinError(true)
      setPinMsg(t('Les PINs ne correspondent pas', 'PINs do not match'))
      return
    }
    useEmployeeStore.getState().updateEmployee(currentEmployeeId, { pin: newPin })
    setPinError(false)
    setPinMsg(t('PIN changé avec succès !', 'PIN changed successfully!'))
    setOldPin('')
    setNewPin('')
    setConfirmPin('')
    setTimeout(() => { setShowPinChange(false); setPinMsg('') }, 2000)
  }

  const handleAdminResetPin = (empId: string) => {
    const newPinVal = adminResetPins[empId] || ''
    if (newPinVal.length !== 4) {
      alert(t('Le PIN doit avoir 4 chiffres', 'PIN must be 4 digits'))
      return
    }
    useEmployeeStore.getState().updateEmployee(empId, { pin: newPinVal })
    setAdminResetPins(prev => ({ ...prev, [empId]: '' }))
    const emp = employees.find(e => e.id === empId)
    alert(`✅ PIN de ${emp?.name} mis à jour !`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <h1 style={{ color: theme.colors.primary, fontSize: '14px', letterSpacing: '3px', fontWeight: '700' }}>
        💵 {t('LIVRE DE PAYE', 'PAYROLL BOOK')}
      </h1>

      {/* ADMIN: Employee selector */}
      {isAdmin && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            👥 {t('VOIR LES STATS DE', 'VIEW STATS FOR')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employees.map(emp => (
              <button key={emp.id} onClick={() => setSelectedEmpId(emp.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                border: selectedEmpId === emp.id ? `2px solid ${emp.color}` : `1px solid ${theme.colors.border}`,
                background: selectedEmpId === emp.id ? `${emp.color}22` : theme.colors.surface,
                textAlign: 'left' as const,
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: emp.color,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '800', fontSize: '14px',
                }}>{emp.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                    {emp.name} {emp.role === 'admin' ? '👑' : ''}
                  </p>
                  <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                    {emp.workMode} · {emp.hourlyRate}$/h
                  </p>
                </div>
                {selectedEmpId === emp.id && <span style={{ color: emp.color, fontSize: '16px' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYEE SUMMARY */}
      {viewEmployee && (
        <div style={{ ...card, borderLeft: `4px solid ${viewEmployee.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: viewEmployee.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '20px',
            }}>{viewEmployee.name[0]}</div>
            <div>
              <p style={{ color: theme.colors.text, fontSize: '16px', fontWeight: '800' }}>{viewEmployee.name}</p>
              <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                {viewEmployee.workMode} · {viewEmployee.hourlyRate}$/h
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
              <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>
                {t('Total revenus', 'Total revenue')}
              </p>
              <p style={{ color: theme.colors.secondary, fontSize: '20px', fontWeight: '800' }}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div style={{ background: theme.colors.surface, borderRadius: '10px', padding: '12px', textAlign: 'center' as const }}>
              <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '4px' }}>
                {t('Total heures', 'Total hours')}
              </p>
              <p style={{ color: theme.colors.primary, fontSize: '20px', fontWeight: '800' }}>
                {totalHours.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY BREAKDOWN */}
      {Object.keys(weekGroups).length === 0 ? (
        <div style={{ ...card, textAlign: 'center' as const, padding: '32px' }}>
          <p style={{ color: theme.colors.textMuted, fontSize: '14px' }}>
            {t('Aucune donnée disponible', 'No data available')}
          </p>
        </div>
      ) : (
        Object.entries(weekGroups)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([weekStart, days]) => {
            const weekRevenue = days.reduce((s, d) => s + d.totalRevenue, 0)
            const weekHours = days.reduce((s, d) => s + d.totalHours, 0)
            const weekBreak = days.reduce((s, d) => s + d.totalBreak, 0)

            const weekEnd = new Date(weekStart + 'T12:00:00')
            weekEnd.setDate(weekEnd.getDate() + 6)
            const weekEndStr = weekEnd.toISOString().split('T')[0]

            const empInitials = viewEmployee?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'EMP'
            const weekNum = Math.ceil(
              (new Date(weekStart + 'T12:00:00').getTime() -
                new Date(new Date(weekStart).getFullYear() + '-01-01T12:00:00').getTime()) /
              (7 * 24 * 60 * 60 * 1000)
            )
            const invoiceNum = `${empInitials}-${new Date(weekStart).getFullYear()}-S${String(weekNum).padStart(2, '0')}`

            return (
              <div key={weekStart} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '800' }}>
                      📅 {t('Semaine du', 'Week of')} {weekStart}
                    </p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                      {t('au', 'to')} {weekEndStr} · {invoiceNum}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <p style={{ color: theme.colors.secondary, fontSize: '16px', fontWeight: '800' }}>
                      {formatCurrency(weekRevenue)}
                    </p>
                    <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{weekHours.toFixed(2)}h</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: t('Jours', 'Days'), value: `${days.length}`, color: theme.colors.primary },
                    { label: t('Heures', 'Hours'), value: `${weekHours.toFixed(1)}h`, color: theme.colors.primaryLight },
                    { label: t('Pauses', 'Breaks'), value: formatTimer(weekBreak), color: '#f97316' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: theme.colors.surface, borderRadius: '8px',
                      padding: '10px', textAlign: 'center' as const,
                    }}>
                      <p style={{ color: item.color, fontSize: '15px', fontWeight: '800' }}>{item.value}</p>
                      <p style={{ color: theme.colors.textMuted, fontSize: '10px' }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {days.map(detail => (
                    <div key={detail.date} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '6px',
                    }}>
                      <div>
                        <p style={{ color: theme.colors.text, fontSize: '13px' }}>
                          {new Date(detail.date + 'T12:00:00').toLocaleDateString(
                            lang === 'fr' ? 'fr-CA' : 'en-CA',
                            { weekday: 'short', day: 'numeric', month: 'short' }
                          )}
                        </p>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
                          {detail.sessions.length} {t('session(s)', 'session(s)')} · {detail.totalHours.toFixed(2)}h
                        </p>
                      </div>
                      <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                        {formatCurrency(detail.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: `2px solid ${theme.colors.primary}`, paddingTop: '10px',
                }}>
                  <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '800' }}>TOTAL</p>
                  <p style={{ color: theme.colors.secondary, fontSize: '14px', fontWeight: '800' }}>
                    {formatCurrency(weekRevenue)}
                  </p>
                </div>
              </div>
            )
          })
      )}

      {/* PIN CHANGE */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🔐 {t('CHANGER MON PIN', 'CHANGE MY PIN')}
          </p>
          <button onClick={() => {
            setShowPinChange(!showPinChange)
            setOldPin(''); setNewPin(''); setConfirmPin(''); setPinMsg(''); setPinError(false)
          }} style={{
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            border: `1px solid ${theme.colors.primary}`,
            background: 'transparent', color: theme.colors.primary,
            fontSize: '12px', fontWeight: '700',
          }}>
            {showPinChange ? t('Annuler', 'Cancel') : t('Modifier', 'Edit')}
          </button>
        </div>

        {showPinChange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!isAdmin && (
              <div>
                <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: '600' as const }}>
                  {t('Ancien PIN', 'Old PIN')}
                </label>
                <input type="password" maxLength={4} value={oldPin}
                  onChange={e => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="****" style={inputStyle} />
              </div>
            )}
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: '600' as const }}>
                {t('Nouveau PIN', 'New PIN')}
              </label>
              <input type="password" maxLength={4} value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: '600' as const }}>
                {t('Confirmer nouveau PIN', 'Confirm new PIN')}
              </label>
              <input type="password" maxLength={4} value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="****" style={inputStyle} />
            </div>
            {pinMsg && (
              <p style={{ color: pinError ? '#ef4444' : '#22c55e', fontSize: '13px', textAlign: 'center' as const, fontWeight: '700' }}>
                {pinMsg}
              </p>
            )}
            <button onClick={handlePinChange} style={{
              padding: '14px', borderRadius: '12px', cursor: 'pointer',
              background: theme.colors.primary, border: 'none',
              color: 'white', fontSize: '14px', fontWeight: '700',
            }}>
              ✅ {t('Changer le PIN', 'Change PIN')}
            </button>
          </div>
        )}
      </div>

      {/* ADMIN: Reset employee PINs */}
      {isAdmin && (
        <div style={card}>
          <p style={{ color: theme.colors.primary, fontSize: '11px', letterSpacing: '2px', fontWeight: '700' }}>
            🔑 {t('RÉINITIALISER UN PIN EMPLOYÉ', 'RESET EMPLOYEE PIN')}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
            {t(
              'Si un employé a oublié son PIN, entrez un nouveau PIN pour lui.',
              'If an employee forgot their PIN, enter a new PIN for them.'
            )}
          </p>
          {employees.filter(e => e.id !== 'admin').map(emp => (
            <div key={emp.id} style={{
              display: 'flex', gap: '8px', alignItems: 'center',
              background: theme.colors.surface, borderRadius: '10px', padding: '12px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: emp.color,
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '800', fontSize: '12px',
              }}>{emp.name[0]}</div>
              <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700', flex: 1 }}>
                {emp.name}
              </p>
              <input type="password" maxLength={4}
                value={adminResetPins[emp.id] || ''}
                onChange={e => setAdminResetPins(prev => ({
                  ...prev,
                  [emp.id]: e.target.value.replace(/\D/g, '').slice(0, 4)
                }))}
                placeholder="****"
                style={{
                  width: '80px', background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px', padding: '8px',
                  color: theme.colors.text, fontSize: '14px',
                  textAlign: 'center' as const, letterSpacing: '4px',
                }}
              />
              <button onClick={() => handleAdminResetPin(emp.id)} style={{
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                background: theme.colors.primary, border: 'none',
                color: 'white', fontSize: '12px', fontWeight: '700',
              }}>✓</button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
