// src/types/documents.ts
// Exports nommés — compatibles avec tous les fichiers qui importent depuis ici

export type DocumentType   = 'facture' | 'devis' | 'contrat'
export type DocumentStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface DocumentTax {
  id: string
  name: string
  rate: number
  enabled: boolean
}

export interface DocumentClient {
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

export interface Document {
  id: string
  type: DocumentType
  number: string
  date: string
  dueDate: string
  status: DocumentStatus
  client: DocumentClient
  items: LineItem[]
  subtotal: number
  discountType: 'percent' | 'fixed'
  discountValue: number
  discountAmount: number
  taxes: DocumentTax[]
  total: number
  deposit: number
  balanceDue: number
  notes: string
  terms: string
}

export default Document
