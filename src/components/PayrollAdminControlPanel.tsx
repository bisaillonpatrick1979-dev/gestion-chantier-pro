'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAccountingStore, type PayrollStatus } from '@/store/useAccountingStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency } from '@/lib/formatters'

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const monthPeriod = () => {
  const now = new Date()
  return { start: dateKey(new Date(now.getFullYear(), now.getMonth(), 1)), end: dateKey(now), label: now.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' }) }
}
const inPeriod = (date: string, p: { start: string; end: string }) => date >= p.start && date <= p.end

export default function PayrollAdminControlPanel() {
  const pathname = usePathname()
  const { employees, currentEmployeeId, dayDetails } = useEmployeeStore()
  const { payrollPayments, addPayrollPayment, updatePayrollPayment } = useAccountingStore()
  const [selectedId, setSelectedId] = useState('')
  if (pathname !== '/paye') return null
  const current = employees.find(e => e.id === currentEmployeeId)
  const isAdmin = !current || current.role === 'admin' || current.role === 'accountant'
  if (!isAdmin) return null

  const period = monthPeriod()
  const workers = employees.filter(e => e.id !== 'admin' && e.active && (e.role === 'employee' || e.workerType === 'contractor'))
  const selected = workers.find(e => e.id === selectedId) || workers[0]
  const allDetails = Object.values(dayDetails) as Array<{ date: string; employeeId: string; totalRevenue: number; totalHours: number }>

  const rows = useMemo(() => workers.map(emp => {
    const punch = allDetails.filter(d => d.employeeId === emp.id && inPeriod(d.date, period))
    const punchAmount = punch.reduce((s, d) => s + (d.totalRevenue || 0), 0)
    const hours = punch.reduce((s, d) => s + (d.totalHours || 0), 0)
    const pays = payrollPayments.filter(p => p.employeeId === emp.id && inPeriod(p.periodEnd, period))
    return {
      emp,
      punchAmount,
      hours,
      approved: pays.filter(p => p.status === 'approved' || p.status === 'draft').reduce((s, p) => s + p.amount, 0),
      paid: pays.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      held: pays.filter(p => p.status === 'held').reduce((s, p) => s + p.amount, 0),
      refused: pays.filter(p => p.status === 'refused').reduce((s, p) => s + p.amount, 0),
      pays,
    }
  }).sort((a, b) => b.punchAmount - a.punchAmount), [workers, allDetails, payrollPayments, period.start, period.end])
  const selectedRow = selected ? rows.find(r => r.emp.id === selected.id) : null
  const totals = rows.reduce((a, r) => ({ punch: a.punch + r.punchAmount, hours: a.hours + r.hours, approved: a.approved + r.approved, paid: a.paid + r.paid, held: a.held + r.held, refused: a.refused + r.refused }), { punch: 0, hours: 0, approved: 0, paid: 0, held: 0, refused: 0 })

  function createCurrentMonthPay() {
    if (!selectedRow || selectedRow.punchAmount <= 0) return
    addPayrollPayment({ employeeId: selectedRow.emp.id, employeeName: selectedRow.emp.name, amount: Math.round(selectedRow.punchAmount * 100) / 100, periodStart: period.start, periodEnd: period.end, status: 'approved', note: `Paie générée depuis punchs ${period.label}` })
  }
  function setStatus(id: string, status: PayrollStatus) {
    updatePayrollPayment(id, { status, paidAt: status === 'paid' ? dateKey(new Date()) : undefined })
  }

  return <section style={{ maxWidth: 1180, margin: '14px auto 110px', padding: '0 16px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 18 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 950 }}>💵 Contrôle admin des paies</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 4 }}>Paies du mois: {period.label}. Génère depuis les punchs, puis marque payé, retenu ou refusé.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 14 }}>
        <Metric title="À générer punchs" value={formatCurrency(totals.punch)} sub={`${totals.hours.toFixed(1)} h`} />
        <Metric title="Approuvé / dû" value={formatCurrency(totals.approved)} sub="À payer" />
        <Metric title="Payé" value={formatCurrency(totals.paid)} sub="Sortie confirmée" />
        <Metric title="Retenu / refusé" value={formatCurrency(totals.held + totals.refused)} sub={`Retenu ${formatCurrency(totals.held)}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,.85fr) minmax(0,1.25fr)', gap: 12, marginTop: 14 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map(r => <button key={r.emp.id} onClick={() => setSelectedId(r.emp.id)} style={{ textAlign: 'left', borderRadius: 16, padding: 12, border: `1px solid ${selected?.id === r.emp.id ? 'var(--primary)' : 'var(--border)'}`, background: selected?.id === r.emp.id ? 'var(--primary)18' : 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 52, height: 52, borderRadius: '50%', background: r.emp.color, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 950, fontSize: 22 }}>{r.emp.name[0]}</div><div><b style={{ color: 'var(--text)', fontSize: 19 }}>{r.emp.name}</b><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{r.emp.workerType === 'contractor' ? 'Sous-traitant / autonome' : 'Employé salarié'}</p></div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: 14 }}><span>Punch {formatCurrency(r.punchAmount)}</span><span>{r.hours.toFixed(1)} h</span><span>Payé {formatCurrency(r.paid)}</span><span>Dû {formatCurrency(r.approved)}</span></div>
          </button>)}
        </div>

        {selectedRow && <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 16 }}><h3 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 950 }}>{selectedRow.emp.name}</h3><p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{selectedRow.hours.toFixed(1)} h · punchs {formatCurrency(selectedRow.punchAmount)} · payé {formatCurrency(selectedRow.paid)} · dû {formatCurrency(selectedRow.approved)}</p><button onClick={createCurrentMonthPay} style={{ marginTop: 12, minHeight: 52, borderRadius: 14, border: '1px solid var(--border)', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', color: 'white', fontWeight: 950, fontSize: 16, padding: '10px 14px' }}>Créer paie approuvée du mois</button></div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}><h4 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 950 }}>Registre de paie</h4><div style={{ display: 'grid', gap: 8, marginTop: 10 }}>{selectedRow.pays.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Aucune paie enregistrée ce mois.</p>}{selectedRow.pays.map(p => <div key={p.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><b style={{ color: 'var(--text)', fontSize: 16 }}>{p.periodStart} → {p.periodEnd}</b><p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{p.status} · {p.note || '—'}</p></div><strong style={{ color: 'var(--primary)', fontSize: 18 }}>{formatCurrency(p.amount)}</strong></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}><StatusButton label="Payée" onClick={() => setStatus(p.id, 'paid')} /><StatusButton label="Approuvée" onClick={() => setStatus(p.id, 'approved')} /><StatusButton label="Retenue" onClick={() => setStatus(p.id, 'held')} /><StatusButton label="Refusée" onClick={() => setStatus(p.id, 'refused')} /></div></div>)}</div></div>
        </div>}
      </div>
    </div>
  </section>
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 900 }}>{title}</p><p style={{ color: 'var(--primary)', fontSize: 28, lineHeight: 1.05, fontWeight: 950, marginTop: 6 }}>{value}</p><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{sub}</p></div>
}
function StatusButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontWeight: 900, fontSize: 14, padding: '9px 12px' }}>{label}</button>
}
