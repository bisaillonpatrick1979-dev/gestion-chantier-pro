'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Document, DocumentType, LineItem } from '@/types/documents'

interface DocumentStore {
  documents: Document[]
  addDocument: (type: DocumentType) => Document
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  addLineItem: (docId: string) => void
  updateLineItem: (docId: string, itemId: string, updates: Partial<LineItem>) => void
  removeLineItem: (docId: string, itemId: string) => void
  calculateTotals: (docId: string) => void
}

const generateNumber = (type: DocumentType, count: number): string => {
  const prefix = type === 'facture' ? 'FAC' : type === 'devis' ? 'DEV' : 'CON'
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(4, '0')
  return `${prefix}-${year}-${num}`
}

const defaultCompany = {
  name: 'Hailite Xteriors',
  address: '123 Rue Principale',
  city: 'Montréal',
  province: 'QC',
  postalCode: 'H1A 1A1',
  email: 'info@hailite.com',
  phone: '514-555-0000',
  license: 'RBQ-123456',
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],

      addDocument: (type) => {
        const { documents } = get()
        const typeCount = documents.filter(d => d.type === type).length
        const now = new Date()
        const due = new Date(now)
        due.setDate(due.getDate() + 30)

        const newDoc: Document = {
          id: Date.now().toString(),
          type,
          status: 'brouillon',
          number: generateNumber(type, typeCount),
          date: now.toISOString().split('T')[0],
          dueDate: due.toISOString().split('T')[0],
          client: {
            name: '', address: '', city: '',
            province: 'QC', postalCode: '',
            email: '', phone: '',
          },
          company: defaultCompany,
          items: [{
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
          }],
          subtotal: 0,
          taxRate: 14.975,
          taxAmount: 0,
          total: 0,
          notes: '',
          terms: type === 'facture'
            ? 'Paiement dû dans 30 jours.'
            : type === 'devis'
            ? 'Ce devis est valide pour 30 jours.'
            : 'Ce contrat est valide une fois signé par les deux parties.',
          createdAt: now.toISOString(),
        }

        set({ documents: [...documents, newDoc] })
        return newDoc
      },

      updateDocument: (id, updates) => {
        set(state => ({
          documents: state.documents.map(d =>
            d.id === id ? { ...d, ...updates } : d
          )
        }))
      },

      deleteDocument: (id) => {
        set(state => ({
          documents: state.documents.filter(d => d.id !== id)
        }))
      },

      addLineItem: (docId) => {
        const newItem: LineItem = {
          id: Date.now().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        }
        set(state => ({
          documents: state.documents.map(d =>
            d.id === docId
              ? { ...d, items: [...d.items, newItem] }
              : d
          )
        }))
      },

      updateLineItem: (docId, itemId, updates) => {
        set(state => ({
          documents: state.documents.map(d => {
            if (d.id !== docId) return d
            const items = d.items.map(item => {
              if (item.id !== itemId) return item
              const updated = { ...item, ...updates }
              updated.total = updated.quantity * updated.unitPrice
              return updated
            })
            return { ...d, items }
          })
        }))
        get().calculateTotals(docId)
      },

      removeLineItem: (docId, itemId) => {
        set(state => ({
          documents: state.documents.map(d =>
            d.id === docId
              ? { ...d, items: d.items.filter(i => i.id !== itemId) }
              : d
          )
        }))
        get().calculateTotals(docId)
      },

      calculateTotals: (docId) => {
        set(state => ({
          documents: state.documents.map(d => {
            if (d.id !== docId) return d
            const subtotal = d.items.reduce((sum, i) => sum + i.total, 0)
            const taxAmount = subtotal * (d.taxRate / 100)
            const total = subtotal + taxAmount
            return { ...d, subtotal, taxAmount, total }
          })
        }))
      },
    }),
    { name: 'document-store-v1' }
  )
)
