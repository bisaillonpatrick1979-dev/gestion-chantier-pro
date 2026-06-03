'use client'

import { useState } from 'react'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency } from '@/lib/formatters'

const today = () => new Date().toISOString().slice(0, 10)

export default function AccountingPage() {
  const { employees } = useEmployeeStore()
  const { clientInvoices, payrollPayments, expenses, addClientInvoice, addPayrollPayment, addExpense, updateClientInvoice, updatePayrollPayment, updateExpense } = useAccountingStore()
  const [client, setClient] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [employeeId, setEmployeeId] = useState(employees.find(e => e.id !== 'admin')?.id || '')
  const [payAmount, setPayAmount] = useState('')
  const [vendor, setVendor] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  const invoiceTotal = clientInvoices.reduce((s, x) => s + x.amount + x.taxAmount, 0)
  const clientPaid = clientInvoices.reduce((s, x) => s + x.paidAmount, 0)
  const payrollPaid = payrollPayments.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount, 0)
  const payrollDue = payrollPayments.filter(x => x.status !== 'paid' && x.status !== 'refused').reduce((s, x) => s + x.amount, 0)
  const expensePaid = expenses.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount + x.taxAmount, 0)
  const expenseDue = expenses.filter(x => x.status !== 'paid').reduce((s, x) => s + x.amount + x.taxAmount, 0)

  function addInvoice() {
    const amount = Number(invoiceAmount)
    if (!client.trim() || !amount) return
    addClientInvoice({ invoiceNo: `INV-${Date.now()}`, clientName: client, amount, taxAmount: amount * 0.05, paidAmount: 0, issueDate: today(), dueDate: today(), status: 'sent' })
    setClient('')
    setInvoiceAmount('')
  }
  function addPay() {
    const emp = employees.find(e => e.id === employeeId)
    const amount = Number(payAmount)
    if (!emp || !amount) return
    addPayrollPayment({ employeeId: emp.id, employeeName: emp.name, amount, periodStart: today(), periodEnd: today(), status: 'approved' })
    setPayAmount('')
  }
  function addCost() {
    const amount = Number(expenseAmount)
    if (!vendor.trim() || !amount) return
    addExpense({ vendor, category: 'materials', amount, taxAmount: amount * 0.05, date: today(), status: 'unpaid' })
    setVendor('')
    setExpenseAmount('')
  }

  return <main className="min-h-screen px-4 pb-28 pt-6 text-white">
    <div className="mx-auto max-w-5xl space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-3xl font-black">💼 Centre comptable</h1>
        <p className="mt-2 text-base text-white/65">Suivi complet: argent qui rentre, argent qui sort, paies, dépenses, factures, balances et marge.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric title="Facturé" value={formatCurrency(invoiceTotal)} sub={`Payé ${formatCurrency(clientPaid)}`} />
        <Metric title="Paies" value={formatCurrency(payrollPaid + payrollDue)} sub={`Versé ${formatCurrency(payrollPaid)} · dû ${formatCurrency(payrollDue)}`} />
        <Metric title="Dépenses" value={formatCurrency(expensePaid + expenseDue)} sub={`Payé ${formatCurrency(expensePaid)} · dû ${formatCurrency(expenseDue)}`} />
        <Metric title="Marge brute" value={formatCurrency(clientPaid - payrollPaid - expensePaid)} sub="Selon montants payés" />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3"><h2 className="text-xl font-black">Facture client</h2><input className="big-field" value={client} onChange={e => setClient(e.target.value)} placeholder="Client"/><input className="big-field" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} inputMode="decimal" placeholder="Montant avant GST"/><button className="big-button" onClick={addInvoice}>Ajouter facture</button></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3"><h2 className="text-xl font-black">Paye travailleur</h2><select className="big-field" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>{employees.filter(e => e.id !== 'admin').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><input className="big-field" value={payAmount} onChange={e => setPayAmount(e.target.value)} inputMode="decimal" placeholder="Montant"/><button className="big-button" onClick={addPay}>Ajouter paye à payer</button></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3"><h2 className="text-xl font-black">Dépense / matériau</h2><input className="big-field" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Fournisseur"/><input className="big-field" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} inputMode="decimal" placeholder="Montant avant GST"/><button className="big-button" onClick={addCost}>Ajouter dépense</button></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Ledger title="Factures clients" rows={clientInvoices.map(x => ({ id: x.id, name: x.clientName, meta: `${x.invoiceNo} · ${x.status}`, amount: x.amount + x.taxAmount, sub: `Payé ${formatCurrency(x.paidAmount)} · Balance ${formatCurrency(x.amount + x.taxAmount - x.paidAmount)}`, actions: <><button onClick={() => updateClientInvoice(x.id, { status: 'paid', paidAmount: x.amount + x.taxAmount })}>Payée</button><button onClick={() => updateClientInvoice(x.id, { status: 'overdue' })}>Retard</button></> }))} />
        <Ledger title="Paies" rows={payrollPayments.map(x => ({ id: x.id, name: x.employeeName, meta: `${x.periodStart} → ${x.periodEnd} · ${x.status}`, amount: x.amount, sub: x.note || 'Paye au registre', actions: <><button onClick={() => updatePayrollPayment(x.id, { status: 'paid', paidAt: today() })}>Payée</button><button onClick={() => updatePayrollPayment(x.id, { status: 'held' })}>Retenue</button><button onClick={() => updatePayrollPayment(x.id, { status: 'refused' })}>Refusée</button></> }))} />
        <Ledger title="Dépenses" rows={expenses.map(x => ({ id: x.id, name: x.vendor, meta: `${x.category} · ${x.status}`, amount: x.amount + x.taxAmount, sub: `${x.date} · GST ${formatCurrency(x.taxAmount)}`, actions: <><button onClick={() => updateExpense(x.id, { status: 'paid' })}>Payée</button><button onClick={() => updateExpense(x.id, { status: 'unpaid' })}>Impayée</button></> }))} />
      </section>
    </div>
  </main>
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-base font-black text-white/65">{title}</p><p className="mt-2 text-3xl font-black text-cyan-300">{value}</p><p className="mt-1 text-base text-white/65">{sub}</p></div>
}

function Ledger({ title, rows }: { title: string; rows: Array<{ id: string; name: string; meta: string; amount: number; sub: string; actions: React.ReactNode }> }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><h2 className="text-2xl font-black">{title}</h2><div className="mt-3 space-y-3">{rows.length === 0 ? <p className="text-base text-white/55">Aucune donnée.</p> : rows.map(r => <div key={r.id} className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-start justify-between gap-2"><div><b className="text-lg">{r.name}</b><p className="text-sm text-white/60">{r.meta}</p><p className="text-sm text-white/55">{r.sub}</p></div><strong className="text-xl text-cyan-300">{formatCurrency(r.amount)}</strong></div><div className="mt-3 flex flex-wrap gap-2">{r.actions}</div></div>)}</div></div>
}
