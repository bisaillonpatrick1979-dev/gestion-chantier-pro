'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ClientInvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type PayrollStatus = 'draft' | 'approved' | 'paid' | 'held' | 'refused'
export type ExpenseStatus = 'unpaid' | 'paid' | 'reimbursed'

export type ClientInvoiceRecord = {
  id: string
  invoiceNo: string
  clientName: string
  projectName?: string
  amount: number
  taxAmount: number
  paidAmount: number
  issueDate: string
  dueDate: string
  status: ClientInvoiceStatus
}

export type PayrollPaymentRecord = {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  periodStart: string
  periodEnd: string
  paidAt?: string
  status: PayrollStatus
  note?: string
}

export type ExpenseRecord = {
  id: string
  vendor: string
  category: 'materials' | 'tools' | 'fuel' | 'rental' | 'subcontractor' | 'admin' | 'other'
  projectName?: string
  amount: number
  taxAmount: number
  date: string
  status: ExpenseStatus
  note?: string
}

type AccountingStore = {
  clientInvoices: ClientInvoiceRecord[]
  payrollPayments: PayrollPaymentRecord[]
  expenses: ExpenseRecord[]
  addClientInvoice: (data: Omit<ClientInvoiceRecord, 'id'>) => void
  addPayrollPayment: (data: Omit<PayrollPaymentRecord, 'id'>) => void
  addExpense: (data: Omit<ExpenseRecord, 'id'>) => void
  updateClientInvoice: (id: string, patch: Partial<ClientInvoiceRecord>) => void
  updatePayrollPayment: (id: string, patch: Partial<PayrollPaymentRecord>) => void
  updateExpense: (id: string, patch: Partial<ExpenseRecord>) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useAccountingStore = create<AccountingStore>()(
  persist(
    (set, get) => ({
      clientInvoices: [],
      payrollPayments: [],
      expenses: [],
      addClientInvoice: data => set({ clientInvoices: [{ id: uid(), ...data }, ...get().clientInvoices] }),
      addPayrollPayment: data => set({ payrollPayments: [{ id: uid(), ...data }, ...get().payrollPayments] }),
      addExpense: data => set({ expenses: [{ id: uid(), ...data }, ...get().expenses] }),
      updateClientInvoice: (id, patch) => set({ clientInvoices: get().clientInvoices.map(x => x.id === id ? { ...x, ...patch } : x) }),
      updatePayrollPayment: (id, patch) => set({ payrollPayments: get().payrollPayments.map(x => x.id === id ? { ...x, ...patch } : x) }),
      updateExpense: (id, patch) => set({ expenses: get().expenses.map(x => x.id === id ? { ...x, ...patch } : x) }),
    }),
    { name: 'gestion-chantier-accounting-v1' }
  )
)
