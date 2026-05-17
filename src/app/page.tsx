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
import PunchOutConfirmModal from '@/components/PunchOutConfirmModal'
import { useVoiceReminder } from '@/hooks/useVoiceReminder'
import {
  DecoSeparator, DecoCorners, DecoTitle, DecoOrnament,
  DecoBackground, DecoDiamondRow, DecoFlower, DecoStarRow,
} from '@/components/DecoElements'

type Screen = 'select' | 'pin' | 'dashboard'

function XPRobot({ percent, message }: { percent: number; message: string }) {
  const happy = percent >= 80; const ok = percent >= 40
  const eyeColor = happy ? '#22d3ee' : ok ? '#a855f7' : '#6b7280'
  const bodyColor = happy ? '#7c3aed' : ok ? '#4c1d95' : '#1e1b4b'
  const glowColor = happy ? '#22d3ee' : ok ? '#a855f7' : '#4b5563'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes rFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes rWave{0%,100%{transform:rotate(0deg)}30%{transform:rotate(-28deg)}70%{transform:rotate(28deg)}}
        @keyframes rBlink{0%,85%,100%{transform:scaleY(1)}92%{transform:scaleY(0.08)}}
        @keyframes rGlow{0%,100%{filter:drop-shadow(0 0 6px ${glowColor}44)}50%{filter:drop-shadow(0 0 16px ${glowColor}99)}}
        @keyframes bPop{0%{transform:scale(0.7) translateX(-50%);opacity:0}100%{transform:scale(1) translateX(-50%);opacity:1}}
        .rf{animation:rFloat 3s ease-in-out infinite}.rw{animation:rWave 1.2s ease-in-out infinite;transform-origin:88px 60px}
        .re{animation:rBlink 3.5s ease-in-out infinite;transform-origin:center}.rg{animation:rGlow 2.5s ease-in-out infinite}.bp{animation:bPop 0.3s ease-out forwards}
      `}</style>
      <div style={{ position: 'relative', width: 110, height: 130 }}>
        <div className="bp" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: happy ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : ok ? '#4c1d95' : '#1e1b4b', border: `1px solid ${glowColor}`, borderRadius: '12px', padding: '5px 12px', fontSize: '11px', fontWeight: 800, color: '#e9d5ff', whiteSpace: 'nowrap', zIndex: 10, boxShadow: `0 0 14px ${glowColor}55` }}>
          {message}<div style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${happy ? '#a855f7' : '#4c1d95'}` }}/>
        </div>
        <svg className="rf rg" width="110" height="118" viewBox="0 0 110 118" fill="none" style={{ position: 'absolute', bottom: 0 }}>
          <ellipse cx="55" cy="116" rx="26" ry="5" fill={glowColor} opacity="0.12"/>
          <line x1="55" y1="6" x2="55" y2="20" stroke={glowColor} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="55" cy="4" r="6" fill={happy ? '#22d3ee' : '#a855f7'} style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}/>
          <rect x="20" y="20" width="70" height="38" rx="14" fill={bodyColor} stroke={glowColor} strokeWidth="2"/>
          <g className="re"><rect x="28" y="30" width="18" height="14" rx="5" fill={eyeColor} style={{ filter: `drop-shadow(0 0 6px ${eyeColor})` }}/><rect x="32" y="34" width="5" height="5" rx="2" fill="white" opacity="0.7"/></g>
          <g className="re" style={{ animationDelay: '0.18s' }}><rect x="64" y="30" width="18" height="14" rx="5" fill={eyeColor} style={{ filter: `drop-shadow(0 0 6px ${eyeColor})` }}/><rect x="68" y="34" width="5" height="5" rx="2" fill="white" opacity="0.7"/></g>
          {happy ? <path d="M36 50 Q55 60 74 50" stroke="#22d3ee" strokeWidth="3" fill="none" strokeLinecap="round"/> : ok ? <line x1="36" y1="54" x2="74" y2="54" stroke="#a855f7" strokeWidth="3" strokeLinecap="round"/> : <path d="M36 56 Q55 48 74 56" stroke="#6b7280" strokeWidth="3" fill="none" strokeLinecap="round"/>}
          <rect x="24" y="62" width="62" height="42" rx="12" fill={bodyColor} stroke="#7c3aed" strokeWidth="2"/>
          <rect x="34" y="70" width="42" height="24" rx="8" fill="#0a0514" opacity="0.55"/>
          <text x="55" y="86" textAnchor="middle" fontSize="14" fontWeight="900" fill={happy ? '#22d3ee' : '#a855f7'} style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}>XP</text>
          <circle cx="36" cy="98" r="4" fill={happy ? '#22c55e' : '#374151'} style={{ filter: `drop-shadow(0 0 4px ${happy ? '#22c55e' : '#374151'})` }}/>
          <circle cx="48" cy="98" r="3" fill="#f59e0b" opacity="0.8"/><circle cx="58" cy="98" r="3" fill="#f59e0b" opacity="0.5"/>
          <rect x="4" y="64" width="18" height="12" rx="6" fill={bodyColor} stroke="#6b21a8" strokeWidth="1.8"/>
          <circle cx="5" cy="70" r="6" fill={bodyColor} stroke="#6b21a8" strokeWidth="1.8"/>
          <g className="rw"><rect x="88" y="62" width="18" height="12" rx="6" fill={bodyColor} stroke="#a855f7" strokeWidth="1.8"/><circle cx="105" cy="68" r="6" fill={bodyColor} stroke="#a855f7" strokeWidth="1.8"/><line x1="105" y1="62" x2="109" y2="52" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/><line x1="105" y1="62" x2="112" y2="57" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/><line x1="105" y1="62" x2="112" y2="66" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/></g>
          <rect x="30" y="104" width="18" height="10" rx="5" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.8"/>
          <rect x="62" y="104" width="18" height="10" rx="5" fill={bodyColor} stroke="#7c3aed" strokeWidth="1.8"/>
          <ellipse cx="39" cy="115" rx="13" ry="4.5" fill="#080510" stroke="#4c1d95" strokeWidth="1.2"/>
          <ellipse cx="71" cy="115" rx="13" ry="4.5" fill="#080510" stroke="#4c1d95" strokeWidth="1.2"/>
        </svg>
      </div>
    </div>
  )
}

function WorkerCharacter({ isWorking }: { isWorking: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes wBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes wArm{0%,100%{transform:rotate(-8deg);transform-origin:bottom center}50%{transform:rotate(8deg);transform-origin:bottom center}}
        @keyframes wSmile{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.1)}}
        .wbody{animation:wBob ${isWorking ? '1.2s' : '2.5s'} ease-in-out infinite}
        .warm{animation:wArm ${isWorking ? '0.6s' : '2s'} ease-in-out infinite}
        .wsmile{animation:wSmile 2s ease-in-out infinite}
      `}</style>
      <svg className="wbody" width="80" height="110" viewBox="0 0 80 110" fill="none">
        <ellipse cx="40" cy="108" rx="18" ry="4" fill="#f59e0b" opacity="0.1"/>
        <ellipse cx="40" cy="18" rx="24" ry="16" fill="#f59e0b"/><ellipse cx="40" cy="18" rx="20" ry="12" fill="#fbbf24"/>
        <rect x="16" y="26" width="48" height="8" rx="3" fill="#d97706"/>
        <circle cx="40" cy="38" r="16" fill="#fde68a"/><circle cx="40" cy="38" r="15" fill="#fbbf24"/>
        <circle cx="34" cy="35" r="3.5" fill="#1e1b4b"/><circle cx="46" cy="35" r="3.5" fill="#1e1b4b"/>
        <circle cx="35" cy="34" r="1.2" fill="white"/><circle cx="47" cy="34" r="1.2" fill="white"/>
        <g className="wsmile">{isWorking ? <path d="M32 44 Q40 50 48 44" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/> : <path d="M33 45 Q40 42 47 45" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>}</g>
        <circle cx="28" cy="41" r="4" fill="#f97316" opacity="0.3"/><circle cx="52" cy="41" r="4" fill="#f97316" opacity="0.3"/>
        <rect x="22" y="54" width="36" height="32" rx="8" fill="#ea580c"/>
        <rect x="22" y="54" width="36" height="10" rx="8" fill="#c2410c"/>
        <rect x="22" y="66" width="36" height="4" fill="#fde68a" opacity="0.6"/>
        <circle cx="40" cy="76" r="5" fill="#fbbf24" opacity="0.5"/>
        <g className="warm"><rect x="4" y="56" width="16" height="8" rx="4" fill="#fbbf24"/><circle cx="5" cy="60" r="5" fill="#fbbf24"/></g>
        <g className="warm" style={{ animationDelay: '0.3s' }}><rect x="60" y="56" width="16" height="8" rx="4" fill="#fbbf24"/><circle cx="75" cy="60" r="5" fill="#fbbf24"/></g>
        <rect x="24" y="86" width="13" height="18" rx="5" fill="#1e40af"/><rect x="43" y="86" width="13" height="18" rx="5" fill="#1e40af"/>
        <rect x="20" y="100" width="20" height="8" rx="4" fill="#1e3a8a"/><rect x="40" y="100" width="20" height="8" rx="4" fill="#1e3a8a"/>
      </svg>
    </div>
  )
}

function XPBar({ current, max, color = '#a855f7' }: { current: number; max: number; color?: string }) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div style={{ width: '100%', height: '10px', background: 'rgba(168,85,247,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #22d3ee)`, boxShadow: `0 0 10px ${color}88`, transition: 'width 1s ease', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 50%, transparent)', backgroundSize: '200% 100%', animation: 'xpShimmer 2s linear infinite', borderRadius: '999px' }}/>
      </div>
    </div>
  )
}

function HexBadge({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: '52px', height: '52px', background: `${color}22`, border: `2px solid ${color}66`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: `0 0 12px ${color}44`, position: 'relative' }}>
        {icon}<div style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: `linear-gradient(135deg, ${color}11, transparent)` }}/>
      </div>
      <p style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.5px' }}>{value}</p>
      <p style={{ fontSize: '9px', color: '#6b7280' }}>{label}</p>
    </div>
  )
}

function getLevelTitle(level: number): string {
  if (level >= 20) return 'Légende du Chantier'
  if (level >= 15) return 'Maître de Chantier'
  if (level >= 10) return 'Expert Confirmé'
  if (level >= 7)  return 'Professionnel'
  if (level >= 4)  return 'Travailleur Avancé'
  if (level >= 2)  return 'Apprenti Motivé'
  return 'Nouvelle Recrue'
}

// ══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { employees, currentEmployeeId, activeSessions, dayDetails, setCurrentEmployee, verifyPin, punchIn, punchOut, startBreak, endBreak, updateEmployee } = useEmployeeStore()
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { getActiveLogForEmployee } = useProjectStore()
  const { getGoal, setGoalTarget, updateProgress, updateStreak, addXP } = useGoalStore()
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const isXP       = themeId === 'xp'
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const isAventure = themeId === 'aventure'
  const cardClass  = isDeco ? 'deco-card-sweep' : isQuantum ? 'quantum-card-glow' : isAventure ? 'aventure-card-glow' : ''

  const [screen, setScreen]               = useState<Screen>('select')
  const [selectedId, setSelectedId]       = useState('')
  const [pin, setPin]                     = useState('')
  const [pinError, setPinError]           = useState(false)
  const [showPunchModal, setShowPunchModal]       = useState(false)
  const [punchModalMode, setPunchModalMode]       = useState<'in' | 'out'>('in')
  const [showPunchOut, setShowPunchOut]           = useState(false)
  const [showPunchConfirm, setShowPunchConfirm]   = useState(false)  // ★ B
  const [materials, setMaterials]                 = useState<MaterialEntry[]>([])
  const [currentMonth, setCurrentMonth]   = useState(new Date().toISOString().slice(0, 7))
  const [selectedDay, setSelectedDay]     = useState<string | null>(null)
  const [editingRate, setEditingRate]     = useState(false)
  const [tempRate, setTempRate]           = useState('')
  const [editingGoal, setEditingGoal]     = useState(false)
  const [tempGoal, setTempGoal]           = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const prevRevenueRef = useRef(0)

  const currentEmployee  = employees.find(e => e.id === currentEmployeeId)
  const activeSession    = currentEmployeeId ? activeSessions[currentEmployeeId] : null
  const isRunning        = !!activeSession
  const isOnBreak        = activeSession?.isOnBreak ?? false
  const activeProjectLog = currentEmployeeId ? getActiveLogForEmployee(currentEmployeeId) : null
  const today            = new Date().toISOString().split('T')[0]
  const goal             = currentEmployeeId ? getGoal(currentEmployeeId) : null
  const goalPct          = goal ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
  const xpToNext         = goal ? xpForLevel(goal.level + 1) - goal.xpPoints : 0

  useEffect(() => {
    if (!goal || !currentEmployeeId) return
    if (prevRevenueRef.current < goal.targetAmount && goal.currentAmount >= goal.targetAmount) {
      setShowCelebration(true); setTimeout(() => setShowCelebration(false), 3500)
    }
    prevRevenueRef.current = goal.currentAmount
  }, [goal?.currentAmount])

  // ★ A — Rappels vocaux progressifs (hook natif SpeechSynthesis)
  useVoiceReminder(activeSession?.elapsed || 0, isRunning)

  const robotMessage = !goal ? '👋 Salut!' : goalPct >= 100 ? '🏆 BRAVO!' : goalPct >= 80 ? '🔥 Presque!' : goalPct >= 50 ? '💪 Continue!' : goalPct >= 20 ? '⚡ En route!' : '🎯 Allons-y!'

  const card: React.CSSProperties = {
    background: isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)',
    border: isXP ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--border)',
    borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden',
  }

  const handleSelectEmployee = (id: string) => { setSelectedId(id); setPin(''); setPinError(false); setScreen('pin') }
  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit; setPin(newPin)
    if (newPin.length === 4) {
      if (verifyPin(selectedId, newPin)) {
        setCurrentEmployee(selectedId); setScreen('dashboard'); setPinError(false)
        updateStreak(selectedId); addXP(selectedId, 50)
      } else {
        setPinError(true); setTimeout(() => { setPin(''); setPinError(false) }, 1000)
      }
    }
  }
  const handleLogout = () => { setCurrentEmployee(null); setScreen('select'); setPin(''); setSelectedId('') }
  const handlePunchIn = () => { if (!currentEmployeeId) return; setPunchModalMode('in'); setShowPunchModal(true) }

  // ★ B — Punch Out → toujours passer par la confirmation
  const handlePunchOut = () => {
    if (!currentEmployeeId) return
    setShowPunchConfirm(true)
  }

  // Après confirmation → reprend le flux original
  const handlePunchOutConfirmed = () => {
    setShowPunchConfirm(false)
    if (!currentEmployeeId) return
    if (activeProjectLog)                     { setPunchModalMode('out'); setShowPunchModal(true); return }
    if (currentEmployee?.workMode === 'surface') { setShowPunchOut(true); return }
    const earned = activeSession?.revenue || 0
    punchOut(currentEmployeeId)
    if (earned > 0) updateProgress(currentEmployeeId, earned)
    addXP(currentEmployeeId, Math.floor(earned / 10) + 100)
  }

  const handlePunchModalComplete = () => {
    setShowPunchModal(false)
    if (!currentEmployeeId) return
    if (punchModalMode === 'in') { punchIn(currentEmployeeId); addXP(currentEmployeeId, 25) }
    else {
      const earned = activeSession?.revenue || 0
      punchOut(currentEmployeeId, materials); setMaterials([])
      if (earned > 0) updateProgress(currentEmployeeId, earned)
      addXP(currentEmployeeId, Math.floor(earned / 10) + 100)
    }
  }
  const handleConfirmPunchOut = () => {
    if (!currentEmployeeId) return
    const earned = materials.reduce((s, m) => s + m.total, 0)
    punchOut(currentEmployeeId, materials); setShowPunchOut(false); setMaterials([])
    if (earned > 0) updateProgress(currentEmployeeId, earned)
  }
  const addNewMaterial = () => setMaterials(prev => [...prev, { id: Date.now().toString(), material: '', squareFeet: 0, pricePerSqFt: 0, total: 0 }])

  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1); const lastDay = new Date(year, month, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month - 1, d))
    return days
  }

  const monthLabel       = new Date(currentMonth + '-01').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
  const revenue          = activeSession?.revenue || 0
  const formattedRevenue = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(revenue)

  // ══ SÉLECTION ══════════════════════════════════════════════════════════════
  if (screen === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
        <style>{`
          @keyframes xpShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          @keyframes starT{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
          @keyframes fUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
          .ec:active{transform:scale(0.97)}.ec{transition:transform 0.15s ease}.stw{animation:starT 2s ease-in-out infinite}
        `}</style>
        {isXP ? (
          <>
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <div style={{ fontSize: '36px', marginBottom: '6px' }}>🎮</div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', background: 'linear-gradient(90deg, #a855f7, #22d3ee, #a855f7)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'xpShimmer 3s linear infinite' }}>HAILITE XTERIORS</h1>
              <p style={{ color: '#4c1d95', fontSize: '11px', letterSpacing: '3px', marginTop: '4px', fontWeight: 700 }}>GAMING EDITION</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0' }}>
              {['⭐','✨','💜','✨','⭐'].map((s, i) => <span key={i} className="stw" style={{ fontSize: '16px', animationDelay: `${i * 0.3}s` }}>{s}</span>)}
            </div>
          </>
        ) : (
          <><DecoOrnament opacity={0.12}/><div style={{ textAlign: 'center' }}><h1 className="metal-text" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '4px' }}>HAILITE XTERIORS</h1><DecoDiamondRow count={5} opacity={0.3}/></div></>
        )}
        <DecoSeparator opacity={isXP ? 0.1 : 0.25}/>
        <div style={{ display: 'grid', gridTemplateColumns: employees.filter(e => e.active).length > 3 ? '1fr 1fr' : '1fr', gap: '10px' }}>
          {employees.filter(e => e.active).map((emp, idx) => {
            const empGoal = getGoal(emp.id)
            return (
              <button key={emp.id} className={`ec ${!isXP ? cardClass : ''}`} onClick={() => handleSelectEmployee(emp.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '16px', cursor: 'pointer', border: isXP ? '1px solid rgba(168,85,247,0.35)' : '1px solid var(--border)', background: isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)', textAlign: 'left' as const, position: 'relative', overflow: 'hidden', animation: `fUp 0.4s ease ${idx * 0.1}s both` }}>
                {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.3}/>}
                {isXP && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(168,85,247,0.08), transparent 60%)', pointerEvents: 'none' }}/>}
                <div style={{ width: '48px', height: '48px', borderRadius: isXP ? '12px' : '50%', flexShrink: 0, background: isXP ? `linear-gradient(135deg, ${emp.color}, #a855f7)` : `radial-gradient(circle at 40% 35%, ${emp.color}99, ${emp.color})`, boxShadow: isXP ? `0 0 18px ${emp.color}66` : `0 0 18px ${emp.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: 'white', position: 'relative', zIndex: 1 }}>{emp.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <p style={{ color: isXP ? '#e9d5ff' : 'var(--text)', fontSize: '15px', fontWeight: 700 }}>{emp.name}</p>
                  {isXP ? (<div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}><span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.3)', color: '#a855f7', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>Nv.{empGoal.level}</span><span style={{ fontSize: '10px', color: '#6b7280' }}>{empGoal.xpPoints} XP</span>{empGoal.streak > 0 && <span style={{ fontSize: '10px', color: '#f59e0b' }}>🔥{empGoal.streak}j</span>}</div>) : (<p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{emp.role === 'admin' ? '👑 Admin' : `⏱ ${emp.workMode}`}</p>)}
                </div>
                {activeSessions[emp.id] && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0, position: 'relative', zIndex: 1 }}/>}
              </button>
            )
          })}
        </div>
        {isXP ? (<p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '2px', color: '#4c1d95', fontWeight: 700 }}>🎮 CHOISISSEZ VOTRE PERSONNAGE</p>) : (<><DecoSeparator opacity={0.2}/><div style={{ display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.2 }}><DecoFlower size={35} opacity={1}/><DecoFlower size={50} opacity={1}/><DecoFlower size={35} opacity={1}/></div></>)}
      </div>
    )
  }

  // ══ PIN ════════════════════════════════════════════════════════════════════
  if (screen === 'pin') {
    const emp = employees.find(e => e.id === selectedId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingTop: '16px' }}>
        <button onClick={() => setScreen('select')} style={{ alignSelf: 'flex-start', color: isXP ? '#a855f7' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>← {t('Retour', 'Back')}</button>
        {isXP ? (<><div style={{ width: '76px', height: '76px', borderRadius: '18px', background: `linear-gradient(135deg, ${emp?.color}, #a855f7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 800, color: 'white', boxShadow: `0 0 30px ${emp?.color}66, 0 0 60px rgba(168,85,247,0.3)` }}>{emp?.name[0].toUpperCase()}</div><div style={{ textAlign: 'center' }}><p style={{ color: '#e9d5ff', fontSize: '17px', fontWeight: 800, letterSpacing: '2px' }}>{emp?.name}</p><p style={{ color: '#6b21a8', fontSize: '11px', letterSpacing: '1px', marginTop: '2px' }}>ENTREZ VOTRE CODE</p></div></>) : (<><DecoOrnament opacity={0.12}/><div style={{ width: '70px', height: '70px', borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, ${emp?.color}99, ${emp?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white', boxShadow: `0 0 30px ${emp?.color}66` }}>{emp?.name[0].toUpperCase()}</div><p style={{ color: 'var(--text)', fontSize: '17px', fontWeight: 700, letterSpacing: '2px' }}>{emp?.name}</p><DecoDiamondRow count={5} opacity={0.3}/></>)}
        <div style={{ display: 'flex', gap: '14px' }}>
          {[0,1,2,3].map(i => (<div key={i} style={{ width: '20px', height: '20px', borderRadius: isXP ? '5px' : '50%', background: pin.length > i ? pinError ? '#ef4444' : (isXP ? '#a855f7' : 'var(--primary)') : (isXP ? 'rgba(168,85,247,0.12)' : 'var(--surface)'), border: `2px solid ${pinError ? '#ef4444' : isXP ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`, transition: 'all 0.2s', boxShadow: pin.length > i ? isXP ? '0 0 14px rgba(168,85,247,0.8)' : '0 0 12px var(--primary)' : 'none' }}/>))}
        </div>
        {pinError && <p style={{ color: '#ef4444', fontSize: '13px' }}>{t('PIN incorrect', 'Incorrect PIN')}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%', maxWidth: '260px' }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (<button key={i} onClick={() => { if (d === '⌫') setPin(p => p.slice(0,-1)); else if (d !== '') handlePinDigit(d) }} style={{ height: '62px', borderRadius: isXP ? '12px' : '10px', cursor: d ? 'pointer' : 'default', border: isXP ? '1px solid rgba(168,85,247,0.2)' : '1px solid var(--border)', background: d ? (isXP ? 'rgba(17,7,40,0.9)' : 'var(--card)') : 'transparent', color: isXP ? '#e9d5ff' : 'var(--text)', fontSize: d === '⌫' ? '20px' : '24px', fontWeight: 700, opacity: d ? 1 : 0, boxShadow: isXP && d ? '0 0 8px rgba(168,85,247,0.12)' : 'none' }}>{d}</button>))}
        </div>
      </div>
    )
  }

  // ══ DASHBOARD ══════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>
      <style>{`
        @keyframes xpShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 15px #a855f7,0 0 30px #a855f788,0 0 60px #a855f744}50%{box-shadow:0 0 25px #a855f7,0 0 50px #a855f7aa,0 0 100px #a855f766}}
        @keyframes neonRed{0%,100%{box-shadow:0 0 15px #ef4444,0 0 30px #ef444488}50%{box-shadow:0 0 25px #ef4444,0 0 50px #ef4444aa}}
        @keyframes raysR{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes cFall{0%{transform:translateY(-10px);opacity:0}20%{opacity:1}100%{transform:translateY(50px);opacity:0}}
        @keyframes sPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.8)}}
        @keyframes confettiF{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100px) rotate(360deg);opacity:0}}
        @keyframes inputGlow{0%,100%{box-shadow:0 0 10px rgba(34,211,238,0.2)}50%{box-shadow:0 0 20px rgba(34,211,238,0.5)}}
        .cf{position:absolute;font-size:12px;pointer-events:none;animation:cFall 2s infinite}
        .sd{animation:sPulse 2s ease-in-out infinite}.np{animation:neonPulse 2.5s ease-in-out infinite}
        .nr{animation:neonRed 2s ease-in-out infinite}.goalInput:focus{animation:inputGlow 1.5s ease-in-out infinite!important}
      `}</style>

      {/* Célébration */}
      {showCelebration && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 24 }).map((_, i) => (<div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px', fontSize: '22px', animation: `confettiF ${1 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards` }}>{['🎉','⭐','💜','✨','🏆','💎','🎊'][Math.floor(Math.random() * 7)]}</div>))}
          <div style={{ background: 'rgba(17,7,40,0.97)', border: '2px solid #a855f7', borderRadius: '22px', padding: '28px 36px', textAlign: 'center', boxShadow: '0 0 50px rgba(168,85,247,0.6)' }}>
            <div style={{ fontSize: '52px', marginBottom: '10px' }}>🏆</div>
            <p style={{ color: '#a855f7', fontSize: '22px', fontWeight: 900, letterSpacing: '2px' }}>OBJECTIF ATTEINT!</p>
            <p style={{ color: '#22d3ee', fontSize: '15px', marginTop: '6px', fontWeight: 700 }}>+500 XP BONUS!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cardClass} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isXP ? 'rgba(17,7,40,0.95)' : 'var(--card)', border: isXP ? '1px solid rgba(168,85,247,0.4)' : '1px solid var(--border)' }}>
        {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.25}/>}
        {isXP && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.08), transparent)', pointerEvents: 'none' }}/>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: isXP ? '11px' : '50%', flexShrink: 0, background: isXP ? `linear-gradient(135deg, ${currentEmployee?.color}, #a855f7)` : `radial-gradient(circle at 40% 35%, ${currentEmployee?.color}99, ${currentEmployee?.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white', boxShadow: isXP ? `0 0 18px ${currentEmployee?.color}55, 0 0 32px rgba(168,85,247,0.3)` : `0 0 14px ${currentEmployee?.color}55` }}>{currentEmployee?.name[0].toUpperCase()}</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: isXP ? '#e9d5ff' : 'var(--text)' }}>{currentEmployee?.name}{currentEmployee?.role === 'admin' && ' 👑'}</p>
            {isXP && goal ? (<div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span style={{ fontSize: '9px', background: 'rgba(168,85,247,0.3)', color: '#a855f7', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>Nv.{goal.level}</span><span style={{ fontSize: '9px', color: '#6b7280' }}>{goal.xpPoints} XP</span>{goal.streak > 0 && <span style={{ fontSize: '9px', color: '#f59e0b' }}>🔥{goal.streak}j</span>}</div>) : (<p style={{ fontSize: '10px', color: 'var(--primary)', letterSpacing: '1px', fontWeight: 700 }}>{activeSession ? (isOnBreak ? '☕ EN PAUSE' : '🟢 EN SERVICE') : '⏸ HORS SERVICE'}</p>)}
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', border: isXP ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--border)', background: 'transparent', color: isXP ? '#a855f7' : 'var(--text-muted)', fontSize: '11px', fontWeight: 700, position: 'relative', zIndex: 1 }}>{t('SORTIR', 'LOGOUT')}</button>
      </div>

      {/* Taux + Statut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className={cardClass} style={{ ...card }}>
          {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.2}/>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: isXP ? '8px' : '50%', border: `1px solid ${isXP ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isXP ? 'rgba(168,85,247,0.1)' : 'transparent' }}><span style={{ fontSize: '15px' }}>$</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: isXP ? 'rgba(168,85,247,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{t('TAUX', 'RATE')}</p>
              {editingRate ? (<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><input type="number" value={tempRate} onChange={e => setTempRate(e.target.value)} autoFocus style={{ width: '55px', background: 'transparent', border: 'none', borderBottom: `1px solid ${isXP ? '#a855f7' : 'var(--primary)'}`, color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '15px', fontWeight: 900, outline: 'none' }}/><button onClick={() => { if (currentEmployeeId && tempRate) updateEmployee(currentEmployeeId, { hourlyRate: parseFloat(tempRate) }); setEditingRate(false) }} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '15px' }}>✓</button></div>) : (<p onClick={() => { setTempRate(String(currentEmployee?.hourlyRate ?? 45)); setEditingRate(true) }} style={{ fontSize: '14px', fontWeight: 900, cursor: 'pointer', color: isXP ? '#a855f7' : 'var(--primary)' }}>${currentEmployee?.hourlyRate ?? 45}/h</p>)}
            </div>
          </div>
        </div>
        <div className={cardClass} style={{ ...card }}>
          {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.2}/>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: isXP ? '8px' : '50%', border: `1px solid ${isXP ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isXP ? 'rgba(168,85,247,0.1)' : 'transparent' }}><span style={{ fontSize: '15px' }}>⏱</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: isXP ? 'rgba(168,85,247,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>STATUT</p>
              <p style={{ fontSize: '12px', fontWeight: 900, color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : (isXP ? '#4c1d95' : 'var(--text)'), letterSpacing: '0.5px' }}>{isOnBreak ? t('EN PAUSE', 'ON BREAK') : isRunning ? t('EN COURS', 'IN PROGRESS') : t('EN ATTENTE', 'WAITING')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenus + Temps */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
        <div className={cardClass} style={{ ...card, background: isXP ? 'linear-gradient(135deg, #0a0514, #12082a)' : 'linear-gradient(135deg, #1a1200, #2a1f00, #1a1200)' }}>
          {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.35}/>}
          {revenue > 0 && [{ left: '15%', delay: '0s' }, { left: '50%', delay: '0.9s' }, { left: '80%', delay: '1.6s' }].map((coin, i) => (<span key={i} className="cf" style={{ left: coin.left, top: 0, animationDelay: coin.delay }}>{isXP ? '💜' : '🪙'}</span>))}
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: isXP ? 'rgba(168,85,247,0.7)' : 'rgba(214,178,94,0.7)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>{isXP ? '💰 GAINS' : '💰 REVENUS'}</p>
          <p style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, fontFamily: 'monospace', position: 'relative', zIndex: 1, background: isXP ? 'linear-gradient(90deg, #a855f7, #22d3ee, #a855f7)' : 'linear-gradient(90deg, #C49A3C, #F2D27A, #FFE9A0, #F2D27A, #C49A3C)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'xpShimmer 3s linear infinite' }}>{formattedRevenue}</p>
          {isXP && revenue > 0 && <p style={{ fontSize: '10px', color: '#a855f7', marginTop: '4px', position: 'relative', zIndex: 1, fontWeight: 700 }}>+{Math.floor(revenue / 10)} XP</p>}
        </div>
        <div className={cardClass} style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          {!isXP && <DecoBackground/>}
          <p style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '2px', color: isXP ? 'rgba(168,85,247,0.7)' : 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px', position: 'relative', zIndex: 1 }}>{t('⏱ TEMPS', '⏱ TIME')}</p>
          <p style={{ color: isXP ? '#e9d5ff' : 'var(--text)', fontSize: '19px', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>{formatTimer(activeSession?.elapsed || 0)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', position: 'relative', zIndex: 1 }}>
            <div className="sd" style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : '#555', flexShrink: 0 }}/>
            <p style={{ fontSize: '9px', fontWeight: 700, color: isRunning ? (isOnBreak ? '#f97316' : '#22c55e') : (isXP ? '#4c1d95' : 'var(--text-muted)') }}>{isOnBreak ? 'PAUSE' : isRunning ? 'ACTIF' : 'ATTENTE'}</p>
          </div>
        </div>
      </div>

      {/* Niveau XP */}
      {isXP && goal && (
        <div className={cardClass} style={{ ...card }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.05), transparent)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: 'white', boxShadow: '0 0 14px rgba(168,85,247,0.5)' }}>{goal.level}</div>
                <div><p style={{ color: '#e9d5ff', fontSize: '13px', fontWeight: 800 }}>NIVEAU {goal.level}</p><p style={{ color: '#a855f7', fontSize: '10px' }}>{getLevelTitle(goal.level)}</p></div>
              </div>
              <div style={{ textAlign: 'right' as const }}><p style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 800 }}>{goal.xpPoints} XP</p><p style={{ color: '#6b7280', fontSize: '10px' }}>{xpToNext} XP → Nv.{goal.level + 1}</p></div>
            </div>
            <XPBar current={goal.xpPoints} max={xpForLevel(goal.level + 1)} color="#a855f7"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span style={{ fontSize: '9px', color: '#4c1d95' }}>Nv.{goal.level}</span><span style={{ fontSize: '9px', color: '#4c1d95' }}>Nv.{goal.level + 1}</span></div>
          </div>
        </div>
      )}

      {/* Objectif semaine XP */}
      {isXP && goal && (
        <div className={cardClass} style={{ ...card, border: '1px solid rgba(34,211,238,0.35)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.06), transparent 60%)', pointerEvents: 'none' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#22d3ee', letterSpacing: '2px' }}>🎯 OBJECTIF SEMAINE</p>
              <p style={{ fontSize: '10px', color: '#4c1d95' }}>{new Date().toLocaleDateString('fr-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>But à atteindre cette semaine</p>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '16px', fontSize: '26px', fontWeight: 900, color: '#22d3ee', zIndex: 1, lineHeight: 1 }}>$</span>
                <input className="goalInput" type="number" value={editingGoal ? tempGoal : goal.targetAmount} onChange={e => { setTempGoal(e.target.value); setEditingGoal(true) }} onBlur={() => { if (currentEmployeeId && tempGoal && parseFloat(tempGoal) > 0) { setGoalTarget(currentEmployeeId, parseFloat(tempGoal)) } setEditingGoal(false) }} style={{ width: '100%', background: editingGoal ? 'rgba(34,211,238,0.12)' : 'rgba(34,211,238,0.06)', border: editingGoal ? '2px solid #22d3ee' : '1px solid rgba(34,211,238,0.35)', borderRadius: '14px', padding: '20px 20px 20px 52px', color: '#22d3ee', fontSize: '34px', fontWeight: 900, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', boxShadow: editingGoal ? '0 0 24px rgba(34,211,238,0.35)' : 'none', transition: 'all 0.25s' }}/>
                <span style={{ position: 'absolute', right: '16px', fontSize: '13px', color: '#4c1d95', fontWeight: 700 }}>CAD</span>
              </div>
              <p style={{ fontSize: '11px', color: '#4c1d95', marginTop: '6px', textAlign: 'center' }}>Touchez pour modifier votre objectif</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <div><p style={{ fontSize: '20px', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{formatCurrency(goal.currentAmount)}</p><p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>gagné cette semaine</p></div>
                <div style={{ textAlign: 'right' as const }}><p style={{ fontSize: '24px', fontWeight: 900, color: '#22d3ee', lineHeight: 1 }}>{goalPct.toFixed(0)}%</p><p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>complété</p></div>
              </div>
              <XPBar current={goal.currentAmount} max={goal.targetAmount} color="#22d3ee"/>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span style={{ fontSize: '9px', color: '#4c1d95' }}>$0</span><span style={{ fontSize: '9px', color: '#4c1d95' }}>{formatCurrency(goal.targetAmount)}</span></div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: goalPct >= 100 ? 'rgba(34,197,94,0.15)' : goalPct >= 50 ? 'rgba(34,211,238,0.1)' : 'rgba(168,85,247,0.08)', border: `1px solid ${goalPct >= 100 ? 'rgba(34,197,94,0.3)' : goalPct >= 50 ? 'rgba(34,211,238,0.25)' : 'rgba(168,85,247,0.15)'}` }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: goalPct >= 100 ? '#22c55e' : goalPct >= 50 ? '#22d3ee' : '#a855f7', margin: 0 }}>{goalPct >= 100 ? '🏆 OBJECTIF ATTEINT! Tu es une LÉGENDE!' : goalPct >= 80 ? `🔥 Presque! Il te manque ${formatCurrency(goal.targetAmount - goal.currentAmount)}` : goalPct >= 50 ? `💪 À mi-chemin! Encore ${formatCurrency(goal.targetAmount - goal.currentAmount)}` : goalPct > 0 ? `⚡ En route! ${formatCurrency(goal.targetAmount - goal.currentAmount)} restants` : '🎯 Poinçonne pour commencer ta progression!'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges XP */}
      {isXP && goal && (
        <div className={cardClass} style={{ ...card }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px', marginBottom: '14px' }}>🏅 BADGES & STATS</p>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <HexBadge label="Série"   value={`${goal.streak}j`}       color="#f59e0b" icon="🔥"/>
              <HexBadge label="Niveau"  value={`${goal.level}`}          color="#a855f7" icon="⭐"/>
              <HexBadge label="XP Total" value={`${goal.xpPoints}`}     color="#22d3ee" icon="💎"/>
              <HexBadge label="Sem. act." value={formatCurrency(goal.currentAmount).replace('CA', '').trim()} color="#22c55e" icon="💰"/>
            </div>
          </div>
        </div>
      )}

      {/* Robot + Bouton Punch */}
      {isXP ? (
        <div className={cardClass} style={{ ...card, background: 'rgba(10,5,20,0.95)', border: '1px solid rgba(168,85,247,0.3)', padding: '20px 16px' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px', transform: 'translate(-50%, -50%)', pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '280px', height: '280px', background: 'repeating-conic-gradient(rgba(168,85,247,0.06) 0deg 10deg, transparent 10deg 20deg)', borderRadius: '50%', transform: 'translate(-50%, -50%)', animation: 'raysR 20s linear infinite' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <XPRobot percent={goalPct} message={robotMessage}/>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button onClick={isRunning ? handlePunchOut : handlePunchIn} className={isRunning ? 'nr' : 'np'} style={{ width: '124px', height: '124px', borderRadius: '50%', background: isRunning ? 'radial-gradient(circle at 40% 35%, #f87171, #ef4444 60%, #b91c1c)' : 'radial-gradient(circle at 40% 35%, #c084fc, #a855f7 60%, #7c3aed)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: 900, letterSpacing: '1.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <span style={{ fontSize: '30px' }}>{isRunning ? '🔴' : '🎮'}</span>
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{isRunning ? (isOnBreak ? 'REPRENDRE' : 'PUNCH OUT') : 'PUNCH IN'}</span>
              </button>
              {!isRunning && <p style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700, letterSpacing: '2px' }}>● PRÊT À JOUER</p>}
            </div>
            <WorkerCharacter isWorking={isRunning}/>
          </div>
          {isRunning && !isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px', position: 'relative', zIndex: 1 }}>
              <button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid #f59e0b', color: '#f59e0b', background: 'transparent', padding: '10px 28px', fontSize: '12px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>☕ PAUSE</button>
            </div>
          )}
          {isRunning && isOnBreak && currentEmployeeId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px', position: 'relative', zIndex: 1 }}>
              <button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid #22c55e', color: '#22c55e', background: 'transparent', padding: '10px 28px', fontSize: '12px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>▶ REPRENDRE</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <PunchButton isRunning={isRunning} isOnBreak={isOnBreak} onPunch={isRunning ? handlePunchOut : handlePunchIn} elapsed={activeSession?.elapsed || 0} revenue={activeSession?.revenue || 0}/>
          {!isRunning && <div style={{ padding: '4px 0' }}><DecoSeparator opacity={0.2}/><DecoStarRow count={5}/></div>}
          {isRunning && !isOnBreak && currentEmployeeId && (<div style={{ display: 'flex', justifyContent: 'center' }}><button onClick={() => startBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--warning)', color: 'var(--warning)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>{t('☕ PAUSE', '☕ BREAK')}</button></div>)}
          {isRunning && isOnBreak && currentEmployeeId && (<div style={{ display: 'flex', justifyContent: 'center' }}><button onClick={() => endBreak(currentEmployeeId)} style={{ borderRadius: '999px', border: '2px solid var(--success)', color: 'var(--success)', background: 'transparent', padding: '12px 32px', fontSize: '13px', cursor: 'pointer', fontWeight: 800, letterSpacing: '2px' }}>{t('▶ REPRENDRE', '▶ RESUME')}</button></div>)}
        </>
      )}

      {/* ★ B — Modal confirmation Punch Out */}
      {showPunchConfirm && (
        <PunchOutConfirmModal
          elapsed={activeSession?.elapsed || 0}
          revenue={activeSession?.revenue || 0}
          onConfirm={handlePunchOutConfirmed}
          onCancel={() => setShowPunchConfirm(false)}
        />
      )}

      {/* Modal PunchIn/Out projet */}
      {showPunchModal && currentEmployee && (
        <PunchInModal employeeId={currentEmployee.id} employeeName={currentEmployee.name} employeeHourlyRate={currentEmployee.hourlyRate ?? 45} mode={punchModalMode} onComplete={handlePunchModalComplete} onCancel={() => setShowPunchModal(false)}/>
      )}

      {/* Modal surface (matériaux) */}
      {showPunchOut && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 80px' }}>
          <div style={{ background: isXP ? 'rgba(17,7,40,0.98)' : 'var(--surface)', border: isXP ? '1px solid rgba(168,85,247,0.4)' : '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '16px', fontWeight: 800 }}>📐 {t('Matériaux posés', 'Materials installed')}</h2>
            {materials.map(m => (
              <div key={m.id} style={{ background: isXP ? 'rgba(168,85,247,0.08)' : 'var(--card)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={m.material} onChange={e => setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, material: e.target.value } : x))} placeholder={t('Matériau...', 'Material...')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px', width: '100%' }}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" value={m.squareFeet} onChange={e => setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, squareFeet: Number(e.target.value), total: Number(e.target.value) * x.pricePerSqFt } : x))} placeholder="Pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                  <input type="number" value={m.pricePerSqFt} onChange={e => setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, pricePerSqFt: Number(e.target.value), total: x.squareFeet * Number(e.target.value) } : x))} placeholder="$/pi²" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '14px' }}/>
                </div>
                <p style={{ color: isXP ? '#a855f7' : 'var(--secondary)', fontSize: '13px', fontWeight: 700 }}>Total: {formatCurrency(m.total)}</p>
              </div>
            ))}
            <button onClick={addNewMaterial} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', border: `1px dashed ${isXP ? '#a855f7' : 'var(--primary)'}`, background: 'transparent', color: isXP ? '#a855f7' : 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>+ {t('Ajouter', 'Add')}</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setShowPunchOut(false)} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>{t('Annuler', 'Cancel')}</button>
              <button onClick={handleConfirmPunchOut} style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: isXP ? '#7c3aed' : 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: 700 }}>✅ {t('Confirmer', 'Confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className={cardClass} style={{ ...card }}>
        {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.3}/>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m-2).toISOString().slice(0,7)) }} style={{ background: isXP ? 'rgba(168,85,247,0.15)' : 'var(--surface)', border: `1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, color: isXP ? '#a855f7' : 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>‹</button>
          {isXP ? <p style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '2px', color: '#a855f7', textTransform: 'uppercase' as const }}>📅 {monthLabel.toUpperCase()}</p> : <DecoTitle>{monthLabel.toUpperCase()}</DecoTitle>}
          <button onClick={() => { const [y,m] = currentMonth.split('-').map(Number); setCurrentMonth(new Date(y,m).toISOString().slice(0,7)) }} style={{ background: isXP ? 'rgba(168,85,247,0.15)' : 'var(--surface)', border: `1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, color: isXP ? '#a855f7' : 'var(--text)', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '15px' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>
          {(lang === 'fr' ? ['DI','LU','MA','ME','JE','VE','SA'] : ['SU','MO','TU','WE','TH','FR','SA']).map(d => (<div key={d} style={{ textAlign: 'center' as const, fontSize: '9px', color: isXP ? '#4c1d95' : 'var(--primary)', fontWeight: 800, padding: '3px 0' }}>{d}</div>))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', position: 'relative', zIndex: 1 }}>
          {getDaysInMonth().map((day, i) => {
            if (!day) return <div key={`e-${i}`}/>
            const dateKey = day.toISOString().split('T')[0]
            const detail  = currentEmployeeId ? dayDetails[`${currentEmployeeId}-${dateKey}`] : null
            const isToday = dateKey === today
            return (
              <button key={dateKey} onClick={() => setSelectedDay(dateKey)} style={{ minHeight: '38px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', border: isToday ? `2px solid ${isXP ? '#a855f7' : 'var(--primary)'}` : `1px solid ${isXP ? 'rgba(168,85,247,0.15)' : 'var(--border)'}`, background: isToday ? (isXP ? 'rgba(168,85,247,0.2)' : 'var(--primary)18') : detail ? (isXP ? 'rgba(34,211,238,0.08)' : 'var(--success)12') : (isXP ? 'rgba(168,85,247,0.05)' : 'var(--surface)'), boxShadow: isToday && isXP ? '0 0 12px rgba(168,85,247,0.4)' : 'none' }}>
                <span style={{ fontSize: '10px', color: isToday ? (isXP ? '#a855f7' : 'var(--primary)') : (isXP ? '#4c1d95' : 'var(--text-muted)'), fontWeight: isToday ? 900 : 400 }}>{day.getDate()}</span>
                {detail && <span style={{ fontSize: '7px', color: isXP ? '#22d3ee' : 'var(--success)', fontWeight: 700 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className={cardClass} style={{ ...card }}>
        {!isXP && <DecoBackground/>}{!isXP && <DecoCorners opacity={0.2}/>}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isXP ? <p style={{ fontSize: '10px', fontWeight: 800, color: '#a855f7', letterSpacing: '2px', marginBottom: '12px' }}>🎮 LÉGENDE XP</p> : <DecoTitle>{t('LÉGENDE', 'LEGEND')}</DecoTitle>}
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
              <div key={item.emoji} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: `${item.color}14`, border: `1px solid ${item.color}28` }}>
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

      {!isXP && (<div style={{ padding: '8px 0' }}><DecoSeparator opacity={0.18}/><div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px', opacity: 0.15 }}><DecoFlower size={28} opacity={1}/><DecoFlower size={44} opacity={1}/><DecoFlower size={28} opacity={1}/></div></div>)}

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
              {!detail ? (<p style={{ color: 'var(--text-muted)', textAlign: 'center' as const, padding: '20px' }}>{t('Aucune donnée', 'No data')}</p>) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: t('Heures', 'Hours'),    value: `${detail.totalHours.toFixed(2)}h`,  color: isXP ? '#a855f7' : 'var(--primary)' },
                    { label: t('Revenus', 'Revenue'), value: formatCurrency(detail.totalRevenue), color: isXP ? '#22d3ee' : '#FFD700' },
                    { label: t('Pauses', 'Breaks'),   value: formatTimer(detail.totalBreak),       color: '#f97316' },
                    { label: 'Sessions',              value: `${detail.sessions.length}`,          color: isXP ? '#ec4899' : 'var(--info)' },
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
