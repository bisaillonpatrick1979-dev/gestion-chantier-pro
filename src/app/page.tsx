'use client'
import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { MaterialEntry } from '@/types/employee'
import { useLangStore } from '@/store/useLangStore'

type Screen = 'select' | 'pin' | 'dashboard'

export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak,
  } = useEmployeeStore()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en)

  const [screen, setScreen] = useState<Screen>('select')
  const [selectedId, setSelectedId] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [pinError, setPinError] = useState(false)
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

  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    if (currentEmployee?.workMode === 'surface') {
      setShowPunchOut(true)
    } else {
      punchOut(currentEmployeeId)
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

  // ==================
  // SCREEN: SELECT
  // ==================
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="metal-text" style={{
            fontSize: '24px', fontWeight: '900', letterSpacing: '4px'
          }}>
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
                <p style={{ color: theme.colors.text, fontSize: '16px', fontWeight: '700' }}>
                  {emp.name}
                </p>
                <p style={{ color: theme.colors.textMuted, fontSize: '12px' }}>
                  {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                </p>
              </div>
              {activeSessions[emp.id] && (
                <div style={{
                  marginLeft: 'auto', width: '10px', height: '10px',
                  borderRadius: '50%', background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ==================
  // SCREEN: PIN
  // ==================
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '24px', paddingTop: '24px'
      }}>
        <button onClick={() => setScreen('select')} style={{
          alignSelf: 'flex-start', color: theme.colors.textMuted,
          background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px'
        }}>← Retour</button>

        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '800', color: 'white',
          boxShadow: `0 0 30px ${emp?.color}66`,
        }}>
          {emp?.name[0].toUpperCase()}
        </div>

        <p style={{ color: theme.colors.text, fontSize: '18px', fontWeight: '700' }}>
          {emp?.name}
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: pin.length > i
                ? pinError ? '#ef4444' : theme.colors.primary
                : theme.colors.surface,
              border: `2px solid ${pinError ? '#ef4444' : theme.colors.border}`,
              transition: 'all 0.2s',
              boxShadow: pin.length > i ? `0 0 12px ${theme.colors.primary}` : 'none',
            }} />
          ))}
        </div>

        {pinError && (
          <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px', width: '100%', maxWidth: '280px'
        }}>
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
            }}>
              {d}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ==================
  // SCREEN: DASHBOARD
  // ==================
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
              {currentEmployee?.name}
              {currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>
              {currentEmployee?.workMode}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
          border: `1px solid ${theme.colors.border}`,
          background: 'transparent', color: theme.colors.textMuted,
          fontSize: '12px', fontWeight: '600',
        }}>
          {t('Déconnexion', 'Logout')}
        </button>
      </div>

      {/* REVENUE + TIMER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '10px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '8px'
          }}>{t('💰 REVENUS', '💰 REVENUE')}</p>
          <p style={{ color: theme.colors.secondary, fontSize: '20px', fontWeight: '800' }}>
            {formatCurrency(activeSession?.revenue || 0)}
          </p>
          <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>CAD</p>
        </div>
        <div style={card}>
          <p style={{
            color: theme.colors.primary, fontSize: '10px',
            letterSpacing: '2px', fontWeight: '700', marginBottom: '8px'
          }}>{t('⏱ TEMPS', '⏱ TIME')}</p>
          <p style={{
            color: theme.colors.text, fontSize: '20px',
            fontWeight: '800', fontFamily: 'monospace'
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

      {/* PUNCH BUTTON */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '16px', padding: '8px 0'
      }}>
        <button
          onClick={isRunning ? handlePunchOut : () => currentEmployeeId && punchIn(currentEmployeeId)}
          style={{
            width: '180px', height: '180px', borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${theme.colors.primaryLight}, ${theme.colors.primary})`,
            boxShadow: isRunning
              ? `0 0 60px ${theme.colors.glow1}, 0 0 120px ${theme.colors.glow2}`
              : `0 0 40px ${theme.colors.glow1}`,
            color: 'white', fontWeight: '800', fontSize: '18px',
            letterSpacing: '2px', border: 'none', cursor: 'pointer',
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
            padding: '12px 32px', fontSize: '15px',
            cursor: 'pointer', fontWeight: '700',
          }}>{t('☕ PAUSE', '☕ BREAK')}</button>
        )}

        {isRunning && isOnBreak && currentEmployeeId && (
          <button onClick={() => endBreak(currentEmployeeId)} style={{
            borderRadius: '999px', border: '2px solid #22c55e',
            color: '#22c55e', background: 'transparent',
            padding: '12px 32px', fontSize: '15px',
            cursor: 'pointer', fontWeight: '700',
          }}>{t('▶ REPRENDRE', '▶ RESUME')}</button>
        )}
      </div>

      {/* SURFACE PUNCH OUT MODAL */}
      {showPunchOut && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '20px 20px 0 0',
            padding: '24px', width: '100%',
            display: 'flex', flexDirection: 'column', gap: '16px',
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
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px', padding: '10px',
                    color: theme.colors.text, fontSize: '14px', width: '100%',
                  }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet}
                    onChange={e => updateMaterial(m.id, 'squareFeet', Number(e.target.value))}
                    placeholder="Pi²"
                    style={{
                      background: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px', padding: '10px',
                      color: theme.colors.text, fontSize: '14px',
                    }} />
                  <input type="number" value={m.pricePerSqFt}
                    onChange={e => updateMaterial(m.id, 'pricePerSqFt', Number(e.target.value))}
                    placeholder="$/pi²"
                    style={{
                      background: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px', padding: '10px',
                      color: theme.colors.text, fontSize: '14px',
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
            }}>+ Ajouter un matériau</button>
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

      {/* CALENDAR */}
      <div style={card}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px'
        }}>
          <button onClick={() => {
            const [y, m] = currentMonth.split('-').map(Number)
            const d = new Date(y, m - 2)
            setCurrentMonth(d.toISOString().slice(0, 7))
          }} style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text, borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px'
          }}>‹</button>
          <p style={{
            color: theme.colors.text, fontWeight: '700',
            fontSize: '14px', textTransform: 'capitalize' as const
          }}>{monthLabel}</p>
          <button onClick={() => {
            const [y, m] = currentMonth.split('-').map(Number)
            const d = new Date(y, m)
            setCurrentMonth(d.toISOString().slice(0, 7))
          }} style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text, borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px'
          }}>›</button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px', marginBottom: '8px'
        }}>
          {['Di','Lu','Ma','Me','Je','Ve','Sa'].map(d => (
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
            const detail = currentEmployeeId
              ? dayDetails[`${currentEmployeeId}-${dateKey}`]
              : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{
                minHeight: '44px', borderRadius: '8px',
                border: isToday
                  ? `2px solid ${theme.colors.primary}`
                  : `1px solid ${theme.colors.border}`,
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

      {/* DAY DETAIL MODAL */}
      {selectedDay && (() => {
        const detail = currentEmployeeId
          ? dayDetails[`${currentEmployeeId}-${selectedDay}`]
          : null
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end',
          }}>
            <div style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '20px 20px 0 0', padding: '24px', width: '100%',
              display: 'flex', flexDirection: 'column', gap: '12px',
              maxHeight: '80vh', overflowY: 'auto' as const,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ color: theme.colors.primary, fontSize: '16px', fontWeight: '800' }}>
                  📅 {selectedDay}
                </h2>
                <button onClick={() => setSelectedDay(null)} style={{
                  color: theme.colors.textMuted, background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '20px'
                }}>×</button>
              </div>
              {!detail ? (
                <p style={{ color: theme.colors.textMuted, textAlign: 'center' as const }}>
                  {t('Aucune donnée pour cette journée', 'No data for this day')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: t('Heures', 'Hours'), value: `${detail.totalHours.toFixed(2)}h`, color: theme.colors.primary },
                      { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: theme.colors.secondary },
                      { label: t('Pauses', 'Breaks'), value: formatTimer(detail.totalBreak), color: '#f97316' },
                      { label: 'Sessions', value: `${detail.sessions.length}`, color: theme.colors.primaryLight },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: theme.colors.card, borderRadius: '10px', padding: '12px',
                      }}>
                        <p style={{ color: theme.colors.textMuted, fontSize: '11px' }}>{item.label}</p>
                        <p style={{ color: item.color, fontSize: '16px', fontWeight: '800' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {detail.materials && detail.materials.length > 0 && (
                    <div style={{
                      background: theme.colors.card, borderRadius: '10px', padding: '12px',
                    }}>
                      <p style={{
                        color: theme.colors.primary, fontSize: '11px',
                        marginBottom: '8px', letterSpacing: '2px'
                      }}>MATÉRIAUX</p>
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
