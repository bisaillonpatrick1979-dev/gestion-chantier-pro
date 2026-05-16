// src/types/documents.ts

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

// Alias pour compatibilité avec useDocumentStore
export type TaxLine = DocumentTax

export interface DocumentClient {
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

export interface DocumentCompany {
  name?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  license?: string
  gst?: string
  wcb?: string
  logo?: string
  [key: string]: string | undefined
}

export interface Document {
  id: string
  type: DocumentType
  number: string
  date: string
  dueDate: string
  createdAt?: string
  status: DocumentStatus
  client: DocumentClient
  company?: DocumentCompany
  items: LineItem[]
  subtotal: number
  discountType: 'percent' | 'fixed'
  discountValue: number
  discountAmount: number
  taxes: DocumentTax[]
  total: number
  totalTax?: number
  deposit: number
  balanceDue: number
  notes: string
  terms: string
  clientSignature?: string
  clientSignatureDate?: string
  contractorSignature?: string
  contractorSignatureDate?: string
  [key: string]: unknown
}

export default Document
