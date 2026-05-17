// src/store/useInvoiceStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  date?: string        // date de la journée de travail
  address?: string     // adresse du chantier
  fromPunch?: boolean  // auto-généré depuis punch in/out
}

export interface EmployeeInvoice {
  id: string
  employeeId: string
  employeeName: string
  number: string           // ex: PAT-2026-0001
  date: string
  dueDate: string
  status: 'brouillon' | 'envoye' | 'paye'
  items: InvoiceLineItem[]
  subtotal: number
  gstAmount: number
  total: number
  deposit: number
  balanceDue: number
  notes: string
  clientName: string
  clientEmail: string
  clientPhone: string
}

interface InvoiceStore {
  invoices: EmployeeInvoice[]
  createInvoice: (employeeId: string, employeeName: string, number: string) => EmployeeInvoice
  updateInvoice: (id: string, updates: Partial<EmployeeInvoice>) => void
  addLineItem: (invoiceId: string, item?: Partial<InvoiceLineItem>) => void
  updateLineItem: (invoiceId: string, itemId: string, updates: Partial<InvoiceLineItem>) => void
  removeLineItem: (invoiceId: string, itemId: string) => void
  calculateTotals: (invoiceId: string) => void
  deleteInvoice: (id: string) => void
  getEmployeeInvoices: (employeeId: string) => EmployeeInvoice[]
}

function today(): string { return new Date().toISOString().split('T')[0] }
function addDays(d: string, n: number): string {
  const date = new Date(d); date.setDate(date.getDate() + n); return date.toISOString().split('T')[0]
}
function makeId(): string { return Date.now().toString() + Math.random().toString(36).slice(2, 7) }

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      createInvoice: (employeeId, employeeName, number) => {
        const inv: EmployeeInvoice = {
          id: makeId(),
          employeeId,
          employeeName,
          number,
          date: today(),
          dueDate: addDays(today(), 30),
          status: 'brouillon',
          items: [{
            id: makeId(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
          }],
          subtotal: 0,
          gstAmount: 0,
          total: 0,
          deposit: 0,
          balanceDue: 0,
          notes: '',
          clientName: '',
          clientEmail: '',
          clientPhone: '',
        }
        set(state => ({ invoices: [...state.invoices, inv] }))
        return inv
      },

      updateInvoice: (id, updates) => set(state => ({
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv)
      })),

      addLineItem: (invoiceId, item) => {
        const newItem: InvoiceLineItem = {
          id: makeId(),
          description: item?.description || '',
          quantity: item?.quantity || 1,
          unitPrice: item?.unitPrice || 0,
          total: item?.total || 0,
          date: item?.date,
          address: item?.address,
          fromPunch: item?.fromPunch,
        }
        set(state => ({
          invoices: state.invoices.map(inv =>
            inv.id === invoiceId
              ? { ...inv, items: [...inv.items, newItem] }
              : inv
          )
        }))
        get().calculateTotals(invoiceId)
      },

      updateLineItem: (invoiceId, itemId, updates) => {
        set(state => ({
          invoices: state.invoices.map(inv => {
            if (inv.id !== invoiceId) return inv
            const items = inv.items.map(item => {
              if (item.id !== itemId) return item
              const updated = { ...item, ...updates }
              updated.total = updated.quantity * updated.unitPrice
              return updated
            })
            return { ...inv, items }
          })
        }))
        get().calculateTotals(invoiceId)
      },

      removeLineItem: (invoiceId, itemId) => {
        set(state => ({
          invoices: state.invoices.map(inv =>
            inv.id === invoiceId
              ? { ...inv, items: inv.items.filter(i => i.id !== itemId) }
              : inv
          )
        }))
        get().calculateTotals(invoiceId)
      },

      calculateTotals: (invoiceId) => set(state => ({
        invoices: state.invoices.map(inv => {
          if (inv.id !== invoiceId) return inv
          const subtotal = inv.items.reduce((sum, i) => sum + i.total, 0)
          const gstAmount = subtotal * 0.05
          const total = subtotal + gstAmount
          const balanceDue = total - inv.deposit
          return { ...inv, subtotal, gstAmount, total, balanceDue }
        })
      })),

      deleteInvoice: (id) => set(state => ({
        invoices: state.invoices.filter(inv => inv.id !== id)
      })),

      getEmployeeInvoices: (employeeId) =>
        get().invoices.filter(inv => inv.employeeId === employeeId),
    }),
    { name: 'employee-invoice-store-v1' }
  )
)

