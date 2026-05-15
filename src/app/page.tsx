'use client'
import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useProjectStore } from '@/store/useProjectStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { MaterialEntry } from '@/types/employee'
import { useLangStore } from '@/store/useLangStore'
import PunchInModal from '@/components/PunchInModal'

type Screen = 'select' | 'pin' | 'dashboard'

export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak,
  } = useEmployeeStore()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const [screen, setScreen] = useState<Screen>('select')
  const [selectedId, setSelectedId] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [pinError, setPinError] = useState(false)

  // ── Nouveau : modal projet punch in/out ───────────────────────────────────
  const [showPunchModal, setShowPunchModal] = useState(false)
  const [punchModalMode, setPunchModalMode] = useState<'in' | 'out'>('in')

  // ── Ancien modal surface (gardé pour compatibilité si employé sans projet) ─
  const [showPunchOut, setShowPunchOut] = useState(false)
  const [materials, setMaterials] = useState<MaterialEntry[]>([])

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const activeSession = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const isRunning = !!activeSession
  const isOnBreak = activeSession?.isOnBreak ?? false

  // Vérifie si l'employé a un projet actif dans useProjectStore
  const activeProjectLog = currentEmployeeId
    ? getActiveLogForEmployee(currentEmployeeId)
    : null

  const card = {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
  }

  const handleSelectEmployee = (id: string) => {
    setSelectedId(id)
    setPin('')
    setPinError(false)
    setScreen('pin')
  }

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) {
        setCurrentEmployee(selectedId)
        setScreen('dashboard')
        setPinError(false)
      } else {
        setPinError(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 1000)
      }
    }
  }

  const handleLogout = () => {
    setCurrentEmployee(null)
    setScreen('select')
    setPin('')
    setSelectedId('')
  }

  // ── Punch In : ouvre le modal projet ─────────────────────────────────────
  const handlePunchIn = () => {
    if (!currentEmployeeId) return
    setPunchModalMode('in')
    setShowPunchModal(true)
  }

  // ── Punch Out : si mode surface ET pas de projet → ancien modal
  //               sinon → modal projet ─────────────────────────────────────
  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    // Si l'employé est sur un projet → modal projet pour punch out
    if (activeProjectLog) {
      setPunchModalMode('out')
      setShowPunchModal(true)
      return
    }
    // Fallback : ancien comportement surface sans projet
    if (currentEmployee?.workMode === 'surface') {
      setShowPunchOut(true)
    } else {
      punchOut(currentEmployeeId)
    }
  }

  // ── Punch In complété via modal → on appelle aussi le punchIn du store employé
  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') {
      // Déclenche aussi le timer/revenue du dashboard existant
      punchIn(currentEmployeeId)
    } else {
      // Punch out du dashboard existant
      punchOut(currentEmployeeId, materials)
      setMaterials([])
    }
  }

  const handleConfirmPunchOut = () => {
    if (!currentEmployeeId) return
    punchOut(currentEmployeeId, materials)
    setShowPunchOut(false)
    setMaterials([])
  }

  const addMaterial = () => {
    setMaterials([...materials, {
      id: Date.now().toString(),
      material: '', squareFeet: 0, pricePerSqFt: 0, total: 0,
    }])
  }

  const updateMaterial = (id: string, field: string, value: string | number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== id) return m
      const updated = { ...m, [field]: value }
      updated.total = updated.squareFeet * updated.pricePerSqFt
      return updated
    }))
  }

  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month - 1, d))
    }
    return days
  }

  const today = new Date().toISOString().split('T')[0]

  // ── SCREEN : SÉLECTION EMPLOYÉ ────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="metal-text" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px' }}>
            HAILITE XTERIORS
          </h1>
          <p style={{ color: theme.colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
            {t('Sélectionnez votre profil', 'Select your profile')}
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: employees.length > 3 ? '1fr 1fr' : '1fr',
          gap: '12px',
        }}>
          {employees.filter(e => e.active).map(emp => (
            <button key={emp.id} onClick={() => handleSelectEmployee(emp.id)} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px', borderRadius: '14px', cursor: 'pointer',
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card, textAlign: 'left' as const,
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`,
                boxShadow: `0 0 20px ${emp.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0,
              }}>
                {emp.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ color: theme.colors.text, fontSize: '16px', fontWeight: '700' }}>{emp.name}</p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                </p>
              </div>
              {activeSessions[emp.id] && (
                <div style={{
                  marginLeft: 'auto', width: '10px', height: '10px',
                  borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e',
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── SCREEN : PIN ──────────────────────────────────────────────────────────
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '24px' }}>
        <button onClick={() => setScreen('select')} style={{
          alignSelf: 'flex-start', color: theme.colors.textMuted,
          background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px'
        }}>← {t('Retour', 'Back')}</button>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '800', color: 'white',
          boxShadow: `0 0 30px ${emp?.color}66`,
        }}>
          {emp?.name[0].toUpperCase()}
        </div>
        <p style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '700' }}>{emp?.name}</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: pin.length > i ? pinError ? '#ef4444' : theme.colors.primary : theme.colors.surface,
              border: `2px solid ${pinError ? '#ef4444' : theme.colors.border}`,
              transition: 'all 0.2s',
              boxShadow: pin.length > i ? `0 0 12px ${theme.colors.primary}` : 'none',
            }} />
          ))}
        </div>
        {pinError && <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%', maxWidth: '280px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button key={i} onClick={() => {
              if (d === '⌫') setPin(p => p.slice(0, -1))
              else if (d !== '') handlePinDigit(d)
            }} style={{
              height: '64px', borderRadius: '12px',
              cursor: d ? 'pointer' : 'default',
              border: `1px solid ${theme.colors.border}`,
              background: d ? theme.colors.card : 'transparent',
              color: theme.colors.text,
              fontSize: d === '⌫' ? '20px' : '24px',
              fontWeight: '700', opacity: d ? 1 : 0,
            }}>{d}</button>
          ))}
        </div>
      </div>
    )
  }

  // ── SCREEN : DASHBOARD ────────────────────────────────────────────────────
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', {
    month: 'long', year: 'numeric'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* USER HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: currentEmployee?.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: 'white',
          }}>
            {currentEmployee?.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '700' }}>
              {currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              {/* Affiche le projet actif si disponible */}
              {activeProjectLog
                ? `🏗️ ${activeProjectLog.project.name}`
                : currentEmployee?.workMode}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
          border: `1px solid ${theme.colors.border}`,
          background: 'transparent', color: theme.colors.textMuted,
          fontSize: '12px', fontWeight: '600',
        }}>{t('Déconnexion', 'Logout')}</button>
      </div>

      {/* PROJET ACTIF BADGE — affiché seulement si punché sur un projet */}
      {activeProjectLog && (
        <div style={{
          background: `${theme.colors.primary}15`,
          border: `1px solid ${theme.colors.primary}40`,
          borderRadius: '12px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: theme.colors.primary, fontSize: '10px', letterSpacing: '2px', fontWeight: '700' }}>
              🏗️ PROJET EN COURS
            </p>
            <p style={{ color: theme.colors.text, fontSize: '14px', fontWeight: '800', marginTop: '2px' }}>
              {activeProjectLog.project.name}
            </p>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              📍 {activeProjectLog.project.address}
            </p>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <p style={{ color: '#22c55e', fontSize: '10px', fontWeight: '700' }}>🟢 ACTIF</p>
            <p style={{ color: theme.colors.textMuted, fontSize: '10px', marginTop: '2px' }}>
              {activeProjectLog.project.payMode === 'hourly' && `⏱️ ${activeProjectLog.log.hourlyRate}$/h`}
              {activeProjectLog.project.payMode === 'job' && `💰 À la job`}
              {activeProjectLog.project.payMode === 'sqft' && `📐 Au pi²`}
            </p>
          </div>
        </div>
      )}

      {/* REVENUE + TIMER — GROS CHIFFRES (inchangé) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '10px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '8px'
          }}>{t('💰 REVENUS', '💰 REVENUE')}</p>
          <p style={{
            color: theme.colors.secondary,
            fontSize: '28px',
            fontWeight: '900',
            lineHeight: 1.1,
          }}>
            {formatCurrency(activeSession?.revenue || 0)}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginTop: '4px' }}>CAD</p>
        </div>
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '10px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '8px'
          }}>{t('⏱ TEMPS', '⏱ TIME')}</p>
          <p style={{
            color: theme.colors.text,
            fontSize: '28px',
            fontWeight: '900',
            fontFamily: 'monospace',
            lineHeight: 1.1,
          }}>
            {formatTimer(activeSession?.elapsed || 0)}
          </p>
          <p style={{
            color: isOnBreak ? '#f97316' : isRunning ? '#22c55e' : theme.colors.textMuted,
            fontSize: '11px', marginTop: '4px'
          }}>
            ⬤ {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}
          </p>
        </div>
      </div>

      {/* PUNCH BUTTON (inchangé visuellement) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
        <button
          onClick={isRunning ? handlePunchOut : handlePunchIn}
          style={{
            width: '180px', height: '180px', borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
            boxShadow: isRunning
              ? `0 0 60px ${theme.colors.glow1}, 0 0 120px ${theme.colors.glow2}`
              : `0 0 40px ${theme.colors.glow1}`,
            color: 'white', fontWeight: '800', fontSize: '18px',
            letterSpacing: '2px', border: 'none', cursor: 'pointer',
            whiteSpace: 'pre-line' as const,
          }}>
          {isRunning ? 'PUNCH\nOUT' : 'PUNCH\nIN'}
        </button>
        <p style={{
          color: isOnBreak ? '#f97316' : isRunning ? '#22c55e' : theme.colors.textMuted,
          fontSize: '13px', letterSpacing: '1px'
        }}>
          ⬤ {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('PRÊT', 'READY')}
        </p>
        {isRunning && !isOnBreak && currentEmployeeId && (
          <button onClick={() => startBreak(currentEmployeeId)} style={{
            borderRadius: '999px', border: '2px solid #f97316',
            color: '#f97316', background: 'transparent',
            padding: '12px 32px', fontSize: '15px', cursor: 'pointer', fontWeight: '700',
          }}>{t('☕ PAUSE', '☕ BREAK')}</button>
        )}
        {isRunning && isOnBreak && currentEmployeeId && (
          <button onClick={() => endBreak(currentEmployeeId)} style={{
            borderRadius: '999px', border: '2px solid #22c55e',
            color: '#22c55e', background: 'transparent',
            padding: '12px 32px', fontSize: '15px', cursor: 'pointer', fontWeight: '700',
          }}>{t('▶ REPRENDRE', '▶ RESUME')}</button>
        )}
      </div>

      {/* ── MODAL PROJET PUNCH IN / OUT ─────────────────────────────────── */}
      {showPunchModal && currentEmployee && (
        <PunchInModal
          employeeId={currentEmployee.id}
          employeeName={currentEmployee.name}
          employeeHourlyRate={(currentEmployee as unknown as Record<string, unknown>).hourlyRate as number ?? 0}
          mode={punchModalMode}
          onComplete={handlePunchModalComplete}
          onCancel={() => setShowPunchModal(false)}
        />
      )}

      {/* ── ANCIEN MODAL SURFACE (fallback sans projet) ──────────────────── */}
      {showPunchOut && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px',
            display: 'flex', flexDirection: 'column', gap: '16px',
            maxHeight: '80vh', overflowY: 'auto' as const,
          }}>
            <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>
              📐 {t('Matériaux posés', 'Materials installed')}
            </h2>
            {materials.map(m => (
              <div key={m.id} style={{
                background: theme.colors.card, borderRadius: '12px', padding: '12px',
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                <input value={m.material}
                  onChange={e => updateMaterial(m.id, 'material', e.target.value)}
                  placeholder={t('Matériau (ex: bardeau, vinyle...)', 'Material (ex: shingle, vinyl...)')}
                  style={{
                    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px', padding: '10px',
                    color: theme.colors.text, fontSize: '14px', width: '100%',
                  }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet}
                    onChange={e => updateMaterial(m.id, 'squareFeet', Number(e.target.value))}
                    placeholder="Pi²"
                    style={{
                      background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '14px',
                    }} />
                  <input type="number" value={m.pricePerSqFt}
                    onChange={e => updateMaterial(m.id, 'pricePerSqFt', Number(e.target.value))}
                    placeholder="$/pi²"
                    style={{
                      background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px', padding: '10px', color: theme.colors.text, fontSize: '14px',
                    }} />
                </div>
                <p style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                  Total: {formatCurrency(m.total)}
                </p>
              </div>
            ))}
            <button onClick={addMaterial} style={{
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: `1px dashed ${theme.colors.primary}`,
              background: 'transparent', color: theme.colors.primary,
              fontSize: '13px', fontWeight: '700',
            }}>+ {t('Ajouter un matériau', 'Add material')}</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{
                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                border: `1px solid ${theme.colors.border}`,
                background: 'transparent', color: theme.colors.textMuted,
                fontSize: '14px', fontWeight: '700',
              }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{
                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                border: 'none', background: theme.colors.primary,
                color: 'white', fontSize: '14px', fontWeight: '700',
              }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR (inchangé) */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={() => {
            const [y, m] = currentMonth.split('-').map(Number)
            setCurrentMonth(new Date(y, m - 2).toISOString().slice(0, 7))
          }} style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text, borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px'
          }}>‹</button>
          <p style={{ color: theme.colors.text, fontWeight: '700', fontSize: '14px', textTransform: 'capitalize' as const }}>
            {monthLabel}
          </p>
          <button onClick={() => {
            const [y, m] = currentMonth.split('-').map(Number)
            setCurrentMonth(new Date(y, m).toISOString().slice(0, 7))
          }} style={{
            background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text, borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px'
          }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {(lang === 'fr'
            ? ['Di','Lu','Ma','Me','Je','Ve','Sa']
            : ['Su','Mo','Tu','We','Th','Fr','Sa']
          ).map(d => (
            <div key={d} style={{
              textAlign: 'center' as const, fontSize: '10px',
              color: theme.colors.textMuted, fontWeight: '700', padding: '4px 0'
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const dateKey = day.toISOString().split('T')[0]
            const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{
                minHeight: '44px', borderRadius: '8px',
                border: isToday ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                background: detail ? `${theme.colors.primary}22` : theme.colors.surface,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2px',
              }}>
                <span style={{
                  fontSize: '10px',
                  color: isToday ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: isToday ? '800' : '400'
                }}>{day.getDate()}</span>
                {detail && (
                  <span style={{ fontSize: '9px', color: theme.colors.secondary }}>
                    {formatCurrency(detail.totalRevenue)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* LEGEND (inchangé) */}
      <div style={card}>
        <p style={{
          color: theme.colors.primary, fontSize: '11px',
          letterSpacing: '3px', fontWeight: '700', marginBottom: '12px'
        }}>
          {t('LÉGENDE', 'LEGEND')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { emoji: '⛱️', fr: 'Congé / Vacances',    en: 'Day off / Vacation', color: '#06b6d4', tint: 'rgba(6,182,212,0.15)'   },
            { emoji: '🌙', fr: 'Petite journée',       en: 'Short day (< 4h)',   color: '#64748b', tint: 'rgba(100,116,139,0.15)' },
            { emoji: '📋', fr: 'Journée moyenne',      en: 'Average day (4-6h)', color: '#3b82f6', tint: 'rgba(59,130,246,0.15)'  },
            { emoji: '✅', fr: 'Journée normale',      en: 'Normal day (6-8h)',  color: '#22c55e', tint: 'rgba(34,197,94,0.15)'   },
            { emoji: '⭐', fr: 'Bonne journée',        en: 'Good day (8-10h)',   color: '#eab308', tint: 'rgba(234,179,8,0.15)'   },
            { emoji: '🔥', fr: 'Grosse journée',       en: 'Big day (10-12h)',   color: '#f97316', tint: 'rgba(249,115,22,0.15)'  },
            { emoji: '💎', fr: 'Très grosse journée',  en: 'Huge day (12h+)',    color: '#a855f7', tint: 'rgba(168,85,247,0.15)'  },
          ].map(item => (
            <div key={item.emoji} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: item.tint, borderLeft: `3px solid ${item.color}`,
              borderRadius: '8px', padding: '10px 12px',
            }}>
              <span style={{ fontSize: '20px' }}>{item.emoji}</span>
              <p style={{ color: theme.colors.text, fontSize: '13px', fontWeight: '700' }}>
                {t(item.fr, item.en)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DAY DETAIL MODAL — CENTERED (inchangé) */}
      {selectedDay && (() => {
        const detail = currentEmployeeId
          ? dayDetails[`${currentEmployeeId}-${selectedDay}`]
          : null
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}>
            <div style={{
              background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
              borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px',
              display: 'flex', flexDirection: 'column', gap: '12px',
              maxHeight: '80vh', overflowY: 'auto' as const,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: theme.colors.primary, fontSize: '18px', fontWeight: '800' }}>
                  📅 {selectedDay}
                </h2>
                <button onClick={() => setSelectedDay(null)} style={{
                  color: theme.colors.textMuted, background: theme.colors.card,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '50%', cursor: 'pointer',
                  fontSize: '18px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>

              {!detail ? (
                <p style={{ color: theme.colors.textMuted, textAlign: 'center' as const, padding: '20px' }}>
                  {t('Aucune donnée pour cette journée', 'No data for this day')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: t('Heures', 'Hours'),    value: `${detail.totalHours.toFixed(2)}h`,  color: theme.colors.primary      },
                      { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: theme.colors.secondary    },
                      { label: t('Pauses', 'Breaks'),   value: formatTimer(detail.totalBreak),       color: '#f97316'                 },
                      { label: 'Sessions',              value: `${detail.sessions.length}`,          color: theme.colors.primaryLight },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: theme.colors.card, borderRadius: '10px', padding: '16px',
                        textAlign: 'center' as const,
                      }}>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px', marginBottom: '6px' }}>
                          {item.label}
                        </p>
                        <p style={{ color: item.color, fontSize: '20px', fontWeight: '800' }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {detail.sessions.length > 0 && (
                    <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px' }}>
                      <p style={{
                        color: theme.colors.primary, fontSize: '11px',
                        marginBottom: '8px', letterSpacing: '2px', fontWeight: '700'
                      }}>SESSIONS</p>
                      {detail.sessions.map((session, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between',
                          borderBottom: `1px solid ${theme.colors.border}`,
                          paddingBottom: '6px', marginBottom: '6px',
                        }}>
                          <span style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                            {new Date(session.startTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                            {session.endTime && ` → ${new Date(session.endTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span style={{ color: theme.colors.secondary, fontSize: '12px', fontWeight: '700' }}>
                            {formatTimer(session.elapsed)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {detail.materials && detail.materials.length > 0 && (
                    <div style={{ background: theme.colors.card, borderRadius: '10px', padding: '12px' }}>
                      <p style={{
                        color: theme.colors.primary, fontSize: '11px',
                        marginBottom: '8px', letterSpacing: '2px', fontWeight: '700'
                      }}>{t('MATÉRIAUX', 'MATERIALS')}</p>
                      {detail.materials.map((m, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between',
                          borderBottom: `1px solid ${theme.colors.border}`,
                          paddingBottom: '6px', marginBottom: '6px',
                        }}>
                          <span style={{ color: theme.colors.text, fontSize: '13px' }}>
                            {m.material} ({m.squareFeet} pi²)
                          </span>
                          <span style={{ color: theme.colors.secondary, fontSize: '13px', fontWeight: '700' }}>
                            {formatCurrency(m.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })()}

    </div>
  )
}
