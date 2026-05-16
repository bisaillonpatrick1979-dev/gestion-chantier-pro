'use client'
import { useState, useEffect, useRef } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useGoalStore, xpForLevel } from '@/store/useGoalStore'
import { useProjectStore } from '@/store/useProjectStore'
import { formatCurrency, formatTimer } from '@/lib/formatters'
import { MaterialEntry } from '@/types/employee'
import { useLangStore } from '@/store/useLangStore'
import PunchInModal from '@/components/PunchInModal'
import PunchButton from '@/components/PunchButton'
import {
  DecoSeparator, DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow, DecoFlower, DecoStarRow,
} from '@/components/DecoElements'

type Screen = 'select' | 'pin' | 'dashboard'

// ── Robot SVG animé ───────────────────────────────────────────────────────────
function XPRobot({ percent, message }: { percent: number; message: string }) {
  const happy = percent >= 80
  const ok = percent >= 40
  const eyeColor = happy ? '#22d3ee' : ok ? '#a855f7' : '#6b7280'
  const bodyColor = happy ? '#7c3aed' : ok ? '#4c1d95' : '#1e1b4b'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <style>{`
        @keyframes robotFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes robotWave {
          0%,100% { transform: rotate(0deg); transform-origin: bottom center; }
          25% { transform: rotate(-20deg); transform-origin: bottom center; }
          75% { transform: rotate(20deg); transform-origin: bottom center; }
        }
        @keyframes robotBlink {
          0%,90%,100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes robotTalk {
          0%,100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        @keyframes bubblePop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .robot-body { animation: robotFloat 3s ease-in-out infinite; }
        .robot-arm-right { animation: robotWave 1.5s ease-in-out infinite; transform-origin: top left; }
        .robot-eye { animation: robotBlink 4s ease-in-out infinite; transform-origin: center; }
        .robot-mouth { animation: robotTalk 0.8s ease-in-out infinite; transform-origin: center; }
        .bubble { animation: bubblePop 0.3s ease-out forwards; }
      `}</style>

      <div style={{ position: 'relative' }}>
        {/* Bulle de dialogue */}
        <div className="bubble" style={{
          position: 'absolute', top: '-36px', left: '50%',
          transform: 'translateX(-50%)',
          background: happy ? '#7c3aed' : ok ? '#4c1d95' : '#1e1b4b',
          border: `1px solid ${happy ? '#a855f7' : '#6b21a8'}`,
          borderRadius: '10px', padding: '4px 10px',
          fontSize: '10px', fontWeight: 700, color: '#e9d5ff',
          whiteSpace: 'nowrap', letterSpacing: '0.5px',
          boxShadow: '0 0 12px rgba(168,85,247,0.4)',
        }}>
          {message}
          <div style={{
            position: 'absolute', bottom: '-6px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${happy ? '#7c3aed' : '#4c1d95'}`,
          }}/>
        </div>

        {/* Robot SVG */}
        <svg className="robot-body" width="80" height="90" viewBox="0 0 80 90" fill="none">
          {/* Antenne */}
          <line x1="40" y1="8" x2="40" y2="18" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="40" cy="6" r="4" fill={happy ? '#22d3ee' : '#a855f7'}
            style={{ filter: `drop-shadow(0 0 4px ${happy ? '#22d3ee' : '#a855f7'})` }}/>

          {/* Tête */}
          <rect x="22" y="18" width="36" height="28" rx="8" fill={bodyColor}
            stroke="#a855f7" strokeWidth="1.5"/>
          {/* Yeux */}
          <g className="robot-eye">
            <rect x="28" y="26" width="8" height="8" rx="2" fill={eyeColor}
              style={{ filter: `drop-shadow(0 0 4px ${eyeColor})` }}/>
          </g>
          <g className="robot-eye" style={{ animationDelay: '0.2s' }}>
            <rect x="44" y="26" width="8" height="8" rx="2" fill={eyeColor}
              style={{ filter: `drop-shadow(0 0 4px ${eyeColor})` }}/>
          </g>
          {/* Bouche */}
          <g className="robot-mouth">
            {happy ? (
              <path d="M30 38 Q40 44 50 38" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round"/>
            ) : ok ? (
              <line x1="30" y1="41" x2="50" y2="41" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <path d="M30 43 Q40 38 50 43" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
            )}
          </g>

          {/* Corps */}
          <rect x="24" y="50" width="32" height="26" rx="6" fill={bodyColor}
            stroke="#7c3aed" strokeWidth="1.5"/>
          {/* Détails corps — logo XP */}
          <text x="40" y="67" textAnchor="middle" fontSize="10" fontWeight="900"
            fill={happy ? '#22d3ee' : '#a855f7'}
            style={{ filter: `drop-shadow(0 0 3px ${happy ? '#22d3ee' : '#a855f7'})` }}>
            XP
          </text>

          {/* Bras gauche */}
          <rect x="10" y="52" width="12" height="8" rx="4" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.2"/>
          <circle cx="10" cy="56" r="4" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.2"/>

          {/* Bras droit — animé */}
          <g className="robot-arm-right" style={{ transformOrigin: '68px 52px' }}>
            <rect x="58" y="50" width="12" height="8" rx="4" fill={bodyColor} stroke="#a855f7" strokeWidth="1.2"/>
            <circle cx="70" cy="54" r="4" fill={bodyColor} stroke="#a855f7" strokeWidth="1.2"/>
            {/* Main qui fait signe */}
            <line x1="70" y1="50" x2="72" y2="44" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="70" y1="50" x2="75" y2="46" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="70" y1="50" x2="74" y2="50" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
          </g>

          {/* Jambes */}
          <rect x="28" y="76" width="10" height="10" rx="3" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.2"/>
          <rect x="42" y="76" width="10" height="10" rx="3" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.2"/>
          {/* Pieds */}
          <ellipse cx="33" cy="87" rx="7" ry="3" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1"/>
          <ellipse cx="47" cy="87" rx="7" ry="3" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  )
}

// ── Ouvrier SVG animé ─────────────────────────────────────────────────────────
function WorkerCharacter({ isWorking }: { isWorking: boolean }) {
  return (
    <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
      <style>{`
        @keyframes workerNod {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes workerWork {
          0%,100% { transform: rotate(-5deg); transform-origin: bottom center; }
          50% { transform: rotate(5deg); transform-origin: bottom center; }
        }
        .worker-head { animation: workerNod 2s ease-in-out infinite; }
        .worker-arm { animation: workerWork 0.8s ease-in-out infinite; }
      `}</style>

      {/* Casque */}
      <ellipse cx="30" cy="14" rx="16" ry="10" fill="#f59e0b"/>
      <rect x="14" y="18" width="32" height="6" rx="2" fill="#d97706"/>
      {/* Visage */}
      <g className="worker-head">
        <circle cx="30" cy="26" r="12" fill="#fbbf24"/>
        <circle cx="26" cy="24" r="2" fill="#1e1b4b"/>
        <circle cx="34" cy="24" r="2" fill="#1e1b4b"/>
        {isWorking ? (
          <path d="M25 31 Q30 35 35 31" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        ) : (
          <path d="M25 32 Q30 28 35 32" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        )}
      </g>
      {/* Corps — gilet orange */}
      <rect x="18" y="38" width="24" height="22" rx="4" fill="#ea580c"/>
      <line x1="30" y1="38" x2="30" y2="60" stroke="#fed7aa" strokeWidth="2"/>
      {/* Bras */}
      {isWorking ? (
        <g className="worker-arm">
          <rect x="6" y="40" width="10" height="6" rx="3" fill="#fbbf24"/>
          <rect x="44" y="40" width="10" height="6" rx="3" fill="#fbbf24"/>
        </g>
      ) : (
        <>
          <rect x="6" y="42" width="10" height="6" rx="3" fill="#fbbf24"/>
          <rect x="44" y="42" width="10" height="6" rx="3" fill="#fbbf24"/>
        </>
      )}
      {/* Jambes */}
      <rect x="20" y="60" width="9" height="8" rx="2" fill="#1e40af"/>
      <rect x="31" y="60" width="9" height="8" rx="2" fill="#1e40af"/>
    </svg>
  )
}

// ── Barre XP ──────────────────────────────────────────────────────────────────
function XPBar({ current, max, color = '#a855f7' }: { current: number; max: number; color?: string }) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div style={{ width: '100%', height: '10px', background: 'rgba(168,85,247,0.2)', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        height: '100%', borderRadius: '999px', width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, #22d3ee)`,
        boxShadow: `0 0 10px ${color}88`,
        transition: 'width 1s ease',
        position: 'relative',
      }}>
        {/* Shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'xpShimmer 2s linear infinite',
          borderRadius: '999px',
        }}/>
      </div>
    </div>
  )
}

// ── Hexagone badge ────────────────────────────────────────────────────────────
function HexBadge({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '52px', height: '52px',
        background: `${color}22`,
        border: `2px solid ${color}66`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px',
        boxShadow: `0 0 12px ${color}44`,
        position: 'relative',
      }}>
        {icon}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}11, transparent)`,
        }}/>
      </div>
      <p style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.5px' }}>{value}</p>
      <p style={{ fontSize: '9px', color: '#6b7280', letterSpacing: '0.5px' }}>{label}</p>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function HomePage() {
  const {
    employees, currentEmployeeId, activeSessions,
    dayDetails, setCurrentEmployee, verifyPin,
    punchIn, punchOut, startBreak, endBreak, updateEmployee,
  } = useEmployeeStore()
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const { getGoal, setGoalTarget, updateProgress, updateStreak, addXP } = useGoalStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isXP = themeId === 'xp'

  const [screen, setScreen] = useState<'select' | 'pin' | 'dashboard'>('select')
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
  const [editingGoal, setEditingGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const prevRevenueRef = useRef(0)

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const activeSession = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const isRunning = !!activeSession
  const isOnBreak = activeSession?.isOnBreak ?? false
  const activeProjectLog = currentEmployeeId ? getActiveLogForEmployee(currentEmployeeId) : null
  const today = new Date().toISOString().split('T')[0]
  const goal = currentEmployeeId ? getGoal(currentEmployeeId) : null
  const goalPct = goal ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
  const xpToNext = goal ? xpForLevel(goal.level + 1) - goal.xpPoints : 0

  // Détecter quand l'objectif est atteint
  useEffect(() => {
    if (!goal || !currentEmployeeId) return
    const prevRevenue = prevRevenueRef.current
    if (prevRevenue < goal.targetAmount && goal.currentAmount >= goal.targetAmount) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
    prevRevenueRef.current = goal.currentAmount
  }, [goal?.currentAmount])

  // Message robot selon progression
  const robotMessage = !goal ? '👋 Salut!' :
    goalPct >= 100 ? '🎉 OBJECTIF!' :
    goalPct >= 80 ? '🔥 Presque!' :
    goalPct >= 50 ? '💪 Continue!' :
    goalPct >= 20 ? '⚡ En route!' :
    '🎯 Allons-y!'

  const card: React.CSSProperties = {
    background: isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)',
    border: isXP ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--border)',
    borderRadius: '14px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelectEmployee = (id: string) => { setSelectedId(id); setPin(''); setPinError(false); setScreen('pin') }
  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) {
        setCurrentEmployee(selectedId); setScreen('dashboard'); setPinError(false)
        updateStreak(selectedId)
        addXP(selectedId, 50)
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
    if (currentEmployee?.workMode === 'surface') setShowPunchOut(true)
    else punchOut(currentEmployeeId)
  }
  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') {
      punchIn(currentEmployeeId)
      addXP(currentEmployeeId, 25)
    } else {
      const earned = activeSession?.revenue || 0
      punchOut(currentEmployeeId, materials)
      setMaterials([])
      if (earned > 0) updateProgress(currentEmployeeId, earned)
      addXP(currentEmployeeId, Math.floor(earned / 10) + 100)
    }
  }
  const handleConfirmPunchOut = () => {
    if (!currentEmployeeId) return
    const earned = materials.reduce((s, m) => s + m.total, 0)
    punchOut(currentEmployeeId, materials)
    setShowPunchOut(false); setMaterials([])
    if (earned > 0) updateProgress(currentEmployeeId, earned)
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

  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
  const revenue = activeSession?.revenue || 0
  const formattedRevenue = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)

  // ══ SÉLECTION ══════════════════════════════════════════════════════════════
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
        <style>{`
          @keyframes xpShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes neonPulse { 0%,100%{box-shadow:0 0 10px #a855f7,0 0 20px #a855f7aa} 50%{box-shadow:0 0 20px #a855f7,0 0 40px #a855f7} }
          @keyframes starTwinkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
          @keyframes floatUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
          @keyframes celebrate { 0%{transform:scale(1)} 50%{transform:scale(1.05)} 100%{transform:scale(1)} }
          .emp-card:active{transform:scale(0.97)}
          .emp-card{transition:transform 0.15s ease}
          .neon-btn{animation:neonPulse 2s ease-in-out infinite}
          .star-twinkle{animation:starTwinkle 2s ease-in-out infinite}
        `}</style>

        {isXP ? (
          <>
            {/* Header gaming */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎮</div>
              <h1 style={{
                fontSize: '24px', fontWeight: 900, letterSpacing: '3px',
                background: 'linear-gradient(90deg, #a855f7, #22d3ee, #a855f7)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'xpShimmer 3s linear infinite',
              }}>
                HAILITE XTERIORS
              </h1>
              <p style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '3px', marginTop: '4px' }}>
                GAMING EDITION
              </p>
            </div>

            {/* Étoiles décoratives */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0' }}>
              {['⭐','✨','💜','✨','⭐'].map((s, i) => (
                <span key={i} className="star-twinkle" style={{ fontSize: '14px', animationDelay: `${i * 0.3}s` }}>{s}</span>
              ))}
            </div>
          </>
        ) : (
          <>
            <DecoOrnament opacity={0.12}/>
            <div style={{ textAlign: 'center' }}>
              <h1 className="metal-text" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '4px' }}>HAILITE XTERIORS</h1>
              <DecoDiamondRow count={5} opacity={0.3}/>
            </div>
          </>
        )}

        <DecoSeparator opacity={isXP ? 0.1 : 0.25}/>

        <div style={{ display: 'grid', gridTemplateColumns: employees.filter(e => e.active).length > 3 ? '1fr 1fr' : '1fr', gap: '10px' }}>
          {employees.filter(e => e.active).map((emp, idx) => {
            const empGoal = getGoal(emp.id)
            return (
              <button key={emp.id} className="emp-card" onClick={() => handleSelectEmployee(emp.id)} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', borderRadius: '16px', cursor: 'pointer',
                border: isXP ? '1px solid rgba(168,85,247,0.35)' : '1px solid var(--border)',
                background: isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)',
                textAlign: 'left' as const, position: 'relative', overflow: 'hidden',
                animation: `floatUp 0.4s ease ${idx * 0.1}s both`,
              }}>
                {!isXP && <DecoBackground/>}
                {!isXP && <DecoCorners opacity={0.3}/>}
                {isXP && (
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(168,85,247,0.08), transparent 60%)', pointerEvents: 'none' }}/>
                )}
                <div style={{
                  width: '46px', height: '46px', borderRadius: isXP ? '12px' : '50%', flexShrink: 0,
                  background: isXP
                    ? `linear-gradient(135deg, ${emp.color}, #a855f7)`
                    : `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`,
                  boxShadow: isXP ? `0 0 16px ${emp.color}66` : `0 0 18px ${emp.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 800, color: 'white', position: 'relative', zIndex: 1,
                }}>{emp.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <p style={{ color: isXP ? '#e9d5ff' : 'var(--text)', fontSize: '15px', fontWeight: 700 }}>{emp.name}</p>
                  {isXP ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.3)', color: '#a855f7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Nv.{empGoal.level}
                      </span>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>{empGoal.xpPoints} XP</span>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      {emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}
                    </p>
                  )}
                </div>
                {activeSessions[emp.id] && (
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0, position: 'relative', zIndex: 1 }}/>
                )}
                {isXP && <span style={{ color: '#a855f7', fontSize: '16px', position: 'relative', zIndex: 1 }}>›</span>}
              </button>
            )
          })}
        </div>

        {isXP ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#4c1d95', fontWeight: 700 }}>
              🎮 CHOISISSEZ VOTRE PERSONNAGE
            </p>
          </div>
        ) : (
          <>
            <DecoSeparator opacity={0.2}/>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.2 }}>
              <DecoFlower size={35} opacity={1}/><DecoFlower size={50} opacity={1}/><DecoFlower size={35} opacity={1}/>
            </div>
          </>
        )}
      </div>
    )
  }

  // ══ PIN ════════════════════════════════════════════════════════════════════
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingTop: '16px' }}>
        <button onClick={() => setScreen('select')} style={{ alignSelf: 'flex-start', color: isXP ? '#a855f7' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
          ← {t('Retour', 'Back')}
        </button>

        {isXP ? (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${emp?.color}, #a855f7)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 800, color: 'white',
              boxShadow: `0 0 30px ${emp?.color}66, 0 0 60px rgba(168,85,247,0.3)`,
            }}>{emp?.name[0].toUpperCase()}</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#e9d5ff', fontSize: '17px', fontWeight: 800, letterSpacing: '2px' }}>{emp?.name}</p>
              <p style={{ color: '#a855f7', fontSize: '11px', letterSpacing: '1px' }}>ENTREZ VOTRE CODE</p>
            </div>
          </>
        ) : (
          <>
            <DecoOrnament opacity={0.12}/>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white', boxShadow: `0 0 30px ${emp?.color}66` }}>
              {emp?.name[0].toUpperCase()}
            </div>
            <p style={{ color: 'var(--text)', fontSize: '17px', fontWeight: 700, letterSpacing: '2px' }}>{emp?.name}</p>
            <DecoDiamondRow count={5} opacity={0.3}/>
          </>
        )}

        <div style={{ display: 'flex', gap: '14px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: '18px', height: '18px', borderRadius: isXP ? '4px' : '50%',
              background: pin.length > i ? pinError ? '#ef4444' : (isXP ? '#a855f7' : 'var(--primary)') : (isXP ? 'rgba(168,85,247,0.15)' : 'var(--surface)'),
              border: `2px solid ${pinError ? '#ef4444' : isXP ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
              transition: 'all 0.2s',
              boxShadow: pin.length > i ? isXP ? '0 0 12px rgba(168,85,247,0.8)' : '0 0 12px var(--primary)' : 'none',
            }}/>
          ))}
        </div>

        {pinError && <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%', maxWidth: '260px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button key={i} onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d !== '') handlePinDigit(d) }} style={{
              height: '60px', borderRadius: isXP ? '12px' : '10px', cursor: d ? 'pointer' : 'default',
              border: isXP ? '1px solid rgba(168,85,247,0.25)' : '1px solid var(--border)',
              background: d ? (isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)') : 'transparent',
              color: isXP ? '#e9d5ff' : 'var(--text)',
              fontSize: d === '⌫' ? '18px' : '22px', fontWeight: 700, opacity: d ? 1 : 0,
              boxShadow: isXP && d ? '0 0 8px rgba(168,85,247,0.15)' : 'none',
            }}>{d}</button>
          ))}
        </div>
      </div>
    )
  }

  // ══ DASHBOARD ══════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
      <style>{`
        @keyframes xpShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes neonPulse {
          0%,100%{box-shadow:0 0 15px #a855f7,0 0 30px #a855f788,0 0 60px #a855f744}
          50%{box-shadow:0 0 25px #a855f7,0 0 50px #a855f7aa,0 0 100px #a855f766}
        }
        @keyframes neonPulseRed {
          0%,100%{box-shadow:0 0 15px #ef4444,0 0 30px #ef444488}
          50%{box-shadow:0 0 25px #ef4444,0 0 50px #ef4444aa}
        }
        @keyframes raysRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes raysRotateRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes coinFall { 0%{transform:translateY(-10px);opacity:0} 20%{opacity:1} 100%{transform:translateY(50px);opacity:0} }
        @keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.8)} }
        @keyframes celebrate { 0%{transform:scale(1) rotate(0deg)} 25%{transform:scale(1.1) rotate(-5deg)} 75%{transform:scale(1.1) rotate(5deg)} 100%{transform:scale(1) rotate(0deg)} }
        @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100px) rotate(360deg);opacity:0} }
        @keyframes floatUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes starTwinkle { 0%,100%{opacity:0.2} 50%{opacity:0.6} }
        .coin-fall{position:absolute;font-size:12px;pointer-events:none;animation:coinFall 2s infinite}
        .status-dot{animation:statusPulse 2s ease-in-out infinite}
        .neon-punch{animation:neonPulse 2.5s ease-in-out infinite}
        .neon-punch-out{animation:neonPulseRed 2s ease-in-out infinite}
        .star-bg{animation:starTwinkle 3s ease-in-out infinite}
        .celebrate-anim{animation:celebrate 0.5s ease-in-out infinite}
      `}</style>

      {/* Célébration objectif atteint */}
      {showCelebration && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-20px',
              fontSize: '20px',
              animation: `confettiFall ${1 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
            }}>
              {['🎉','⭐','💜','✨','🏆','💎'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
          <div style={{
            background: 'rgba(17,7,40,0.95)', border: '2px solid #a855f7',
            borderRadius: '20px', padding: '24px 32px', textAlign: 'center',
            boxShadow: '0 0 40px rgba(168,85,247,0.6)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
            <p style={{ color: '#a855f7', fontSize: '20px', fontWeight: 900, letterSpacing: '2px' }}>OBJECTIF ATTEINT!</p>
            <p style={{ color: '#e9d5ff', fontSize: '14px', marginTop: '4px' }}>+500 XP BONUS!</p>
          </div>
        </div>
      )}

      {/* Header employé */}
      <div style={{
        ...card,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: isXP ? 'rgba(17,7,40,0.95)' : 'var(--card)',
        border: isXP ? '1px solid rgba(168,85,247,0.4)' : '1px solid var(--border)',
      }}>
        {!isXP && <DecoBackground/>}
        {!isXP && <DecoCorners opacity={0.25}/>}
        {isXP && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.08), transparent)', pointerEvents: 'none' }}/>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: isXP ? '10px' : '50%', flexShrink: 0,
            background: isXP
              ? `linear-gradient(135deg, ${currentEmployee?.color}, #a855f7)`
              : `radial-gradient(circle at 40% 35%, ${currentEmployee?.color}99, ${currentEmployee?.color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: 800, color: 'white',
            boxShadow: isXP ? `0 0 16px ${currentEmployee?.color}55, 0 0 30px rgba(168,85,247,0.3)` : `0 0 14px ${currentEmployee?.color}55`,
          }}>{currentEmployee?.name[0].toUpperCase()}</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: isXP ? '#e9d5ff' : 'var(--text)' }}>
              {currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}
            </p>
            {isXP && goal ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', background: 'rgba(168,85,247,0.3)', color: '#a855f7', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>Nv.{goal.level}</span>
                <span style={{ fontSize: '9px', color: '#6b7280' }}>{goal.xpPoints} XP</span>
                <span style={{ fontSize: '9px', color: '#f59e0b' }}>🔥{goal.streak}j</span>
              </div>
            ) : (
              <p style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 700 }}>
                {activeSession ? (isOnBreak ? '☕ EN PAUSE' : '🟢 EN SERVICE') : '⏸ HORS SERVICE'}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
          border: isXP ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--border)',
          background: 'transparent',
          color: isXP ? '#a855f7' : 'var(--text-muted)',
          fontSize: '11px', fontWeight: 700, position: 'relative', zIndex: 1,
        }}>
          {t('SORTIR', 'LOGOUT')}
        </button>
      </div>

      {/* XP Bar niveau */}
      {isXP && goal && (
        <div style={{ ...card }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.05), transparent)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 900, color: 'white',
                  boxShadow: '0 0 12px rgba(168,85,247,0.5)',
                }}>{goal.level}</div>
                <div>
                  <p style={{ color: '#e9d5ff', fontSize: '13px', fontWeight: 800 }}>NIVEAU {goal.level}</p>
                  <p style={{ color: '#a855f7', fontSize: '10px' }}>{getLevelTitle(goal.level)}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <p style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 800 }}>{goal.xpPoints} XP</p>
                <p style={{ color: '#6b7280', fontSize: '10px' }}>{xpToNext} XP pour Nv.{goal.level + 1}</p>
              </div>
            </div>
            <XPBar current={goal.xpPoints} max={xpForLevel(goal.level + 1)} color="#a855f7"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '9px', color: '#4c1d95' }}>Nv.{goal.level}</span>
              <span style={{ fontSize: '9px', color: '#4c1d95' }}>Nv.{goal.level + 1}</span>
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      {isXP && goal && (
        <div style={{ ...card }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px', marginBottom: '12px' }}>🏅 BADGES</p>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <HexBadge label="Série" value={`${goal.streak}j`} color="#f59e0b" icon="🔥"/>
              <HexBadge label="Niveau" value={`${goal.level}`} color="#a855f7" icon="⭐"/>
              <HexBadge label="Total XP" value={`${goal.xpPoints}`} color="#22d3ee" icon="💎"/>
              <HexBadge label="Cette sem." value={formatCurrency(goal.currentAmount)} color="#22c55e" icon="💰"/>
            </div>
          </div>
        </div>
      )}

      {/* Taux + Statut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          {
            icon: '$',
            label: t('TAUX', 'RATE'),
            content: editingRate ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="number" value={tempRate} onChange={e => setTempRate(e.target.value)} autoFocus style={{ width: '55px', background: 'transparent', border: 'none', borderBottom: `1px solid ${isXP ? '#a855f7' : 'var(--primary)'}`, color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '15px', fontWeight: 900, outline: 'none' }}/>
                <button onClick={() => { if (currentEmployeeId && tempRate) updateEmployee(currentEmployeeId, { hourlyRate: parseFloat(tempRate) }); setEditingRate(false) }} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '15px' }}>✓</button>
              </div>
            ) : (
              <p onClick={() => { setTempRate(String(currentEmployee?.hourlyRate ?? 45)); setEditingRate(true) }} style={{ fontSize: '14px', fontWeight: 900, cursor: 'pointer', color: isXP ? '#a855f7' : 'var(--primary)' }}>
                ${currentEmployee?.hourlyRate ?? 45}/h
              </p>
            ),
          },
          {
            icon: '⏱',
            label: 'STATUT',
            content: (
              <p style={{ fontSize: '12px', fontWeight: 900, color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : (isXP ? '#4c1d95' : 'var(--text)'), letterSpacing: '0.5px' }}>
                {isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}
              </p>
            ),
          },
        ].map((item, i) => (
          <div key={i} style={{ ...card }}>
            {!isXP && <DecoBackground/>}
            {!isXP && <DecoCorners opacity={0.2}/>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: isXP ? '8px' : '50%',
                border: `1px solid ${isXP ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isXP ? 'rgba(168,85,247,0.1)' : 'transparent',
              }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: isXP ? 'rgba(168,85,247,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {item.label}
                </p>
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenus + Temps */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
        <div style={{ ...card, background: isXP ? 'linear-gradient(135deg, #0a0514, #12082a)' : 'linear-gradient(135deg, #1a1200, #2a1f00, #1a1200)' }}>
          {!isXP && <DecoBackground/>}
          {!isXP && <DecoCorners opacity={0.35}/>}
          {revenue > 0 && [{ left: '15%', delay: '0s' }, { left: '50%', delay: '0.9s' }, { left: '80%', delay: '1.6s' }].map((coin, i) => (
            <span key={i} className="coin-fall" style={{ left: coin.left, top: 0, animationDelay: coin.delay }}>
              {isXP ? '💜' : '🪙'}
            </span>
          ))}
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: isXP ? 'rgba(168,85,247,0.7)' : 'rgba(214,178,94,0.7)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
            {isXP ? '💰 GAINS' : '💰 REVENUS'}
          </p>
          <p style={{
            fontSize: '26px', fontWeight: 900, lineHeight: 1, fontFamily: 'monospace',
            position: 'relative', zIndex: 1,
            background: isXP
              ? 'linear-gradient(90deg, #a855f7, #22d3ee, #a855f7)'
              : 'linear-gradient(90deg, #C49A3C, #F2D27A, #FFE9A0, #F2D27A, #C49A3C)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'xpShimmer 3s linear infinite',
          }}>{formattedRevenue}</p>
          {isXP && revenue > 0 && (
            <p style={{ fontSize: '10px', color: '#a855f7', marginTop: '4px', position: 'relative', zIndex: 1, fontWeight: 700 }}>
              +{Math.floor(revenue / 10)} XP
            </p>
          )}
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          {!isXP && <DecoBackground/>}
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: isXP ? 'rgba(168,85,247,0.7)' : 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
            {t('⏱ TEMPS', '⏱ TIME')}
          </p>
          <p style={{ color: isXP ? '#e9d5ff' : 'var(--text)', fontSize: '19px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
            {formatTimer(activeSession?.elapsed || 0)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', position: 'relative', zIndex: 1 }}>
            <div className="status-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : '#555', flexShrink: 0 }}/>
            <p style={{ fontSize: '9px', fontWeight: 700, color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : (isXP ? '#4c1d95' : 'var(--text-muted)') }}>
              {isOnBreak ? 'PAUSE' : isRunning ? 'ACTIF' : 'ATTENTE'}
            </p>
          </div>
        </div>
      </div>

      {/* Robot XP + Bouton Punch */}
      {isXP ? (
        <div style={{ ...card, background: 'rgba(10,5,20,0.95)', border: '1px solid rgba(168,85,247,0.3)', padding: '20px 16px' }}>
          {/* Rayons derrière le bouton */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px', transform: 'translate(-50%, -50%)', pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '280px', height: '280px',
              background: 'repeating-conic-gradient(rgba(168,85,247,0.06) 0deg 10deg, transparent 10deg 20deg)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'raysRotate 20s linear infinite',
            }}/>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {/* Robot gauche */}
            <div style={{ opacity: 0.9 }}>
              <XPRobot percent={goalPct} message={robotMessage}/>
            </div>

            {/* Bouton central */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={isRunning ? handlePunchOut : handlePunchIn}
                className={isRunning ? 'neon-punch-out' : 'neon-punch'}
                style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: isRunning
                    ? 'radial-gradient(circle at 40% 35%, #f87171, #ef4444 60%, #b91c1c)'
                    : 'radial-gradient(circle at 40% 35%, #c084fc, #a855f7 60%, #7c3aed)',
                  border: 'none', cursor: 'pointer', color: 'white',
                  fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '4px',
                }}>
                <span style={{ fontSize: '28px' }}>{isRunning ? '🔴' : '🎮'}</span>
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                  {isRunning ? (isOnBreak ? 'REPRENDRE' : 'PUNCH OUT') : 'PUNCH IN'}
                </span>
              </button>
              {!isRunning && (
                <p style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700, letterSpacing: '2px' }}>
                  ● PRÊT À JOUER
                </p>
              )}
            </div>

            {/* Ouvrier droite */}
            <div style={{ opacity: 0.9 }}>
              <WorkerCharacter isWorking={isRunning}/>
            </div>
          </div>

          {/* Pause/Reprendre */}
          {isRunning && !isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', position: 'relative', zIndex: 1 }}>
              <button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid #f59e0b', color: '#f59e0b', background: 'transparent', padding: '10px 28px', fontSize: '12px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
                ☕ PAUSE
              </button>
            </div>
          )}
          {isRunning && isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', position: 'relative', zIndex: 1 }}>
              <button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid #22c55e', color: '#22c55e', background: 'transparent', padding: '10px 28px', fontSize: '12px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
                ▶ REPRENDRE
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <PunchButton isRunning={isRunning} isOnBreak={isOnBreak} onPunch={isRunning ? handlePunchOut : handlePunchIn} elapsed={activeSession?.elapsed || 0} revenue={activeSession?.revenue || 0}/>
          {!isRunning && (
            <div style={{ padding: '4px 0' }}>
              <DecoSeparator opacity={0.2}/>
              <DecoStarRow count={5}/>
            </div>
          )}
          {isRunning && !isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--warning)', color: 'var(--warning)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
                {t('☕ PAUSE', '☕ BREAK')}
              </button>
            </div>
          )}
          {isRunning && isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--success)', color: 'var(--success)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>
                {t('▶ REPRENDRE', '▶ RESUME')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Objectif de la semaine */}
      {isXP && goal && (
        <div style={{ ...card }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px' }}>
                🎯 OBJECTIF SEMAINE
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {editingGoal ? (
                  <>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>$</span>
                    <input
                      type="number"
                      value={tempGoal}
                      onChange={e => setTempGoal(e.target.value)}
                      autoFocus
                      style={{
                        width: '70px', background: 'rgba(168,85,247,0.1)',
                        border: '1px solid rgba(168,85,247,0.4)', borderRadius: '6px',
                        padding: '4px 8px', color: '#e9d5ff', fontSize: '13px',
                        fontWeight: 700, outline: 'none',
                      }}
                    />
                    <button onClick={() => {
                      if (currentEmployeeId && tempGoal) setGoalTarget(currentEmployeeId, parseFloat(tempGoal))
                      setEditingGoal(false)
                    }} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '16px' }}>✓</button>
                    <button onClick={() => setEditingGoal(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                  </>
                ) : (
                  <button onClick={() => { setTempGoal(String(goal.targetAmount)); setEditingGoal(true) }} style={{
                    background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: '6px', padding: '4px 10px', color: '#a855f7',
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  }}>
                    But: {formatCurrency(goal.targetAmount)} ✏️
                  </button>
                )}
              </div>
            </div>

            {/* Barre de progression objectif */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{formatCurrency(goal.currentAmount)}</span>
                <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 700 }}>{goalPct.toFixed(0)}%</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{formatCurrency(goal.targetAmount)}</span>
              </div>
              <XPBar current={goal.currentAmount} max={goal.targetAmount} color="#22d3ee"/>
            </div>

            {/* Message de progression */}
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginTop: '8px',
              background: goalPct >= 100
                ? 'rgba(34,197,94,0.15)' : goalPct >= 50
                ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.08)',
              border: `1px solid ${goalPct >= 100 ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.2)'}`,
            }}>
              <p style={{
                fontSize: '12px', fontWeight: 700,
                color: goalPct >= 100 ? '#22c55e' : goalPct >= 50 ? '#a855f7' : '#6b7280',
              }}>
                {goalPct >= 100
                  ? '🎉 OBJECTIF ATTEINT! Vous êtes une légende!'
                  : goalPct >= 80
                  ? `🔥 Presque! Il te manque ${formatCurrency(goal.targetAmount - goal.currentAmount)}`
                  : goalPct >= 50
                  ? `💪 À mi-chemin! Encore ${formatCurrency(goal.targetAmount - goal.currentAmount)}`
                  : goalPct > 0
                  ? `⚡ En route! ${formatCurrency(goal.targetAmount - goal.currentAmount)} restants`
                  : '🎯 Commence à poinçonner pour progresser!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPunchModal && currentEmployee && (
        <PunchInModal employeeId={currentEmployee.id} employeeName={currentEmployee.name} employeeHourlyRate={currentEmployee.hourlyRate ?? 45} mode={punchModalMode} onComplete={handlePunchModalComplete} onCancel={() => setShowPunchModal(false)}/>
      )}

      {showPunchOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 80px' }}>
          <div style={{ background: isXP ? 'rgba(17,7,40,0.98)' : 'var(--surface)', border: isXP ? '1px solid rgba(168,85,247,0.4)' : '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '16px', fontWeight: 800 }}>📐 {t('Matériaux posés', 'Materials installed')}</h2>
            {materials.map(m => (
              <div key={m.id} style={{ background: isXP ? 'rgba(168,85,247,0.08)' : 'var(--card)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={m.material} onChange={e => { const updated = materials.map(x => x.id === m.id ? { ...x, material: e.target.value } : x); setMaterials(updated) }} placeholder={t('Matériau...', 'Material...')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px', width: '100%' }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet} onChange={e => { const updated = materials.map(x => x.id === m.id ? { ...x, squareFeet: Number(e.target.value), total: Number(e.target.value) * x.pricePerSqFt } : x); setMaterials(updated) }} placeholder="Pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                  <input type="number" value={m.pricePerSqFt} onChange={e => { const updated = materials.map(x => x.id === m.id ? { ...x, pricePerSqFt: Number(e.target.value), total: x.squareFeet * Number(e.target.value) } : x); setMaterials(updated) }} placeholder="$/pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                </div>
                <p style={{ color: isXP ? '#a855f7' : 'var(--secondary)', fontSize: '13px', fontWeight: 700 }}>Total: {formatCurrency(m.total)}</p>
              </div>
            ))}
            <button onClick={addMaterial} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: `1px dashed ${isXP ? '#a855f7' : 'var(--primary)'}`, background: 'transparent', color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>+ {t('Ajouter', 'Add')}</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: isXP ? '#7c3aed' : 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: 700 }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div style={{ ...card }}>
        {!isXP && <DecoBackground/>}
        {!isXP && <DecoCorners opacity={0.3}/>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m-2).toISOString().slice(0,7)) }} style={{ background: isXP ? 'rgba(168,85,247,0.15)' : 'var(--surface)', border: `1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, color: isXP ? '#a855f7' : 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>‹</button>
          {isXP ? (
            <p style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '2px', color: '#a855f7', textTransform: 'uppercase' as const }}>
              📅 {monthLabel.toUpperCase()}
            </p>
          ) : (
            <DecoTitle>{monthLabel.toUpperCase()}</DecoTitle>
          )}
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m).toISOString().slice(0,7)) }} style={{ background: isXP ? 'rgba(168,85,247,0.15)' : 'var(--surface)', border: `1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, color: isXP ? '#a855f7' : 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
          {(lang === 'fr' ? ['DI','LU','MA','ME','JE','VE','SA'] : ['SU','MO','TU','WE','TH','FR','SA']).map(d => (
            <div key={d} style={{ textAlign: 'center' as const, fontSize: '9px', color: isXP ? '#4c1d95' : 'var(--primary)', fontWeight: 800, padding: '3px 0', letterSpacing: '0.5px' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', position: 'relative', zIndex: 1 }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`}/>
            const dateKey = day.toISOString().split('T')[0]
            const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{
                minHeight: '38px', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                border: isToday
                  ? `2px solid ${isXP ? '#a855f7' : 'var(--primary)'}`
                  : `1px solid ${isXP ? 'rgba(168,85,247,0.15)' : 'var(--border)'}`,
                background: isToday
                  ? isXP ? 'rgba(168,85,247,0.2)' : 'var(--primary)18'
                  : detail ? (isXP ? 'rgba(34,211,238,0.08)' : 'var(--success)12') : (isXP ? 'rgba(168,85,247,0.05)' : 'var(--surface)'),
                boxShadow: isToday && isXP ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
              }}>
                <span style={{ fontSize: '10px', color: isToday ? (isXP ? '#a855f7' : 'var(--primary)') : (isXP ? '#4c1d95' : 'var(--text-muted)'), fontWeight: isToday ? 900 : 400 }}>
                  {day.getDate()}
                </span>
                {detail && <span style={{ fontSize: '7px', color: isXP ? '#22d3ee' : 'var(--success)', fontWeight: 700 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div style={{ ...card }}>
        {!isXP && <DecoBackground/>}
        {!isXP && <DecoCorners opacity={0.2}/>}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isXP ? (
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px', marginBottom: '12px' }}>🎮 LÉGENDE XP</p>
          ) : (
            <DecoTitle>{t('LÉGENDE', 'LEGEND')}</DecoTitle>
          )}
          <div style={{ height: '6px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { emoji: '⛱️', fr: 'Congé',      en: 'Day off', color: '#06b6d4', xp: '+0 XP'   },
              { emoji: '🌙', fr: 'Petite j.',   en: 'Short',   color: '#64748b', xp: '+50 XP'  },
              { emoji: '📋', fr: 'Moyenne',     en: 'Average', color: '#3b82f6', xp: '+100 XP' },
              { emoji: '✅', fr: 'Normale',     en: 'Normal',  color: '#22c55e', xp: '+150 XP' },
              { emoji: '⭐', fr: 'Bonne j.',    en: 'Good',    color: '#eab308', xp: '+200 XP' },
              { emoji: '🔥', fr: 'Grosse j.',   en: 'Big',     color: '#f97316', xp: '+300 XP' },
              { emoji: '💎', fr: 'Très grosse', en: 'Huge',    color: '#a855f7', xp: '+500 XP' },
            ].map(item => (
              <div key={item.emoji} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '8px',
                background: `${item.color}14`,
                border: `1px solid ${item.color}28`,
              }}>
                <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: item.color, fontSize: '10px', fontWeight: 700 }}>{t(item.fr, item.en)}</p>
                  {isXP && <p style={{ color: '#4c1d95', fontSize: '9px', fontWeight: 700 }}>{item.xp}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isXP && (
        <div style={{ padding: '8px 0' }}>
          <DecoSeparator opacity={0.18}/>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px', opacity: 0.15 }}>
            <DecoFlower size={28} opacity={1}/><DecoFlower size={44} opacity={1}/><DecoFlower size={28} opacity={1}/>
          </div>
        </div>
      )}

      {/* Modal détail journée */}
      {selectedDay && (() => {
        const detail = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${selectedDay}`] : null
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 80px' }}>
            <div style={{ background: isXP ? 'rgba(17,7,40,0.98)' : 'var(--surface)', border: isXP ? '1px solid rgba(168,85,247,0.4)' : '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '16px', fontWeight: 800 }}>📅 {selectedDay}</h2>
                <button onClick={() => setSelectedDay(null)} style={{ color: 'var(--text-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              {!detail ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' as const, padding: '20px' }}>{t('Aucune donnée', 'No data')}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: t('Heures', 'Hours'), value: `${detail.totalHours.toFixed(2)}h`, color: isXP ? '#a855f7' : 'var(--primary)' },
                    { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: isXP ? '#22d3ee' : '#FFD700' },
                    { label: t('Pauses', 'Breaks'), value: formatTimer(detail.totalBreak), color: '#f97316' },
                    { label: 'Sessions', value: `${detail.sessions.length}`, color: isXP ? '#ec4899' : 'var(--info)' },
                  ].map(item => (
                    <div key={item.label} style={{ background: isXP ? 'rgba(168,85,247,0.08)' : 'var(--card)', borderRadius: '10px', padding: '14px', textAlign: 'center' as const }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px' }}>{item.label}</p>
                      <p style={{ color: item.color, fontSize: '18px', fontWeight: 800 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function getLevelTitle(level: number): string {
  if (level >= 20) return 'Légende du Chantier'
  if (level >= 15) return 'Maître de Chantier'
  if (level >= 10) return 'Expert Confirmé'
  if (level >= 7) return 'Professionnel'
  if (level >= 4) return 'Travailleur Avancé'
  if (level >= 2) return 'Apprenti Motivé'
  return 'Nouvelle Recrue'
}
