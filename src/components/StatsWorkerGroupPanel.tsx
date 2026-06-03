'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useAccountingStore } from '@/store/useAccountingStore'
import { formatCurrency } from '@/lib/formatters'
import type { Employee } from '@/types/employee'

type Detail = {
  date: string
  employeeId: string
  totalHours: number
  totalRevenue: number
  totalBreak: number
  sessions: unknown[]
}

type GroupKey = 'employees' | 'contractors' | 'all'

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const monthPeriod = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: dateKey(start), end: dateKey(now) }
}
const inPeriod = (date: string, p: { start: string; end: string }) => date >= p.start && date <= p.end

function calc(details: Detail[]) {
  const revenue = details.reduce((s, d) => s + (d.totalRevenue || 0), 0)
  const hours = details.reduce((s, d) => s + (d.totalHours || 0), 0)
  const days = details.length
  return { revenue, hours, days, avgHour: hours ? revenue / hours : 0, avgDay: days ? revenue / days : 0 }
}

function roleLabel(emp: Employee) {
  if (emp.workerType === 'contractor') return emp.accessProfile === 'self_employed' ? 'Travailleur autonome' : 'Sous-traitant'
  if (emp.role === 'accountant') return 'Comptable'
  if (emp.role === 'secretary') return 'Secrétaire'
  return 'Employé salarié'
}

export default function StatsWorkerGroupPanel() {
  const pathname = usePathname()
  const { employees, currentEmployeeId, dayDetails, activeSessions } = useEmployeeStore()
  const { payrollPayments } = useAccountingStore()
  const [group, setGroup] = useState<GroupKey>('employees')
  const [selectedId, setSelectedId] = useState('')

  const current = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = !current || current.role === 'admin' || current.role === 'accountant'
  const period = useMemo(() => monthPeriod(), [])
  const allDetails = useMemo(() => Object.values(dayDetails || {}) as Detail[], [dayDetails])
  const activeWorkers = useMemo(() => (employees || []).filter(e => e.id !== 'admin' && e.active), [employees])
  const groupWorkers = useMemo(() => group === 'employees'
    ? activeWorkers.filter(e => e.role === 'employee' && e.workerType === 'salaried')
    : group === 'contractors'
      ? activeWorkers.filter(e => e.workerType === 'contractor')
      : activeWorkers, [group, activeWorkers])
  const selected = groupWorkers.find(e => e.id === selectedId) || groupWorkers[0]

  const rows = useMemo(() => groupWorkers.map(emp => {
    const details = allDetails.filter(d => d.employeeId === emp.id && inPeriod(d.date, period))
    const s = calc(details)
    const payroll = (payrollPayments || []).filter(p => p.employeeId === emp.id && inPeriod(p.periodEnd, period))
    const paid = payroll.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const due = payroll.filter(p => p.status !== 'paid' && p.status !== 'refused').reduce((sum, p) => sum + p.amount, 0)
    const held = payroll.filter(p => p.status === 'held').reduce((sum, p) => sum + p.amount, 0)
    const live = activeSessions?.[emp.id]
    return { emp, details, stats: s, paid, due, held, livePay: live?.revenue || 0, liveHours: live ? (live.elapsed || 0) / 3600 : 0 }
  }).sort((a, b) => (b.stats.revenue + b.livePay) - (a.stats.revenue + a.livePay)), [groupWorkers, allDetails, period, payrollPayments, activeSessions])

  const groupTotal = rows.reduce((acc, r) => ({
    revenue: acc.revenue + r.stats.revenue,
    hours: acc.hours + r.stats.hours,
    days: acc.days + r.stats.days,
    paid: acc.paid + r.paid,
    due: acc.due + r.due,
    held: acc.held + r.held,
    livePay: acc.livePay + r.livePay,
    liveHours: acc.liveHours + r.liveHours,
  }), { revenue: 0, hours: 0, days: 0, paid: 0, due: 0, held: 0, livePay: 0, liveHours: 0 })
  const selectedRow = selected ? rows.find(r => r.emp.id === selected.id) : null

  if (pathname !== '/stats') return null
  if (!isAdmin) return null

  return <section className="stats-worker-group-panel" style={{ maxWidth: 1180, margin: '14px auto 110px', padding: '0 16px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 18 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 950 }}>👷 Statistiques travailleurs détaillées</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 4 }}>Résumé du mois courant par groupe et fiche personnelle de chaque employé/sous-traitant.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
        <GroupTab active={group === 'employees'} title="Employés" sub="Salariés" onClick={() => { setGroup('employees'); setSelectedId('') }} />
        <GroupTab active={group === 'contractors'} title="Sous-traitants" sub="Inclut autonomes" onClick={() => { setGroup('contractors'); setSelectedId('') }} />
        <GroupTab active={group === 'all'} title="Tous" sub="Tous les profils" onClick={() => { setGroup('all'); setSelectedId('') }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 14 }}>
        <Metric title="Total groupe" value={formatCurrency(groupTotal.revenue)} sub={`${groupTotal.hours.toFixed(1)} h · ${groupTotal.days} jours`} />
        <Metric title="Paies payées" value={formatCurrency(groupTotal.paid)} sub={`À payer: ${formatCurrency(groupTotal.due)}`} />
        <Metric title="Retenues" value={formatCurrency(groupTotal.held)} sub="Paies marquées retenues" />
        <Metric title="En cours live" value={formatCurrency(groupTotal.livePay)} sub={`${groupTotal.liveHours.toFixed(1)} h live`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,.85fr) minmax(0,1.25fr)', gap: 12, marginTop: 14 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Aucun travailleur dans ce groupe.</p>}
          {rows.map(r => <button key={r.emp.id} onClick={() => setSelectedId(r.emp.id)} style={{ textAlign: 'left', borderRadius: 16, padding: 12, border: `1px solid ${selected?.id === r.emp.id ? 'var(--primary)' : 'var(--border)'}`, background: selected?.id === r.emp.id ? 'var(--primary)18' : 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 52, height: 52, borderRadius: '50%', background: r.emp.color, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 950, fontSize: 22 }}>{r.emp.name[0]}</div><div><b style={{ color: 'var(--text)', fontSize: 19 }}>{r.emp.name}</b><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{roleLabel(r.emp)}</p></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: 14 }}><span>{formatCurrency(r.stats.revenue)}</span><span>{r.stats.hours.toFixed(1)} h</span><span>Payé {formatCurrency(r.paid)}</span><span>Dû {formatCurrency(r.due)}</span></div>
          </button>)}
        </div>
        {selected && selectedRow && <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 16 }}><h3 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 950 }}>{selected.name}</h3><p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{roleLabel(selected)} · {selected.workMode} · taux: {formatCurrency(selected.hourlyRate)}</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><Metric title="Revenu / paye" value={formatCurrency(selectedRow.stats.revenue)} sub={`${selectedRow.stats.hours.toFixed(1)} h`} /><Metric title="Moyenne réelle" value={formatCurrency(selectedRow.stats.avgHour)} sub={`Par jour: ${formatCurrency(selectedRow.stats.avgDay)}`} /><Metric title="Paie" value={formatCurrency(selectedRow.paid)} sub={`Dû ${formatCurrency(selectedRow.due)} · retenu ${formatCurrency(selectedRow.held)}`} /><Metric title="Live" value={formatCurrency(selectedRow.livePay)} sub={`${selectedRow.liveHours.toFixed(1)} h en cours`} /></div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}><h4 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 950 }}>Historique du mois</h4><div style={{ display: 'grid', gap: 7, marginTop: 8 }}>{selectedRow.details.slice().reverse().slice(0, 10).map(d => <div key={`${d.employeeId}-${d.date}`} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}><span style={{ color: 'var(--text)', fontSize: 15 }}>{d.date} · {d.totalHours.toFixed(1)} h</span><b style={{ color: 'var(--primary)', fontSize: 16 }}>{formatCurrency(d.totalRevenue)}</b></div>)}{selectedRow.details.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Aucune journée ce mois.</p>}</div></div>
        </div>}
      </div>
    </div>
  </section>
}

function GroupTab({ active, title, sub, onClick }: { active: boolean; title: string; sub: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ textAlign: 'left', borderRadius: 16, padding: 12, border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, background: active ? 'var(--primary)18' : 'var(--surface)' }}><b style={{ color: 'var(--text)', fontSize: 18 }}>{title}</b><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{sub}</p></button>
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 900 }}>{title}</p><p style={{ color: 'var(--primary)', fontSize: 28, lineHeight: 1.05, fontWeight: 950, marginTop: 6 }}>{value}</p><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{sub}</p></div>
}
