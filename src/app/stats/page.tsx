'use client'

import { useState, useMemo } from 'react'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useProjectStore, calcProjectStats } from '@/store/useProjectStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { formatCurrency } from '@/lib/formatters'
import type { DayDetail } from '@/types/employee'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS_FR[m - 1]} ${y}`
}

function addMonths(ym: string, offset: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nowYM() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function pctChange(now: number, before: number) {
  if (before <= 0) return null
  return ((now - before) / before) * 100
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const W = 80, H = 28
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - (v / max) * (H - 6) - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} style={{ overflow: 'visible', flexShrink: 0 }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

function TrendLine({ now, before, label }: { now: number; before: number; label: string }) {
  const pct = pctChange(now, before)
  if (pct === null) {
    return <span style={{ color: '#6B7280', fontSize: 11, fontFamily: 'monospace' }}>→ 0% (S/O {label})</span>
  }
  const up = pct >= 0
  return (
    <span style={{ color: up ? '#22C55E' : '#EF4444', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
      {up ? '↗ +' : '↘ '}{pct.toFixed(1)}%{' '}
      <span style={{ color: '#6B7280', fontWeight: 400 }}>vs {label}</span>
    </span>
  )
}

function SparkCard({
  label, value, icon, iconColor, sparkValues, sparkColor, prev, prevYear,
}: {
  label: string; value: string; icon: string; iconColor: string
  sparkValues: number[]; sparkColor: string; prev: number; prevYear: number
}) {
  const current = sparkValues[sparkValues.length - 1] ?? 0
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ color: iconColor, fontSize: 15 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ color: 'var(--text)', fontSize: 20, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        <Sparkline values={sparkValues} color={sparkColor} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TrendLine now={current} before={prev} label="mois préc." />
        <TrendLine now={current} before={prevYear} label="an passé" />
      </div>
    </div>
  )
}

function AcctCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
      <div style={{ color, fontSize: 20, fontWeight: 950, marginTop: 6, fontFamily: 'monospace' }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4, whiteSpace: 'pre-line' }}>{sub}</div>
    </div>
  )
}

function SectionHeader({ badge, badgeColor, title }: { badge: string; badgeColor: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: badgeColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.12em' }}>{badge}</span>
      <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
    </div>
  )
}

function Avatar({ name, avatarUrl, color, size = 34 }: { name: string; avatarUrl?: string; color?: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      overflow: 'hidden', border: '2px solid var(--border)',
      background: color || 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontSize: size * 0.38, fontWeight: 900, lineHeight: 1 }}>{name[0]?.toUpperCase()}</span>
      }
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [subTab, setSubTab] = useState<'analytics' | 'payroll'>('analytics')
  const [statsMonth, setStatsMonth] = useState(nowYM)
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null)
  const [grossInput, setGrossInput] = useState('1000')

  // Stores
  const empStore    = useEmployeeStore()
  const projStore   = useProjectStore()
  const acctStore   = useAccountingStore()

  const employees       = empStore.employees     || []
  const dayDetails      = empStore.dayDetails    || {}
  const activeSessions  = empStore.activeSessions || {}
  const currentEmpId    = empStore.currentEmployeeId
  const projects        = projStore.projects     || []
  const clientInvoices  = acctStore.clientInvoices  || []
  const payrollPayments = acctStore.payrollPayments || []
  const expenses        = acctStore.expenses        || []

  const currentEmployee = employees.find(e => e.id === currentEmpId)
  const isAdmin = !currentEmployee || currentEmployee.role === 'admin' || currentEmployee.role === 'accountant'

  // All day details as array
  const allDetails = useMemo(() => Object.values(dayDetails) as DayDetail[], [dayDetails])
  const scoped = useMemo(
    () => isAdmin ? allDetails : allDetails.filter(d => d.employeeId === currentEmpId),
    [isAdmin, allDetails, currentEmpId]
  )

  // Metrics for a given period
  function getMetrics(ym: string, details = scoped) {
    const filtered = details.filter(d => d.date?.startsWith(ym))
    return {
      revenue:  filtered.reduce((s, d) => s + (d.totalRevenue || 0), 0),
      hours:    filtered.reduce((s, d) => s + (d.totalHours   || 0), 0),
      sessions: filtered.reduce((s, d) => s + (d.sessions?.length || 0), 0),
      days:     new Set(filtered.map(d => d.date)).size,
      filtered,
    }
  }

  const curM  = getMetrics(statsMonth)
  const prevM = getMetrics(addMonths(statsMonth, -1))
  const prevY = getMetrics(addMonths(statsMonth, -12))

  // Sparklines — 6 months
  const sparkMonths = Array.from({ length: 6 }, (_, i) => addMonths(statsMonth, -5 + i))
  const revSpark = sparkMonths.map(m => getMetrics(m).revenue)
  const hrsSpark = sparkMonths.map(m => getMetrics(m).hours)
  const sesSpark = sparkMonths.map(m => getMetrics(m).sessions)
  const daySpark = sparkMonths.map(m => getMetrics(m).days)

  // Active live sessions
  const liveIds    = Object.keys(activeSessions)
  const liveRevenue = liveIds.reduce((s, id) => s + ((activeSessions[id] as any)?.revenue || 0), 0)

  // ── Payroll calculator ───────────────────────────────────────────────────
  const gross   = Math.max(0, parseFloat(grossInput) || 0)
  const fedTax  = gross * 0.15
  const provTax = gross * 0.15
  const rrq     = gross * 0.064
  const ae      = gross * 0.0127
  const netPay  = gross - fedTax - provTax - rrq - ae

  // ── Accounting summary for period ────────────────────────────────────────
  const curInvoiced  = clientInvoices.filter(i => i.issueDate?.startsWith(statsMonth)).reduce((s, i) => s + i.amount + i.taxAmount, 0)
  const curCollected = clientInvoices.filter(i => i.issueDate?.startsWith(statsMonth)).reduce((s, i) => s + i.paidAmount, 0)
  const curExpenses  = expenses.filter(e => e.date?.startsWith(statsMonth)).reduce((s, e) => s + e.amount, 0)
  const curPayroll   = payrollPayments
    .filter(p => p.periodStart?.startsWith(statsMonth) || p.paidAt?.startsWith(statsMonth))
    .reduce((s, p) => s + p.amount, 0)
  const netBenef = curInvoiced - curExpenses - curPayroll

  // ── Project field statistics ─────────────────────────────────────────────
  const fieldStats = useMemo(() => projects.map(proj => {
    const logs = proj.workLogs?.filter(l => l.punchOut && l.date?.startsWith(statsMonth)) ?? []
    const prevLogs = proj.workLogs?.filter(l => l.punchOut && l.date?.startsWith(addMonths(statsMonth, -1))) ?? []
    const totalHours    = logs.reduce((s, l) => s + (l.hoursWorked || 0), 0)
    const totalLaborCost = logs.reduce((s, l) => {
      const mode = l.payMode ?? proj.payMode
      if (mode === 'hourly') return s + (l.hoursWorked || 0) * l.hourlyRate
      return s + (l.jobPay || 0)
    }, 0)
    const memberIds = Array.from(new Set(logs.map(l => l.employeeId)))
    const workDays = new Set(logs.map(l => l.date)).size
    const prevHours = prevLogs.reduce((s, l) => s + (l.hoursWorked || 0), 0)
    return { proj, totalHours, totalLaborCost, memberCount: memberIds.length, workDays, sessions: logs.length, prevHours }
  }), [projects, statsMonth])

  // ── Margin analytics ─────────────────────────────────────────────────────
  const marginStats = useMemo(() => projects.map(proj => {
    const projExpenses  = (proj.expenses ?? []).reduce((s, e) => s + e.amount, 0)
    const allLogs       = (proj.workLogs ?? []).filter(l => l.punchOut)
    const laborCost     = allLogs.reduce((s, l) => {
      const mode = l.payMode ?? proj.payMode
      if (mode === 'hourly') return s + (l.hoursWorked || 0) * l.hourlyRate
      return s + (l.jobPay || 0)
    }, 0)
    const invoiced = clientInvoices
      .filter(i => i.projectName === proj.name)
      .reduce((s, i) => s + i.amount + i.taxAmount, 0)
    const altInvoiced = proj.clientAmount || 0
    const totalInvoiced = invoiced || altInvoiced
    const margin    = totalInvoiced - projExpenses - laborCost
    const marginPct = totalInvoiced > 0 ? (margin / totalInvoiced) * 100 : 0
    return { proj, invoiced: totalInvoiced, projExpenses, laborCost, margin, marginPct }
  }), [projects, clientInvoices])

  // ── Month nav options (last 24 months) ───────────────────────────────────
  const monthOptions = Array.from({ length: 24 }, (_, i) => addMonths(nowYM(), -i))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 950, margin: 0 }}>Performance &amp; Rentabilité</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Analyse dynamique des heures accumulées, performances d&apos;équipe et rentabilité de Hailite Xteriors.
            </p>
          </div>

          {/* Sub-tab toggle */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', flexShrink: 0 }}>
            {(['analytics', 'payroll'] as const).map(t => (
              <button key={t} onClick={() => setSubTab(t)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer',
                border: subTab === t ? '1px solid var(--primary)' : '1px solid transparent',
                background: subTab === t ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: subTab === t ? 'var(--primary)' : 'var(--text-muted)',
              }}>
                {t === 'analytics' ? '📈 Rendement & XP' : '🧾 Calcul Paie Québec'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Analytics tab ──────────────────────────────────────────────── */}
      {subTab === 'analytics' && <>

        {/* Period selector */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '6px 8px', background: 'rgba(249,115,22,0.10)', color: 'var(--primary)', borderRadius: 8, fontSize: 16 }}>📅</div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sélecteur de Période</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Filtrage des statistiques courantes</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setStatsMonth(m => addMonths(m, -1))} style={{ padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>‹</button>
            <select value={statsMonth} onChange={e => setStatsMonth(e.target.value)} style={{ background: 'var(--surface)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', outline: 'none' }}>
              {monthOptions.map(ym => <option key={ym} value={ym}>{fmtMonth(ym)}</option>)}
            </select>
            <button onClick={() => setStatsMonth(m => addMonths(m, 1))} style={{ padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>›</button>
          </div>
        </div>

        {/* 4 KPI Sparkline cards — 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <SparkCard label="Gains de l'Équipe"  value={`${curM.revenue.toFixed(2)} $`}             icon="🪙" iconColor="#F97316" sparkValues={revSpark} sparkColor="#F97316" prev={prevM.revenue}  prevYear={prevY.revenue} />
          <SparkCard label="Heures de Terrain"  value={`${curM.hours.toFixed(1)} h`}                icon="⏱" iconColor="#06B6D4" sparkValues={hrsSpark} sparkColor="#06B6D4" prev={prevM.hours}    prevYear={prevY.hours} />
          <SparkCard label="Volume de Punchs"   value={`${curM.sessions} session${curM.sessions !== 1 ? 's' : ''}`} icon="⚡" iconColor="#10B981" sparkValues={sesSpark} sparkColor="#10B981" prev={prevM.sessions} prevYear={prevY.sessions} />
          <SparkCard label="Jours de Chantier"  value={`${curM.days} jour${curM.days !== 1 ? 's' : ''}`}       icon="🏗" iconColor="#F59E0B" sparkValues={daySpark} sparkColor="#F59E0B" prev={prevM.days}     prevYear={prevY.days} />
        </div>

        {/* Live indicator */}
        {liveIds.length > 0 && (
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 900, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {liveIds.length} Punch{liveIds.length > 1 ? 's' : ''} Actif{liveIds.length > 1 ? 's' : ''} — Temps Réel
              </span>
            </div>
            <span style={{ color: '#22C55E', fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>{formatCurrency(liveRevenue)}</span>
          </div>
        )}

        {/* ── Admin-only sections ───────────────────────────────────────── */}
        {isAdmin && <>

          {/* Employee list with avatars */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(249,115,22,0.10)', color: 'var(--primary)', fontSize: 9, fontFamily: 'monospace', fontWeight: 900, padding: '3px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ADMIN PANEL</span>
              <h4 style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Statistiques Individuelles de l&apos;Équipe ({employees.length})
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {employees.map((emp, idx) => {
                const empD    = allDetails.filter(d => d.employeeId === emp.id && d.date?.startsWith(statsMonth))
                const empH    = empD.reduce((s, d) => s + (d.totalHours || 0), 0)
                const empRev  = empD.reduce((s, d) => s + (d.totalRevenue || 0), 0)
                const empDays = new Set(empD.map(d => d.date)).size
                const prevD   = allDetails.filter(d => d.employeeId === emp.id && d.date?.startsWith(addMonths(statsMonth, -1)))
                const prevH   = prevD.reduce((s, d) => s + (d.totalHours || 0), 0)
                const hrsPct  = pctChange(empH, prevH)
                const isExp   = expandedEmpId === emp.id

                const projRevMap: Record<string, number> = {}
                empD.forEach(d => { if (d.projectName) projRevMap[d.projectName] = (projRevMap[d.projectName] || 0) + (d.totalRevenue || 0) })
                const topProj = Object.entries(projRevMap).sort((a, b) => b[1] - a[1])[0]

                return (
                  <div key={emp.id} style={{ borderBottom: idx < employees.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <button
                      onClick={() => setExpandedEmpId(isExp ? null : emp.id)}
                      style={{ width: '100%', textAlign: 'left', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'transparent', border: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={emp.name} avatarUrl={emp.avatarUrl} color={emp.color} size={36} />
                        <div>
                          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900 }}>{emp.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                            {emp.accessProfile ? emp.accessProfile.replace(/_/g, ' ') : emp.role} — NIP : {emp.pin || '••••'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>{empH.toFixed(1)} h</div>
                          <div style={{ color: '#22C55E', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(empRev)}</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 14, width: 14 }}>{isExp ? '▾' : '▸'}</span>
                      </div>
                    </button>

                    {isExp && (
                      <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {[
                          { label: 'Jours Actifs',  value: String(empDays) },
                          { label: 'Taux Horaire',  value: `${formatCurrency(emp.hourlyRate)}/h` },
                          { label: 'Vs mois préc.', value: hrsPct !== null ? `${hrsPct >= 0 ? '+' : ''}${hrsPct.toFixed(0)}%` : 'S/O', color: hrsPct === null ? undefined : hrsPct >= 0 ? '#22C55E' : '#EF4444' },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                            <div style={{ color: color || 'var(--text)', fontSize: 15, fontWeight: 900, marginTop: 2, fontFamily: 'monospace' }}>{value}</div>
                          </div>
                        ))}
                        {topProj && (
                          <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', gridColumn: '1/-1' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projet Principal</div>
                            <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 900, marginTop: 2 }}>{topProj[0]} — {formatCurrency(topProj[1])}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {employees.length === 0 && (
                <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center', fontSize: 14 }}>Aucun employé enregistré.</div>
              )}
            </div>
          </div>

          {/* FIELD STATISTICS */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <SectionHeader badge="FIELD STATISTICS" badgeColor="var(--primary)" title="Statistiques Globales des Projets Chantiers" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {["Chantier / Projet", "Main-d'Oeuvre Cumulée", "Équipe (Punchs)", "Présence Effective", "Tendance Budget H"].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fieldStats.map(({ proj, totalHours, totalLaborCost, memberCount, workDays, sessions, prevHours }) => {
                    const trendPct = pctChange(totalHours, prevHours)
                    return (
                      <tr key={proj.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900 }}>{proj.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{proj.clientName}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{totalHours.toFixed(1)} h</div>
                          <div style={{ color: '#22C55E', fontSize: 11, fontFamily: 'monospace' }}>{formatCurrency(totalLaborCost)}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13 }}>{memberCount} personne{memberCount !== 1 ? 's' : ''}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{sessions} punch session{sessions !== 1 ? 's' : ''}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13 }}>{workDays} jour{workDays !== 1 ? 's' : ''} actif{workDays !== 1 ? 's' : ''}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {trendPct !== null
                            ? <span style={{ color: trendPct >= 0 ? '#22C55E' : '#EF4444', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
                                {trendPct >= 0 ? '↗ +' : '↘ '}{trendPct.toFixed(1)}% vs mois préc.
                              </span>
                            : <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>→ 0% (S/O h pr.)</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                  {fieldStats.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '20px 12px', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>Aucun projet trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MARGIN ANALYTICS */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <SectionHeader badge="MARGIN ANALYTICS" badgeColor="#22C55E" title="Analyse Financière de Rentabilité par Chantier (Marge Brute)" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Projet', 'Facturation Client ($)', 'Dépenses Fournisseurs ($)', "Coût Main-d'Oeuvre ($)", 'Marge Brute ($)', 'Performance Indicator'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marginStats.map(({ proj, invoiced, projExpenses, laborCost, margin, marginPct }) => {
                    const perf = marginPct >= 30
                      ? { label: '✓ Haute Performance (>=30%)', color: '#22C55E' }
                      : marginPct >= 0
                      ? { label: '⚠ Performance Acceptable', color: '#F59E0B' }
                      : { label: '⚠ Déficitaire / Faible',    color: '#EF4444' }
                    return (
                      <tr key={proj.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900 }}>{proj.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{proj.clientName}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'monospace' }}>{formatCurrency(invoiced)}</td>
                        <td style={{ padding: '10px 12px', color: '#F59E0B', fontSize: 13, fontFamily: 'monospace' }}>{formatCurrency(projExpenses)}</td>
                        <td style={{ padding: '10px 12px', color: '#EF4444', fontSize: 13, fontFamily: 'monospace' }}>{formatCurrency(-laborCost)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: margin >= 0 ? '#22C55E' : '#EF4444', fontSize: 13, fontFamily: 'monospace', fontWeight: 900 }}>{formatCurrency(margin)}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>({marginPct.toFixed(1)}%)</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ color: perf.color, fontSize: 12, fontWeight: 700 }}>{perf.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                  {marginStats.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '20px 12px', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>Aucun projet trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPTABILITÉ GLOBALE */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: '#06B6D4', fontSize: 10, fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.12em' }}>COMPTABILITÉ GLOBALE</span>
              <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Bilan Comptable Simplifié de la Période ({fmtMonth(statsMonth)})
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <AcctCard
                title="Factures Client"
                value={`${formatCurrency(curInvoiced)} TTC`}
                sub={`Recouvré : ${formatCurrency(curCollected)}\nDû : ${formatCurrency(Math.max(0, curInvoiced - curCollected))}`}
                color="#22C55E"
              />
              <AcctCard
                title="Dépenses Fournisseurs"
                value={formatCurrency(curExpenses)}
                sub={`${expenses.filter(e => e.date?.startsWith(statsMonth)).length} pièce(s) enregistrée(s)`}
                color="#F59E0B"
              />
              <AcctCard
                title="Masse Salariale"
                value={formatCurrency(curPayroll)}
                sub="Paies versées et en attente"
                color="#A855F7"
              />
              <AcctCard
                title="Bénéfice Net Provisoire"
                value={formatCurrency(netBenef)}
                sub="Indice de performance trimestrielle"
                color={netBenef >= 0 ? '#22C55E' : '#EF4444'}
              />
            </div>
          </div>

        </>}

        {/* Recent history */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <SectionHeader badge="HISTORIQUE" badgeColor="var(--text-muted)" title={`Sessions Récentes (${scoped.length} total)`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {scoped.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 10).map((d, idx) => (
              <div key={`${d.employeeId}-${d.date}-${idx}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderBottom: idx < Math.min(scoped.length, 10) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>{d.date || 'Date inconnue'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {(d.totalHours || 0).toFixed(1)} h · {d.projectName || 'sans projet'}
                  </div>
                </div>
                <strong style={{ color: '#F59E0B', fontSize: 15, fontFamily: 'monospace' }}>{formatCurrency(d.totalRevenue || 0)}</strong>
              </div>
            ))}
            {scoped.length === 0 && (
              <div style={{ padding: '20px 14px', color: 'var(--text-muted)', textAlign: 'center', fontSize: 13 }}>
                Aucune donnée pour le moment.
              </div>
            )}
          </div>
        </div>

      </>}

      {/* ── Payroll simulator tab ───────────────────────────────────────── */}
      {subTab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ padding: '10px 12px', background: 'rgba(249,115,22,0.10)', color: 'var(--primary)', borderRadius: 10, fontSize: 22, flexShrink: 0 }}>%</div>
            <div>
              <h3 style={{ color: 'var(--text)', fontSize: 17, fontWeight: 950, margin: '0 0 4px 0' }}>
                Simulateur de Fiche de Paie (Québec — Déductions)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Visualisez les déductions provinciales du Québec (RRQ) et de l&apos;assurance-emploi.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
            {/* Input side */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
              <label style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                Salaire Brut à Tester ($)
              </label>
              <input
                type="number"
                value={grossInput}
                onChange={e => setGrossInput(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 16, fontWeight: 700, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }}
                min="0"
                step="100"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>
                Ce simulateur correspond aux barèmes de déductions à la source moyennes pour un travailleur du bâtiment (sous-traitant ou salarié) enregistré au Québec.
              </p>
            </div>

            {/* Results side */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Gains brut',                          value: `${gross.toFixed(2)}$`,    color: 'var(--text)' },
                { label: 'Impôt Fédéral estimé (15%)',          value: `${fedTax.toFixed(2)}$`,   color: '#EF4444' },
                { label: 'Impôt Provincial (Qc) estimé (15%)',  value: `${provTax.toFixed(2)}$`,  color: '#EF4444' },
                { label: 'RRQ / RPC estimé (6.4%)',             value: `${rrq.toFixed(2)}$`,      color: '#EF4444' },
                { label: "Assurance-Emploi (AE) (1.27%)",       value: `${ae.toFixed(2)}$`,       color: '#EF4444' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row.label}</span>
                  <span style={{ color: row.color, fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid var(--border-strong, var(--border))', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gains Net de Poche</span>
                <span style={{ color: '#22C55E', fontSize: 20, fontWeight: 950, fontFamily: 'monospace' }}>{netPay.toFixed(2)}$</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
