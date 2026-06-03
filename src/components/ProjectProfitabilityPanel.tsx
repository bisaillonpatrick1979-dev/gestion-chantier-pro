'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency } from '@/lib/formatters'

type DetailLike = {
  date: string
  employeeId: string
  totalRevenue: number
  totalHours: number
  projectName?: string
  clientName?: string
  jobAddress?: string
}

type ProjectRow = {
  key: string
  project: string
  client: string
  invoiced: number
  collected: number
  balance: number
  expenses: number
  labor: number
  laborHours: number
  margin: number
  marginPct: number
  invoices: number
  expenseLines: number
  laborDays: number
}

const fallbackProject = 'Sans projet assigné'

export default function ProjectProfitabilityPanel() {
  const pathname = usePathname()
  const { clientInvoices, expenses } = useAccountingStore()
  const { dayDetails } = useEmployeeStore()
  const [selectedKey, setSelectedKey] = useState('')
  if (pathname !== '/accounting') return null

  const rows = useMemo<ProjectRow[]>(() => {
    const map = new Map<string, ProjectRow>()
    const ensure = (project: string, client = '') => {
      const key = `${project || fallbackProject}::${client || ''}`
      if (!map.has(key)) map.set(key, { key, project: project || fallbackProject, client, invoiced: 0, collected: 0, balance: 0, expenses: 0, labor: 0, laborHours: 0, margin: 0, marginPct: 0, invoices: 0, expenseLines: 0, laborDays: 0 })
      return map.get(key)!
    }

    clientInvoices.forEach(inv => {
      const row = ensure(inv.projectName || fallbackProject, inv.clientName)
      const total = inv.amount + inv.taxAmount
      row.invoiced += total
      row.collected += inv.paidAmount
      row.balance += Math.max(0, total - inv.paidAmount)
      row.invoices += 1
    })

    expenses.forEach(exp => {
      const project = exp.projectName || fallbackProject
      const candidates = Array.from(map.values()).filter(r => r.project === project)
      const row = candidates[0] || ensure(project, '')
      row.expenses += exp.amount + exp.taxAmount
      row.expenseLines += 1
    })

    ;(Object.values(dayDetails) as DetailLike[]).forEach(day => {
      const project = day.projectName || fallbackProject
      const client = day.clientName || ''
      if (project === fallbackProject) return
      const row = ensure(project, client)
      row.labor += day.totalRevenue || 0
      row.laborHours += day.totalHours || 0
      row.laborDays += 1
    })

    return Array.from(map.values()).map(r => {
      const totalCost = r.expenses + r.labor
      const margin = r.collected - totalCost
      return { ...r, margin, marginPct: r.collected ? (margin / r.collected) * 100 : 0 }
    }).sort((a, b) => b.invoiced - a.invoiced)
  }, [clientInvoices, expenses, dayDetails])

  const selected = rows.find(r => r.key === selectedKey) || rows[0]
  const totals = rows.reduce((a, r) => ({ invoiced: a.invoiced + r.invoiced, collected: a.collected + r.collected, balance: a.balance + r.balance, expenses: a.expenses + r.expenses, labor: a.labor + r.labor, laborHours: a.laborHours + r.laborHours, margin: a.margin + r.margin }), { invoiced: 0, collected: 0, balance: 0, expenses: 0, labor: 0, laborHours: 0, margin: 0 })
  const totalMarginPct = totals.collected ? (totals.margin / totals.collected) * 100 : 0

  return <section style={{ maxWidth: 1180, margin: '14px auto 110px', padding: '0 16px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 18 }}>
      <h2 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 950 }}>📊 Rentabilité par projet</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 4 }}>Vue par chantier: facturé, encaissé, balance, dépenses/matériaux, main-d’œuvre et marge brute.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginTop: 14 }}>
        <Metric title="Facturé" value={formatCurrency(totals.invoiced)} sub={`${rows.length} projet(s)`} />
        <Metric title="Encaissé" value={formatCurrency(totals.collected)} sub="Argent reçu" />
        <Metric title="Balance" value={formatCurrency(totals.balance)} sub="À recevoir" />
        <Metric title="Dépenses" value={formatCurrency(totals.expenses)} sub="Matériaux/coûts" />
        <Metric title="Main-d’œuvre" value={formatCurrency(totals.labor)} sub={`${totals.laborHours.toFixed(1)} h`} />
        <Metric title="Marge" value={formatCurrency(totals.margin)} sub={`${totalMarginPct.toFixed(1)}%`} danger={totals.margin < 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,.85fr) minmax(0,1.25fr)', gap: 12, marginTop: 14 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Aucune donnée de projet.</p>}
          {rows.map(r => <button key={r.key} onClick={() => setSelectedKey(r.key)} style={{ textAlign: 'left', borderRadius: 16, padding: 12, border: `1px solid ${selected?.key === r.key ? 'var(--primary)' : 'var(--border)'}`, background: selected?.key === r.key ? 'var(--primary)18' : 'var(--surface)' }}>
            <b style={{ color: 'var(--text)', fontSize: 19 }}>{r.project}</b>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{r.client || 'Client non assigné'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: 14 }}>
              <span>Facturé {formatCurrency(r.invoiced)}</span><span>Balance {formatCurrency(r.balance)}</span><span>Coûts {formatCurrency(r.expenses + r.labor)}</span><span>Marge {formatCurrency(r.margin)}</span>
            </div>
          </button>)}
        </div>

        {selected && <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 16 }}>
            <h3 style={{ color: 'var(--text)', fontSize: 26, fontWeight: 950 }}>{selected.project}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{selected.client || 'Client non assigné'} · {selected.invoices} facture(s) · {selected.expenseLines} dépense(s) · {selected.laborDays} jour(s) de main-d’œuvre</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Metric title="Facturé" value={formatCurrency(selected.invoiced)} sub="Total client" />
            <Metric title="Encaissé" value={formatCurrency(selected.collected)} sub={`Balance ${formatCurrency(selected.balance)}`} />
            <Metric title="Dépenses" value={formatCurrency(selected.expenses)} sub="Matériaux + coûts" />
            <Metric title="Main-d’œuvre" value={formatCurrency(selected.labor)} sub={`${selected.laborHours.toFixed(1)} h`} />
            <Metric title="Coût total" value={formatCurrency(selected.expenses + selected.labor)} sub="Dépenses + main-d’œuvre" />
            <Metric title="Marge brute" value={formatCurrency(selected.margin)} sub={`${selected.marginPct.toFixed(1)}%`} danger={selected.margin < 0} />
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}>
            <h4 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 950 }}>Lecture rapide</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.45, marginTop: 8 }}>{selected.margin >= 0 ? 'Projet rentable selon les montants encaissés, dépenses et main-d’œuvre enregistrées.' : 'Projet déficitaire selon les montants encaissés, dépenses et main-d’œuvre enregistrées.'} La précision dépend des punchs qui ont un projet/client assigné.</p>
          </div>
        </div>}
      </div>
    </div>
  </section>
}

function Metric({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 900 }}>{title}</p><p style={{ color: danger ? 'var(--danger)' : 'var(--primary)', fontSize: 28, lineHeight: 1.05, fontWeight: 950, marginTop: 6 }}>{value}</p><p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>{sub}</p></div>
}
