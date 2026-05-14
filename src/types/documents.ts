export type DocumentType = 'facture' | 'devis' | 'contrat'
export type DocumentStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Document {
  id: string
  type: DocumentType
  status: DocumentStatus
  number: string
  date: string
  dueDate: string
  client: {
    name: string
    address: string
    city: string
    province: string
    postalCode: string
    email: string
    phone: string
  }
  company: {
    name: string
    address: string
    city: string
    province: string
    postalCode: string
    email: string
    phone: string
    license: string
  }
  items: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  terms: string
  contractorSignature?: string
  contractorSignatureDate?: string
  clientSignature?: string
  clientSignatureDate?: string
  createdAt: string
}
