'use client'
import { useState } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useProjectStore } from '@/store/useProjectStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { MaterialEntry } from '@/types/employee'
import { useLangStore } from '@/store/useLangStore'
import PunchInModal from '@/components/PunchInModal'
import PunchButton from '@/components/PunchButton'

type Screen = 'select' | 'pin' | 'dashboard'

export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak, updateEmployee,
  } = useEmployeeStore()
  const { theme, themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'

  const [screen, setScreen] = useState<Screen>('select')
  const [selectedId, setSelectedId] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [showPunchModal, setShowPunchModal] = useState(false)
  const [punchModalMode, setPunchModalMode] = useState<'in' | 'out'>('in')
  const [showPunchOut, setShowPunchOut] = useState(false)
  const [materials, setMaterials] = useState<MaterialEntry[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState(false)
  const [tempRate, setTempRate] = useState('')

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const activeSession = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const isRunning = !!activeSession
  const isOnBreak = activeSession?.isOnBreak ?? false
  const activeProjectLog = currentEmployeeId ? getActiveLogForEmployee(currentEmployeeId) : null
  const today = new Date().toISOString().split('T')[0]

  // ── Styles dynamiques ─────────────────────────────────────────────────────
  const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  }

  const decoCardStyle = {
    background: '#111109',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: '12px',
    padding: '16px',
    position: 'relative' as const,
  }

  const activeCard = isDeco ? decoCardStyle : cardStyle

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectEmployee = (id: string) => { setSelectedId(id); setPin(''); setPinError(false); setScreen('pin') }

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) {
        setCurrentEmployee(selectedId); setScreen('dashboard'); setPinError(false)
      } else {
        setPinError(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 1000)
      }
    }
  }

  const handleLogout = () => { setCurrentEmployee(null); setScreen('select'); setPin(''); setSelectedId('') }
  const handlePunchIn = () => { if (!currentEmployeeId) return; setPunchModalMode('in'); setShowPunchModal(true) }
  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    if (activeProjectLog) { setPunchModalMode('out'); setShowPunchModal(true); return }
    if (currentEmployee?.workMode === 'surface') { setShowPunchOut(true) } else { punchOut(currentEmployeeId) }
  }
  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') punchIn(currentEmployeeId)
    else { punchOut(currentEmployeeId, materials); setMaterials([]) }
  }
  const handleConfirmPunchOut = () => {
    if (!currentEmployeeId) return
    punchOut(currentEmployeeId, materials); setShowPunchOut(false); setMaterials([])
  }
  const addMaterial = () => setMaterials([...materials, { id: Date.now().toString(), material: '', squareFeet: 0, pricePerSqFt: 0, total: 0 }])
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
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month - 1, d))
    return days
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ÉCRAN SÉLECTION
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
        <style>{`
          @keyframes decoSelectFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          .emp-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
          .emp-card:active { transform: scale(0.97); }
        `}</style>

        <div style={{ textAlign: 'center' }}>
          <h1 className="metal-text" style={{
            fontSize: '22px', fontWeight: '900', letterSpacing: '4px',
            ...(isDeco ? {} : { color: 'var(--primary)' })
          }}>
            HAILITE XTERIORS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', letterSpacing: '1px' }}>
            {t('Sélectionnez votre profil', 'Select your profile')}
          </p>
        </div>

        {isDeco && (
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.5), transparent)' }} />
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: employees.filter(e => e.active).length > 3 ? '1fr 1fr' : '1fr',
          gap: '12px',
        }}>
          {employees.filter(e => e.active).map((emp, idx) => (
            <button
              key={emp.id}
              className="emp-card"
              onClick={() => handleSelectEmployee(emp.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', borderRadius: '14px', cursor: 'pointer',
                border: isDeco ? '1px solid rgba(214,178,94,0.25)' : '1px solid var(--border)',
                background: isDeco ? '#111109' : 'var(--card)',
                textAlign: 'left' as const,
                animation: `decoSelectFade 0.4s ease ${idx * 0.08}s both`,
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`,
                boxShadow: `0 0 20px ${emp.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0,
              }}>
                {emp.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '700' }}>{emp.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                  {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                </p>
              </div>
              {activeSessions[emp.id] && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0 }} />
              )}
              {isDeco && (
                <div style={{ color: 'rgba(214,178,94,0.5)', fontSize: '16px' }}>›</div>
              )}
            </button>
          ))}
        </div>

        {isDeco && (
          <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '3px', color: 'rgba(214,178,94,0.3)', fontWeight: '700' }}>
            🔒 CONNECTEZ-VOUS POUR ACCÉDER
          </p>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ÉCRAN PIN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '24px' }}>
        <button
          onClick={() => setScreen('select')}
          style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', letterSpacing: '1px' }}
        >
          ← {t('Retour', 'Back')}
        </button>

        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '800', color: 'white',
          boxShadow: `0 0 30px ${emp?.color}66`,
        }}>
          {emp?.name[0].toUpperCase()}
        </div>

        <p style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700', letterSpacing: '2px' }}>{emp?.name}</p>

        {isDeco && (
          <div style={{ height: '1px', width: '120px', background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.5), transparent)' }} />
        )}

        <div style={{ display: 'flex', gap: '16px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: pin.length > i
                ? pinError ? '#ef4444' : (isDeco ? '#D6B25E' : 'var(--primary)')
                : 'var(--surface)',
              border: `2px solid ${pinError ? '#ef4444' : isDeco ? 'rgba(214,178,94,0.4)' : 'var(--border)'}`,
              transition: 'all 0.2s',
              boxShadow: pin.length > i
                ? isDeco ? '0 0 12px rgba(214,178,94,0.6)' : '0 0 12px var(--primary)'
                : 'none',
            }} />
          ))}
        </div>

        {pinError && (
          <p style={{ color: '#ef4444', fontSize: '13px', letterSpacing: '1px' }}>
            {t('PIN incorrect', 'Incorrect PIN')}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', width: '100%', maxWidth: '280px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button
              key={i}
              onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d !== '') handlePinDigit(d) }}
              style={{
                height: '64px', borderRadius: '12px',
                cursor: d ? 'pointer' : 'default',
                border: isDeco ? '1px solid rgba(214,178,94,0.2)' : '1px solid var(--border)',
                background: d
                  ? isDeco ? '#111109' : 'var(--card)'
                  : 'transparent',
                color: 'var(--text)',
                fontSize: d === '⌫' ? '20px' : '24px',
                fontWeight: '700',
                opacity: d ? 1 : 0,
                transition: 'all 0.15s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════════
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
  const revenue = activeSession?.revenue || 0
  const formattedRevenue = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>
      <style>{`
        @keyframes goldShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes coinFall {
          0%   { transform: translateY(-10px); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(50px);  opacity: 0; }
        }
        @keyframes statusPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.6; transform:scale(0.8); }
        }
        .coin-fall { position:absolute; font-size:12px; pointer-events:none; animation:coinFall 2s infinite; }
        .status-dot { animation: statusPulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER EMPLOYÉ ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isDeco ? '12px 16px' : '8px 0',
        background: isDeco ? '#0A0B0B' : 'transparent',
        border: isDeco ? '1px solid rgba(214,178,94,0.20)' : 'none',
        borderRadius: isDeco ? '12px' : '0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${currentEmployee?.color}99, ${currentEmployee?.color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: 'white',
            boxShadow: `0 0 16px ${currentEmployee?.color}55`,
          }}>
            {currentEmployee?.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{
              fontSize: '14px', fontWeight: '800',
              color: isDeco ? '#F4E8C1' : 'var(--text)',
              letterSpacing: isDeco ? '1px' : '0',
            }}>
              {currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' }}>
              {isDeco ? (
                <span style={{ letterSpacing: '1px', fontSize: '9px', color: 'rgba(214,178,94,0.6)', fontWeight: '700' }}>
                  {activeSession ? 'EN SERVICE' : 'HORS SERVICE'}
                </span>
              ) : (
                activeProjectLog ? `🏗️ ${activeProjectLog.project.name}` : currentEmployee?.workMode
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
            border: isDeco ? '1px solid rgba(214,178,94,0.25)' : '1px solid var(--border)',
            background: 'transparent',
            color: isDeco ? 'rgba(214,178,94,0.6)' : 'var(--text-muted)',
            fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
          }}
        >
          {t('SORTIR', 'LOGOUT')}
        </button>
      </div>

      {/* ── CARTES TAUX + STATUT (style Concept 13) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Taux */}
        <div style={{
          ...activeCard,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: `1px solid ${isDeco ? 'rgba(214,178,94,0.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '16px' }}>$</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px',
              color: isDeco ? 'rgba(214,178,94,0.6)' : 'var(--text-muted)',
              textTransform: 'uppercase', marginBottom: '2px',
            }}>
              {t('TAUX STANDARD', 'STANDARD RATE')}
            </p>
            {editingRate ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={tempRate}
                  onChange={e => setTempRate(e.target.value)}
                  autoFocus
                  style={{
                    width: '60px', background: 'transparent',
                    border: 'none', borderBottom: `1px solid ${isDeco ? '#D6B25E' : 'var(--primary)'}`,
                    color: isDeco ? '#D6B25E' : 'var(--primary)',
                    fontSize: '16px', fontWeight: '900', outline: 'none', padding: '2px',
                  }}
                />
                <button onClick={() => {
                  if (currentEmployeeId && tempRate) updateEmployee(currentEmployeeId, { hourlyRate: parseFloat(tempRate) })
                  setEditingRate(false)
                }} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '16px' }}>✓</button>
              </div>
            ) : (
              <p
                onClick={() => { setTempRate(String(currentEmployee?.hourlyRate ?? 45)); setEditingRate(true) }}
                style={{
                  fontSize: '16px', fontWeight: '900', cursor: 'pointer',
                  color: isDeco ? '#D6B25E' : 'var(--primary)',
                }}
              >
                CAD {currentEmployee?.hourlyRate ?? 45}.00 / h
              </p>
            )}
          </div>
          <span style={{ color: isDeco ? 'rgba(214,178,94,0.4)' : 'var(--text-weak)', fontSize: '18px' }}>›</span>
        </div>

        {/* Statut */}
        <div style={{
          ...activeCard,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: `1px solid ${isDeco ? 'rgba(214,178,94,0.4)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '16px' }}>⏱</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px',
              color: isDeco ? 'rgba(214,178,94,0.6)' : 'var(--text-muted)',
              textTransform: 'uppercase', marginBottom: '2px',
            }}>
              STATUT
            </p>
            <p style={{
              fontSize: '13px', fontWeight: '900',
              color: isRunning
                ? (isOnBreak ? '#f97316' : (isDeco ? '#6FAF5A' : 'var(--success)'))
                : (isDeco ? '#F4E8C1' : 'var(--text)'),
              letterSpacing: '1px',
            }}>
              {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}
            </p>
          </div>
          <span style={{ color: isDeco ? 'rgba(214,178,94,0.4)' : 'var(--text-weak)', fontSize: '18px' }}>›</span>
        </div>
      </div>

      {/* ── REVENUS + TEMPS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
        {/* Revenus */}
        <div style={{
          ...activeCard,
          position: 'relative', overflow: 'hidden',
          background: isDeco
            ? 'linear-gradient(135deg, #1a1200, #2a1f00, #1a1200)'
            : 'var(--card)',
        }}>
          {isDeco && revenue > 0 && [
            { left: '15%', delay: '0s' },
            { left: '50%', delay: '0.9s' },
            { left: '80%', delay: '1.6s' },
          ].map((coin, i) => (
            <span key={i} className="coin-fall" style={{ left: coin.left, top: 0, animationDelay: coin.delay }}>🪙</span>
          ))}
          <p style={{
            fontSize: '9px', fontWeight: '800', letterSpacing: '2px',
            color: isDeco ? 'rgba(214,178,94,0.7)' : 'var(--text-muted)',
            textTransform: 'uppercase', marginBottom: '8px', position: 'relative', zIndex: 1,
          }}>
            {t('💰 REVENUS', '💰 REVENUE')}
          </p>
          <p style={{
            fontSize: '28px', fontWeight: '900', lineHeight: 1, fontFamily: 'monospace',
            position: 'relative', zIndex: 1,
            background: isDeco
              ? 'linear-gradient(90deg, #C49A3C, #F2D27A, #FFE9A0, #F2D27A, #C49A3C)'
              : 'none',
            backgroundSize: isDeco ? '200% auto' : 'none',
            WebkitBackgroundClip: isDeco ? 'text' : 'none',
            backgroundClip: isDeco ? 'text' : 'none',
            WebkitTextFillColor: isDeco ? 'transparent' : 'inherit',
            color: isDeco ? 'transparent' : 'var(--primary)',
            animation: isDeco ? 'goldShimmer 3s linear infinite' : 'none',
          }}>
            {formattedRevenue}
          </p>
          <p style={{ fontSize: '9px', color: isDeco ? 'rgba(214,178,94,0.4)' : 'var(--text-weak)', marginTop: '4px', position: 'relative', zIndex: 1 }}>CAD</p>
        </div>

        {/* Temps */}
        <div style={{ ...activeCard, display: 'flex', flexDirection: 'column' }}>
          <p style={{
            fontSize: '9px', fontWeight: '800', letterSpacing: '2px',
            color: isDeco ? 'rgba(214,178,94,0.7)' : 'var(--primary)',
            textTransform: 'uppercase', marginBottom: '8px',
          }}>
            {t('⏱ TEMPS', '⏱ TIME')}
          </p>
          <p style={{
            color: 'var(--text)', fontSize: '20px', fontWeight: '900',
            fontFamily: 'monospace', lineHeight: 1.1,
          }}>
            {formatTimer(activeSession?.elapsed || 0)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
            <div className="status-dot" style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : '#555',
              flexShrink: 0,
            }} />
            <p style={{
              fontSize: '9px', fontWeight: '700', letterSpacing: '1px',
              color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : 'var(--text-muted)',
            }}>
              {isOnBreak ? 'PAUSE' : isRunning ? 'ACTIF' : 'ATTENTE'}
            </p>
          </div>
        </div>
      </div>

      {/* ── BOUTON PUNCH ── */}
      <PunchButton
        isRunning={isRunning}
        isOnBreak={isOnBreak}
        onPunch={isRunning ? handlePunchOut : handlePunchIn}
        elapsed={activeSession?.elapsed || 0}
        revenue={activeSession?.revenue || 0}
      />

      {/* ── PRÊT À POINÇONNER ── */}
      {!isRunning && isDeco && (
        <p style={{
          textAlign: 'center', fontSize: '11px', letterSpacing: '3px',
          color: '#6FAF5A', fontWeight: '700',
        }}>
          ● {t('PRÊT À POINÇONNER', 'READY TO PUNCH')}
        </p>
      )}

      {/* ── PAUSE / REPRENDRE ── */}
      {isRunning && !isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => startBreak(currentEmployeeId)}
            style={{
              borderRadius: '999px',
              border: `2px solid ${isDeco ? 'rgba(214,178,94,0.5)' : 'var(--warning)'}`,
              color: isDeco ? '#D6B25E' : 'var(--warning)',
              background: 'transparent',
              padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: '800',
              letterSpacing: '2px',
            }}
          >
            {t('☕ PAUSE', '☕ BREAK')}
          </button>
        </div>
      )}
      {isRunning && isOnBreak && currentEmployeeId && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => endBreak(currentEmployeeId)}
            style={{
              borderRadius: '999px',
              border: `2px solid ${isDeco ? '#6FAF5A' : 'var(--success)'}`,
              color: isDeco ? '#6FAF5A' : 'var(--success)',
              background: 'transparent',
              padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: '800',
              letterSpacing: '2px',
            }}
          >
            {t('▶ REPRENDRE', '▶ RESUME')}
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      {showPunchModal && currentEmployee && (
        <PunchInModal
          employeeId={currentEmployee.id}
          employeeName={currentEmployee.name}
          employeeHourlyRate={currentEmployee.hourlyRate ?? 45}
          mode={punchModalMode}
          onComplete={handlePunchModalComplete}
          onCancel={() => setShowPunchModal(false)}
        />
      )}

      {showPunchOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh', overflowY: 'auto' as const }}>
            <h2 style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: '800' }}>📐 {t('Matériaux posés', 'Materials installed')}</h2>
            {materials.map(m => (
              <div key={m.id} style={{ background: 'var(--card)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={m.material} onChange={e => updateMaterial(m.id, 'material', e.target.value)} placeholder={t('Matériau...', 'Material...')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet} onChange={e => updateMaterial(m.id, 'squareFeet', Number(e.target.value))} placeholder="Pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }} />
                  <input type="number" value={m.pricePerSqFt} onChange={e => updateMaterial(m.id, 'pricePerSqFt', Number(e.target.value))} placeholder="$/pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }} />
                </div>
                <p style={{ color: 'var(--secondary)', fontSize: '13px', fontWeight: '700' }}>Total: {formatCurrency(m.total)}</p>
              </div>
            ))}
            <button onClick={addMaterial} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '13px', fontWeight: '700' }}>+ {t('Ajouter', 'Add')}</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700' }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: '700' }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDRIER ── */}
      <div style={{
        ...activeCard,
        padding: '16px',
      }}>
        {isDeco && (
          <div style={{ position: 'absolute', top: -1, left: -1, width: '16px', height: '16px', borderTop: '1.5px solid rgba(214,178,94,0.6)', borderLeft: '1.5px solid rgba(214,178,94,0.6)', borderRadius: '2px 0 0 0', pointerEvents: 'none' }} />
        )}
        {isDeco && (
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: '16px', height: '16px', borderBottom: '1.5px solid rgba(214,178,94,0.6)', borderRight: '1.5px solid rgba(214,178,94,0.6)', borderRadius: '0 0 2px 0', pointerEvents: 'none' }} />
        )}

        {/* Navigation mois */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m-2).toISOString().slice(0,7)) }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', borderRadius: '8px', width: '32px', height: '32px',
              cursor: 'pointer', fontSize: '16px',
            }}
          >‹</button>
          <p style={{
            fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' as const,
            letterSpacing: isDeco ? '3px' : '1px',
            color: isDeco ? '#D6B25E' : 'var(--text)',
          }}>
            {monthLabel}
          </p>
          <button
            onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m).toISOString().slice(0,7)) }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', borderRadius: '8px', width: '32px', height: '32px',
              cursor: 'pointer', fontSize: '16px',
            }}
          >›</button>
        </div>

        {/* Jours de la semaine */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {(lang === 'fr' ? ['DI','LU','MA','ME','JE','VE','SA'] : ['SU','MO','TU','WE','TH','FR','SA']).map(d => (
            <div key={d} style={{
              textAlign: 'center' as const, fontSize: '9px',
              color: isDeco ? 'rgba(214,178,94,0.5)' : 'var(--text-muted)',
              fontWeight: '800', padding: '4px 0', letterSpacing: '1px',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cases du calendrier */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const dateKey = day.toISOString().split('T')[0]
            const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(dateKey)}
                style={{
                  minHeight: '42px', borderRadius: '6px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                  border: isToday
                    ? isDeco ? '2px solid rgba(214,178,94,0.8)' : '2px solid var(--primary)'
                    : isDeco ? '1px solid rgba(214,178,94,0.12)' : '1px solid var(--border)',
                  background: isToday
                    ? isDeco ? 'rgba(214,178,94,0.08)' : 'var(--primary)22'
                    : detail
                    ? isDeco ? 'rgba(111,175,90,0.12)' : 'var(--primary)11'
                    : isDeco ? '#0A0B0B' : 'var(--surface)',
                  boxShadow: isToday && isDeco ? '0 0 10px rgba(214,178,94,0.25), inset 0 0 8px rgba(214,178,94,0.06)' : 'none',
                }}
              >
                <span style={{
                  fontSize: '11px',
                  color: isToday
                    ? isDeco ? '#D6B25E' : 'var(--primary)'
                    : isDeco ? 'rgba(244,232,193,0.7)' : 'var(--text-muted)',
                  fontWeight: isToday ? '900' : '500',
                }}>
                  {day.getDate()}
                </span>
                {detail && (
                  <span style={{ fontSize: '7px', color: isDeco ? '#6FAF5A' : 'var(--success)', fontWeight: '700' }}>
                    {formatCurrency(detail.totalRevenue)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── LÉGENDE ── */}
      <div style={activeCard}>
        {isDeco && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.4))' }} />
            <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '4px', color: 'rgba(214,178,94,0.7)', whiteSpace: 'nowrap' }}>
              {t('LÉGENDE', 'LEGEND')}
            </p>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(214,178,94,0.4), transparent)' }} />
          </div>
        )}
        {!isDeco && (
          <p style={{ color: 'var(--primary)', fontSize: '11px', letterSpacing: '3px', fontWeight: '700', marginBottom: '12px' }}>
            {t('LÉGENDE', 'LEGEND')}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { emoji: '⛱️', fr: 'Congé',         en: 'Day off',    color: '#06b6d4' },
            { emoji: '🌙', fr: 'Petite j.',      en: 'Short',      color: '#64748b' },
            { emoji: '📋', fr: 'Moy.',           en: 'Average',    color: '#3b82f6' },
            { emoji: '✅', fr: 'Normale',        en: 'Normal',     color: '#22c55e' },
            { emoji: '⭐', fr: 'Bonne j.',       en: 'Good',       color: '#eab308' },
            { emoji: '🔥', fr: 'Grosse j.',      en: 'Big',        color: '#f97316' },
            { emoji: '💎', fr: 'Très grosse j.', en: 'Huge',       color: '#a855f7' },
          ].map(item => (
            <div key={item.emoji} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px', borderRadius: '8px',
              background: isDeco ? 'rgba(0,0,0,0.3)' : `${item.color}15`,
              border: isDeco ? `1px solid ${item.color}33` : `1px solid ${item.color}25`,
            }}>
              <span style={{ fontSize: '16px' }}>{item.emoji}</span>
              <p style={{
                color: isDeco ? item.color : 'var(--text)',
                fontSize: '11px', fontWeight: '700',
                letterSpacing: isDeco ? '0.5px' : '0',
              }}>
                {t(item.fr, item.en)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL DÉTAIL JOURNÉE ── */}
      {selectedDay && (() => {
        const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${selectedDay}`] : null
        const emp = currentEmployee
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '85vh', overflowY: 'auto' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800' }}>📅 {selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} style={{ color: 'var(--text-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              {!detail ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' as const, padding: '20px' }}>{t('Aucune donnée', 'No data')}</p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: t('Heures', 'Hours'),    value: `${detail.totalHours.toFixed(2)}h`,  color: 'var(--primary)' },
                      { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: '#FFD700'         },
                      { label: t('Pauses', 'Breaks'),   value: formatTimer(detail.totalBreak),       color: '#f97316'         },
                      { label: 'Sessions',              value: `${detail.sessions.length}`,          color: 'var(--info)'    },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--card)', borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px' }}>{item.label}</p>
                        <p style={{ color: item.color, fontSize: '18px', fontWeight: '800' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {detail.sessions.length > 0 && (
                    <div style={{ background: 'var(--card)', borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: 'var(--primary)', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px', fontWeight: '700' }}>SESSIONS</p>
                      {detail.sessions.map((session, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {new Date(session.startTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                            {session.endTime && ` → ${new Date(session.endTime).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span style={{ color: 'var(--secondary)', fontSize: '12px', fontWeight: '700' }}>{formatTimer(session.elapsed)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.materials && detail.materials.length > 0 && (
                    <div style={{ background: 'var(--card)', borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: 'var(--primary)', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px', fontWeight: '700' }}>📐 {t('MATÉRIAUX', 'MATERIALS')}</p>
                      {detail.materials.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                          <div>
                            <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: '600' }}>{m.material}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                              {(m as unknown as Record<string,number>).squareFeet ?? 0} pi² × ${(m as unknown as Record<string,number>).pricePerSqFt ?? 0}/pi²
                            </p>
                          </div>
                          <span style={{ color: 'var(--secondary)', fontSize: '14px', fontWeight: '700' }}>{formatCurrency(m.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>
                    Mode: <strong style={{ color: 'var(--primary)' }}>{emp?.workMode}</strong> — ${emp?.hourlyRate}/h
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
