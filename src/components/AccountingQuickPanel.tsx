'use client'

import { useState } from 'react'
import { useAccountingStore } from '@/store/useAccountingStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { formatCurrency } from '@/lib/formatters'

const today = () => new Date().toISOString().slice(0, 10)

export default function AccountingQuickPanel() {
  const { employees } = useEmployeeStore()
  const { clientInvoices, payrollPayments, expenses, addClientInvoice, addPayrollPayment, addExpense } = useAccountingStore()
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceClient, setInvoiceClient] = useState('')
  const [payEmployeeId, setPayEmployeeId] = useState(employees.find(e => e.id !== 'admin')?.id || '')
  const [payAmount, setPayAmount] = useState('')
  const [expenseVendor, setExpenseVendor] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  const invoiced = clientInvoices.reduce((s, x) => s + x.amount + x.taxAmount, 0)
  const collected = clientInvoices.reduce((s, x) => s + x.paidAmount, 0)
  const payrollPaid = payrollPayments.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount, 0)
  const payrollDue = payrollPayments.filter(x => x.status === 'approved' || x.status === 'draft').reduce((s, x) => s + x.amount, 0)
  const expensePaid = expenses.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount + x.taxAmount, 0)
  const expenseDue = expenses.filter(x => x.status === 'unpaid').reduce((s, x) => s + x.amount + x.taxAmount, 0)

  function saveInvoice() {
    const amount = Number(invoiceAmount)
    if (!invoiceClient.trim() || !amount) return
    addClientInvoice({ invoiceNo: `INV-${Date.now()}`, clientName: invoiceClient, amount, taxAmount: amount * 0.05, paidAmount: 0, issueDate: today(), dueDate: today(), status: 'sent' })
    setInvoiceAmount('')
    setInvoiceClient('')
  }
  function savePayroll() {
    const emp = employees.find(e => e.id === payEmployeeId)
    const amount = Number(payAmount)
    if (!emp || !amount) return
    addPayrollPayment({ employeeId: emp.id, employeeName: emp.name, amount, periodStart: today(), periodEnd: today(), status: 'approved' })
    setPayAmount('')
  }
  function saveExpense() {
    const amount = Number(expenseAmount)
    if (!expenseVendor.trim() || !amount) return
    addExpense({ vendor: expenseVendor, category: 'materials', amount, taxAmount: amount * 0.05, date: today(), status: 'unpaid' })
    setExpenseVendor('')
    setExpenseAmount('')
  }

  return <section className="accounting-panel" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: 18 }}>
    <h2 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 950, marginBottom: 10 }}>💼 Suivi comptable admin</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <BigMetric title="Facturé client" value={formatCurrency(invoiced)} sub={`Payé: ${formatCurrency(collected)} · Balance: ${formatCurrency(invoiced - collected)}`} />
      <BigMetric title="Paies" value={formatCurrency(payrollPaid + payrollDue)} sub={`Versé: ${formatCurrency(payrollPaid)} · À payer: ${formatCurrency(payrollDue)}`} />
      <BigMetric title="Dépenses" value={formatCurrency(expensePaid + expenseDue)} sub={`Payé: ${formatCurrency(expensePaid)} · À payer: ${formatCurrency(expenseDue)}`} />
      <BigMetric title="Marge brute" value={formatCurrency(collected - payrollPaid - expensePaid)} sub="Selon montants enregistrés payés" />
    </div>
    <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
      <div className="quick-line"><b>Facture client</b><input value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} placeholder="Client"/><input value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} inputMode="decimal" placeholder="Montant avant GST"/><button onClick={saveInvoice}>Ajouter</button></div>
      <div className="quick-line"><b>Paye employé</b><select value={payEmployeeId} onChange={e => setPayEmployeeId(e.target.value)}>{employees.filter(e => e.id !== 'admin').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><input value={payAmount} onChange={e => setPayAmount(e.target.value)} inputMode="decimal" placeholder="Montant"/><button onClick={savePayroll}>Approuver</button></div>
      <div className="quick-line"><b>Dépense</b><input value={expenseVendor} onChange={e => setExpenseVendor(e.target.value)} placeholder="Fournisseur"/><input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} inputMode="decimal" placeholder="Montant avant GST"/><button onClick={saveExpense}>Ajouter</button></div>
    </div>
  </section>
}

function BigMetric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}><p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 900 }}>{title}</p><p style={{ color: 'var(--primary)', fontSize: 30, lineHeight: 1.05, fontWeight: 950, marginTop: 6 }}>{value}</p><p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.35, marginTop: 6 }}>{sub}</p></div>
}
