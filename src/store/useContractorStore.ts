'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ContractorPaymentMethod = 'etransfer' | 'cheque' | 'cash' | 'direct_deposit'
export type ContractorInvoiceStatus = 'pending' | 'approved' | 'paid' | 'void'

export interface ContractorInvoice {
  id: string

  // ── Sous-traitant ─────────────────────────────────────────────────────────
  contractorId: string          // = employee.id avec workerType: 'contractor'
  contractorName: string        // Nom complet
  contractorBusinessName: string // "Toiture Leblanc Inc." ou même que le nom
  contractorAddress: string     // Adresse complète pour l'invoice
  contractorGST: string         // N° GST si inscrit (sinon vide)
  contractorSIN: string         // NAS si PAS de GST → T4A requis

  // ── Invoice ───────────────────────────────────────────────────────────────
  invoiceNumber: string         // Leur numéro à eux (ex: "LEB-2026-042")
  periodStart: string           // ISO date début de la période travaillée
  periodEnd: string             // ISO date fin de la période travaillée
  workDescription: string       // Description des travaux

  // ── Montants ──────────────────────────────────────────────────────────────
  amount: number                // Montant des travaux (avant GST)
  gstApplied: boolean           // true si le contractor a un # GST
  gstAmount: number             // amount * 5% si gstApplied, sinon 0
  totalAmount: number           // amount + gstAmount

  // ── Légal CRA ─────────────────────────────────────────────────────────────
  t4aRequired: boolean          // true si PAS de GST (NAS requis pour T4A)
  // Note : aucune déduction à la source pour les sous-traitants
  // Le contractor est responsable de ses propres remises fiscales

  // ── Paiement ──────────────────────────────────────────────────────────────
  paymentMethod: ContractorPaymentMethod
  paymentDate: string           // ISO date
  paymentRef: string            // # chèque, confirmation e-transfer
  status: ContractorInvoiceStatus

  // ── Méta ──────────────────────────────────────────────────────────────────
  notes: string
  createdAt: string
  updatedAt: string
}

interface ContractorStore {
  invoices: ContractorInvoice[]
  addInvoice: (data: Omit<ContractorInvoice, 'id' | 'createdAt' | 'updatedAt'>) => ContractorInvoice
  updateInvoice: (id: string, updates: Partial<ContractorInvoice>) => void
  deleteInvoice: (id: string) => void
  // Helpers
  getByContractor: (contractorId: string) => ContractorInvoice[]
  getPendingByContractor: (contractorId: string) => ContractorInvoice[]
  getTotalPaidByContractor: (contractorId: string) => number
  getT4ACandidates: (year: number) => ContractorInvoice[] // tous ceux sans GST > 500$
  getTotalByYear: (year: number) => Record<string, number> // contractorId → total
}

const uid = () => Date.now().toString() + Math.random().toString(36).slice(2, 6)

// Calcule le montant GST selon si le contractor est inscrit ou non
export function calcContractorAmounts(amount: number, gstApplied: boolean) {
  const gstAmount = gstApplied ? Math.round(amount * 0.05 * 100) / 100 : 0
  const totalAmount = amount + gstAmount
  return { gstAmount, totalAmount }
}

export const useContractorStore = create<ContractorStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (data) => {
        const now = new Date().toISOString()
        const newInvoice: ContractorInvoice = {
          ...data,
          id: uid(),
          createdAt: now,
          updatedAt: now,
        }
        set(state => ({ invoices: [...state.invoices, newInvoice] }))
        return newInvoice
      },

      updateInvoice: (id, updates) => set(state => ({
        invoices: state.invoices.map(inv =>
          inv.id === id
            ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
            : inv
        ),
      })),

      deleteInvoice: (id) => set(state => ({
        invoices: state.invoices.filter(inv => inv.id !== id),
      })),

      getByContractor: (contractorId) =>
        get().invoices
          .filter(inv => inv.contractorId === contractorId)
          .sort((a, b) => b.periodStart.localeCompare(a.periodStart)),

      getPendingByContractor: (contractorId) =>
        get().invoices.filter(
          inv => inv.contractorId === contractorId && inv.status === 'pending'
        ),

      getTotalPaidByContractor: (contractorId) =>
        get().invoices
          .filter(inv => inv.contractorId === contractorId && inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),

      // CRA : T4A requis si on paie > 500$ à un sous-traitant sans GST dans l'année
      getT4ACandidates: (year) => {
        const byContractor: Record<string, ContractorInvoice[]> = {}
        get().invoices
          .filter(inv =>
            inv.t4aRequired &&
            inv.status === 'paid' &&
            inv.periodStart.startsWith(String(year))
          )
          .forEach(inv => {
            if (!byContractor[inv.contractorId]) byContractor[inv.contractorId] = []
            byContractor[inv.contractorId].push(inv)
          })
        // Retourner seulement ceux dont le total annuel > 500$
        return Object.values(byContractor)
          .filter(invs => invs.reduce((s, i) => s + i.amount, 0) > 500)
          .flat()
      },

      getTotalByYear: (year) => {
        const result: Record<string, number> = {}
        get().invoices
          .filter(inv =>
            inv.status === 'paid' &&
            inv.periodStart.startsWith(String(year))
          )
          .forEach(inv => {
            result[inv.contractorId] = (result[inv.contractorId] || 0) + inv.totalAmount
          })
        return result
      },
    }),
    { name: 'contractor-store-v1' }
  )
)

