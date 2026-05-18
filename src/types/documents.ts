export type DocumentType = 'invoice' | 'quote' | 'contract'
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type PermitBy = 'client' | 'contractor' | 'na'
export type PaymentMode = 'cheque' | 'etransfer' | 'virement' | 'cash'

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  unitPrice: number
  // Sous-type pour devis/contrat
  category?: 'materials' | 'labour' | 'other' | 'subcontract'
}

// ── Matériaux (devis/contrat) ────────────────────────────────────────────────
export interface MaterialLine {
  id: string
  claddingType: string   // ex: Fiber cement, Vinyl, Wood
  brand: string          // ex: James Hardie, Gentek
  thickness: string      // ex: 7/16"
  qtysqft: number        // pi²
  supplier: string
  unitPrice: number
}

// ── Main-d'œuvre (devis/contrat) ─────────────────────────────────────────────
export interface LabourLine {
  id: string
  task: string           // Dépose, Préparation, Installation, Finitions, Nettoyage
  estimatedHours: number
  rate: number           // $/h ou forfait
  isFlatRate: boolean
}

// ── Autres frais ─────────────────────────────────────────────────────────────
export interface OtherLine {
  id: string
  description: string    // Déplacement, Débris, Location nacelle…
  amount: number
}

// ── Sous-traitance ───────────────────────────────────────────────────────────
export interface SubcontractLine {
  id: string
  companyName: string
  phone: string
  workType: string
  amount: number
}

export interface GCPDocument {
  id: string
  type: DocumentType
  number: string
  date: string
  dueDate?: string
  status: DocumentStatus

  // ── Références croisées ─────────────────────────────────────────────────
  refQuote?: string
  refContract?: string

  // ── Client ──────────────────────────────────────────────────────────────
  clientId?: string
  clientName: string
  clientAddress?: string
  clientEmail?: string
  clientPhone?: string
  siteAddress?: string   // Adresse du chantier si différente

  // ── Compagnie (auto depuis useCompanyStore) ──────────────────────────────
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGST?: string
  companyWCB?: string
  companyBN?: string
  companyLogo?: string

  // ── Lignes standard (Facture) ────────────────────────────────────────────
  lines: LineItem[]

  // ── Lignes structurées (Devis / Contrat) ─────────────────────────────────
  materialLines?: MaterialLine[]
  labourLines?: LabourLine[]
  otherLines?: OtherLine[]
  subcontractLines?: SubcontractLine[]

  // ── Calculs ──────────────────────────────────────────────────────────────
  subtotal: number
  subtotalMaterials?: number
  subtotalLabour?: number
  subtotalOther?: number
  subtotalSubcontract?: number
  discountPct?: number
  discountAmount?: number
  taxRate: number
  taxAmount: number
  total: number
  depositAmount?: number
  depositPct?: number
  paymentMidPct?: number
  paymentFinalPct?: number
  balanceDue?: number

  // ── Conditions légales Alberta ───────────────────────────────────────────
  lateInterestPct?: number    // % / mois (défaut 2)
  holdbackPct?: number        // Builders' Lien Act %
  warrantyYears?: number      // Garantie pose X ans
  quoteValidDays?: number     // Validité devis (jours)
  workStartDate?: string
  workEndDate?: string
  permitBy?: PermitBy         // Qui obtient les permis
  acceptedPayments?: PaymentMode[]

  // ── Clauses contrat ──────────────────────────────────────────────────────
  contractObject?: string     // Description générale du contrat
  clauseChangeOrder?: string  // Procédure modifications
  clauseResiliation?: string  // Conditions résiliation
  clauseWarrantyDetails?: string  // Ce qui est couvert / exclu
  hasInsurance?: boolean
  subcontractAuthorized?: boolean
  subcontractorName?: string
  subcontractorPhone?: string
  subcontractorLicense?: string

  // ── Notes / signature ────────────────────────────────────────────────────
  notes?: string
  signature?: string          // Client (base64 canvas)

  // ── Timestamps ───────────────────────────────────────────────────────────
  createdAt: string
  updatedAt: string
}

// Alias de compatibilité
export type Document = GCPDocument
