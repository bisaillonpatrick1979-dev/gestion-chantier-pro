'use client'

import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { formatCurrency } from '@/lib/formatters'
import { DecoTitle, DecoSeparator } from '@/components/DecoElements'

type Detail = {
  date: string
  employeeId: string
  totalHours?: number
  totalRevenue?: number
  totalBreak?: number
  sessions?: unknown[]
  projectName?: string
}

type TrendKind = 'up' | 'down' | 'flat'

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const period = (offset = 0) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = offset === 0 ? now : new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { start: dateKey(start), end: dateKey(end), label: start.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }) }
}
const inside = (date: string | undefined, p: { start: string; end: string }) => !!date && date >= p.start && date <= p.end
const pct = (now: number, before: number) => before === 0 ? (now === 0 ? 0 : 100) : ((now - before) / before) * 100
const trendData = (now: number, before: number) => {
  const value = pct(now, before)
  const kind: TrendKind = Math.abs(value) < 0.05 ? 'flat' : value > 0 ? 'up' : 'down'
  return { text: `${kind === 'up' ? '↗ +' : kind === 'down' ? '↘ ' : '→ '}${value.toFixed(1)}% vs mois passé`, kind }
}

function calc(details: Detail[]) {
  const revenue = details.reduce((s, d) => s + (d.totalRevenue || 0), 0)
  const hours = details.reduce((s, d) => s + (d.totalHours || 0), 0)
  const sessions = details.reduce((s, d) => s + (d.sessions?.length || 0), 0)
  const days = details.length
  return { revenue, hours, sessions, days, avgHour: hours ? revenue / hours : 0, avgDay: days ? revenue / days : 0 }
}

export default function StatsPage() {
  const employeeState = useEmployeeStore()
  const accountingState = useAccountingStore()
  const employees = employeeState.employees || []
  const currentEmployeeId = employeeState.currentEmployeeId
  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = !currentEmployee || currentEmployee.role === 'admin' || currentEmployee.role === 'accountant'
  const allDetails = Object.values(employeeState.dayDetails || {}) as Detail[]
  const current = period(0)
  const previous = period(-1)
  const scoped = isAdmin ? allDetails : allDetails.filter(d => d.employeeId === currentEmployeeId)
  const cur = calc(scoped.filter(d => inside(d.date, current)))
  const prev = calc(scoped.filter(d => inside(d.date, previous)))
  const activeSessions = employeeState.activeSessions || {}
  const liveIds = Object.keys(activeSessions)
  const liveMoney = liveIds.reduce((s, id) => s + (activeSessions[id]?.revenue || 0), 0)
  const invoices = accountingState.clientInvoices || []
  const expenses = accountingState.expenses || []
  const payroll = accountingState.payrollPayments || []
  const invoiced = invoices.reduce((s, i) => s + i.amount + i.taxAmount, 0)
  const collected = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const expenseTotal = expenses.reduce((s, e) => s + e.amount + e.taxAmount, 0)
  const payrollDue = payroll.filter(p => p.status !== 'paid' && p.status !== 'refused').reduce((s, p) => s + p.amount, 0)
  const payrollPaid = payroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const workerCount = employees.filter(e => e.id !== 'admin' && e.active).length
  const projectCount = new Set(allDetails.map(d => d.projectName).filter(Boolean)).size
  const revenueTrend = trendData(cur.revenue, prev.revenue)
  const hoursTrend = trendData(cur.hours, prev.hours)

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 10 }}>
    <div style={{ paddingTop: 4 }}><DecoTitle>{isAdmin ? 'STATISTIQUES ADMINISTRATION' : 'STATISTIQUES PERSONNELLES'}</DecoTitle></div>
    <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.45 }}>Vue stable du mois courant. Les panneaux détaillés employés, comptabilité et projets se chargent plus bas.</p>
    <DecoSeparator opacity={0.2}/>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
      <Metric title="Revenu punchs" value={formatCurrency(cur.revenue)} sub={revenueTrend.text} trend={revenueTrend.kind} />
      <Metric title="Heures" value={`${cur.hours.toFixed(1)} h`} sub={`${cur.days} jour(s) · ${cur.sessions} session(s) · ${hoursTrend.text}`} trend={hoursTrend.kind} />
      <Metric title="Moyenne horaire" value={formatCurrency(cur.avgHour)} sub={`Moyenne/jour ${formatCurrency(cur.avgDay)}`} />
      <Metric title="Live en cours" value={formatCurrency(liveMoney)} sub={`${liveIds.length} punch(s) actif(s)`} />
    </section>

    {isAdmin && <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: 16 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 950 }}>Résumé admin</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10, marginTop: 12 }}>
        <Metric title="Facturé client" value={formatCurrency(invoiced)} sub={`Encaissé ${formatCurrency(collected)}`} />
        <Metric title="Dépenses" value={formatCurrency(expenseTotal)} sub="Matériaux, outils, frais" danger />
        <Metric title="Paies" value={formatCurrency(payrollPaid + payrollDue)} sub={`Payé ${formatCurrency(payrollPaid)} · dû ${formatCurrency(payrollDue)}`} warning />
        <Metric title="Équipe / projets" value={`${workerCount}`} sub={`${projectCount} projet(s) avec punchs`} />
      </div>
    </section>}

    <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: 16 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 950 }}>Historique récent</h2>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {scoped.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12).map((d, idx) => <div key={`${d.employeeId}-${d.date}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: 10, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div><b style={{ color: 'var(--text)', fontSize: 16 }}>{d.date || 'Date inconnue'}</b><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{(d.totalHours || 0).toFixed(1)} h · {d.projectName || 'sans projet'}</p></div>
          <strong style={{ color: '#facc15', fontSize: 17 }}>{formatCurrency(d.totalRevenue || 0)}</strong>
        </div>)}
        {scoped.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 16, padding: 12 }}>Aucune donnée pour le moment. Tu peux injecter la démo 5 ans locale dans DevTools.</p>}
      </div>
    </section>
  </div>
}

function Metric({ title, value, sub, trend, danger, warning }: { title: string; value: string; sub: string; trend?: TrendKind; danger?: boolean; warning?: boolean }) {
  const valueColor = danger ? '#fb7185' : warning ? '#facc15' : '#7dd3fc'
  const subColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : trend === 'flat' ? '#facc15' : 'var(--text-muted)'
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14, minWidth: 0, overflow: 'hidden' }}><p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 900 }}>{title}</p><p style={{ color: valueColor, fontSize: 'clamp(25px, 8.4vw, 34px)', lineHeight: 1.02, fontWeight: 950, marginTop: 6, maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word', letterSpacing: '-0.06em', textShadow: '0 0 12px rgba(125,211,252,.28)' }}>{value}</p><p style={{ color: subColor, fontSize: 14, marginTop: 7, fontWeight: trend ? 900 : 600 }}>{sub}</p></div>
}
