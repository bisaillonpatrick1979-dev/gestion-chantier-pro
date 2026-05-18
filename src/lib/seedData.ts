// src/lib/seedData.ts
// Données de démonstration pour les tests — tous les PIN : 0000

import type { Employee } from '@/types/employee'
import type { GCPDocument } from '@/types/documents'

const now = new Date().toISOString()

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYÉS
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'seed-admin-001',
    name: 'Patrick Bisaillon',
    role: 'admin',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 45,
    color: '#D6B25E',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  // Contracteurs
  {
    id: 'seed-contractor-001',
    name: 'Jean-François Roy',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 38,
    color: '#3b82f6',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  {
    id: 'seed-contractor-002',
    name: 'Marc Leblanc',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 35,
    color: '#22c55e',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  {
    id: 'seed-contractor-003',
    name: 'Kevin Tremblay',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 32,
    color: '#f97316',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'contractor',
  },
  // Salariés
  {
    id: 'seed-salaried-001',
    name: 'Sophie Gagnon',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 28,
    color: '#a855f7',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'weekly',
  },
  {
    id: 'seed-salaried-002',
    name: 'Luc Fortin',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 30,
    color: '#ec4899',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'biweekly',
  },
  {
    id: 'seed-salaried-003',
    name: 'David Martin',
    role: 'employee',
    pin: '0000',
    workMode: 'heure',
    hourlyRate: 26,
    color: '#14b8a6',
    active: true,
    createdAt: now,
    invoiceSequence: 1,
    workerType: 'salaried',
    employeeCountry: 'CA',
    employeeProvince: 'AB',
    payFrequency: 'weekly',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPAGNIE
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_COMPANY = {
  name: 'Hailite Xteriors',
  ownerName: 'Patrick Bisaillon',
  address: '123 Construction Ave NW',
  city: 'Calgary',
  province: 'AB',
  postalCode: 'T2X 0A1',
  phone: '403-555-0100',
  email: 'info@hailite.ca',
  gstNumber: '123456789 RT0001',
  wcbNumber: 'WCB-654321',
  logoUrl: '',
  etransferEmail: 'patrick@hailite.ca',
  bankName: 'RBC',
  bankTransit: '00123',
  bankInstitution: '003',
  bankAccount: '1234567',
  defaultNotes: 'Merci pour votre confiance! Paiement dû dans 30 jours.',
  defaultPaymentTerms: 'Net 30',
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_CLIENTS = [
  {
    id: 'seed-client-001',
    name: 'Martin Côté',
    phone: '403-555-0201',
    email: 'martin.cote@email.com',
    address: '456 Oak Ave SW',
    city: 'Calgary',
    province: 'AB',
    postalCode: 'T2Y 1B2',
    notes: 'Client régulier — toiture résidentielle',
    createdAt: now,
  },
  {
    id: 'seed-client-002',
    name: 'Jennifer Walsh',
    phone: '403-555-0302',
    email: 'jwalsh@email.com',
    address: '789 Maple Dr NW',
    city: 'Calgary',
    province: 'AB',
    postalCode: 'T3A 2C3',
    notes: 'Siding + toiture',
    createdAt: now,
  },
  {
    id: 'seed-client-003',
    name: 'Robert Chen',
    phone: '587-555-0403',
    email: 'rchen@email.com',
    address: '321 Pine Rd',
    city: 'Airdrie',
    province: 'AB',
    postalCode: 'T4B 3D4',
    notes: 'Nouveau client — dégâts grêle',
    createdAt: now,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS — 5 scénarios
// ─────────────────────────────────────────────────────────────────────────────

// Infos compagnie réutilisables dans les docs
const compInfo = {
  companyName: 'Hailite Xteriors',
  companyAddress: '123 Construction Ave NW, Calgary AB T2X 0A1',
  companyPhone: '403-555-0100',
  companyEmail: 'info@hailite.ca',
  companyGST: '123456789 RT0001',
  companyWCB: 'WCB-654321',
}

export const SEED_DOCUMENTS: GCPDocument[] = [

  // ── DOC 1 — Facture avec GST 5% + dépôt → SENT ──────────────────────────
  // Toiture Martin Côté | Sous-total: 5320 | GST: 266 | Total: 5586 | Dépôt: 2000 | Solde: 3586
  {
    id: 'seed-doc-001',
    type: 'invoice',
    number: 'INV-2025-001',
    date: '2025-05-01',
    dueDate: '2025-05-31',
    status: 'sent',
    clientId: 'seed-client-001',
    clientName: 'Martin Côté',
    clientAddress: '456 Oak Ave SW, Calgary AB T2Y 1B2',
    clientEmail: 'martin.cote@email.com',
    clientPhone: '403-555-0201',
    ...compInfo,
    lines: [
      { id: 'sd1-l1', description: 'Remplacement toiture — bardeaux asphaltés', qty: 500, unit: 'pi²', unitPrice: 8.50 },
      { id: 'sd1-l2', description: "Main d'oeuvre installation", qty: 16, unit: 'heure', unitPrice: 45.00 },
      { id: 'sd1-l3', description: 'Disposition des déchets', qty: 1, unit: 'unité', unitPrice: 350.00 },
    ],
    subtotal: 5320.00,
    discountPct: 0,
    discountAmount: 0,
    taxRate: 5,
    taxAmount: 266.00,
    total: 5586.00,
    depositAmount: 2000.00,
    balanceDue: 3586.00,
    notes: "Garantie main d'oeuvre 2 ans. Matériaux garantis par le fabricant.",
    createdAt: '2025-05-01T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },

  // ── DOC 2 — Facture avec GST 5% + remise 10% → PAID ─────────────────────
  // Siding Jennifer Walsh | Sous-total: 5840 | Remise 10%: 584 | GST: 262.80 | Total: 5518.80
  {
    id: 'seed-doc-002',
    type: 'invoice',
    number: 'INV-2025-002',
    date: '2025-04-15',
    dueDate: '2025-05-15',
    status: 'paid',
    clientId: 'seed-client-002',
    clientName: 'Jennifer Walsh',
    clientAddress: '789 Maple Dr NW, Calgary AB T3A 2C3',
    clientEmail: 'jwalsh@email.com',
    clientPhone: '403-555-0302',
    ...compInfo,
    lines: [
      { id: 'sd2-l1', description: 'Installation siding vinyle', qty: 800, unit: 'pi²', unitPrice: 6.25 },
      { id: 'sd2-l2', description: "Main d'oeuvre installation", qty: 20, unit: 'heure', unitPrice: 42.00 },
    ],
    subtotal: 5840.00,
    discountPct: 10,
    discountAmount: 584.00,
    taxRate: 5,
    taxAmount: 262.80,
    total: 5518.80,
    depositAmount: 0,
    balanceDue: 0,
    notes: 'Facture payée en totalité. Merci pour votre confiance!',
    createdAt: '2025-04-15T09:00:00.000Z',
    updatedAt: '2025-04-15T09:00:00.000Z',
  },

  // ── DOC 3 — Facture SANS taxe (0%) → DRAFT ───────────────────────────────
  // Inspection Robert Chen | Total: 250 | Pas de GST
  {
    id: 'seed-doc-003',
    type: 'invoice',
    number: 'INV-2025-003',
    date: '2025-05-18',
    dueDate: '',
    status: 'draft',
    clientId: 'seed-client-003',
    clientName: 'Robert Chen',
    clientAddress: '321 Pine Rd, Airdrie AB T4B 3D4',
    clientEmail: 'rchen@email.com',
    clientPhone: '587-555-0403',
    ...compInfo,
    lines: [
      { id: 'sd3-l1', description: 'Inspection toiture post-grêle', qty: 2, unit: 'heure', unitPrice: 125.00 },
    ],
    subtotal: 250.00,
    discountPct: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 250.00,
    depositAmount: 0,
    balanceDue: 250.00,
    notes: "Inspection préliminaire — rapport d'expertise inclus.",
    createdAt: '2025-05-18T08:00:00.000Z',
    updatedAt: '2025-05-18T08:00:00.000Z',
  },

  // ── DOC 4 — Devis avec GST 5% + remise 5% → DRAFT ───────────────────────
  // Toiture + Siding Robert Chen | Sous-total: 16110 | Remise 5%: 805.50 | GST: 765.23 | Total: 16069.73
  {
    id: 'seed-doc-004',
    type: 'quote',
    number: 'QUO-2025-001',
    date: '2025-05-10',
    dueDate: '2025-06-10',
    status: 'draft',
    clientId: 'seed-client-003',
    clientName: 'Robert Chen',
    clientAddress: '321 Pine Rd, Airdrie AB T4B 3D4',
    clientEmail: 'rchen@email.com',
    clientPhone: '587-555-0403',
    ...compInfo,
    lines: [
      { id: 'sd4-l1', description: 'Remplacement toiture complète — bardeaux architectural', qty: 1200, unit: 'pi²', unitPrice: 8.50 },
      { id: 'sd4-l2', description: 'Installation siding vinyle — façade principale', qty: 600, unit: 'pi²', unitPrice: 6.25 },
      { id: 'sd4-l3', description: "Main d'oeuvre complète", qty: 48, unit: 'heure', unitPrice: 45.00 },
    ],
    subtotal: 16110.00,
    discountPct: 5,
    discountAmount: 805.50,
    taxRate: 5,
    taxAmount: 765.23,
    total: 16069.73,
    depositAmount: 0,
    balanceDue: 16069.73,
    notes: "Devis valide 30 jours. Dépôt de 30% requis à l'acceptation. Durée estimée : 5-7 jours ouvrables.",
    createdAt: '2025-05-10T11:00:00.000Z',
    updatedAt: '2025-05-10T11:00:00.000Z',
  },

  // ── DOC 5 — Contrat avec GST + dépôt 30% → SENT ─────────────────────────
  // Contrat complet Martin Côté | Total: 13650 | Dépôt: 4095 | Solde: 9555
  {
    id: 'seed-doc-005',
    type: 'contract',
    number: 'CON-2025-001',
    date: '2025-05-05',
    dueDate: '',
    status: 'sent',
    clientId: 'seed-client-001',
    clientName: 'Martin Côté',
    clientAddress: '456 Oak Ave SW, Calgary AB T2Y 1B2',
    clientEmail: 'martin.cote@email.com',
    clientPhone: '403-555-0201',
    ...compInfo,
    lines: [
      { id: 'sd5-l1', description: 'Remplacement toiture complète — forfait tout inclus', qty: 1, unit: 'unité', unitPrice: 12500.00 },
      { id: 'sd5-l2', description: "Garantie main d'oeuvre 5 ans", qty: 1, unit: 'unité', unitPrice: 500.00 },
    ],
    subtotal: 13000.00,
    discountPct: 0,
    discountAmount: 0,
    taxRate: 5,
    taxAmount: 650.00,
    total: 13650.00,
    depositAmount: 4095.00,
    balanceDue: 9555.00,
    notes: "Travaux prévus : été 2025. Durée estimée : 3-5 jours ouvrables. Nettoyage complet du site inclus. Permis de construction inclus si requis.",
    createdAt: '2025-05-05T14:00:00.000Z',
    updatedAt: '2025-05-05T14:00:00.000Z',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CLÉS LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_STORE_KEYS = [
  'employee-store-v1',
  'company-store-v1',
  'client-store-v1',
  'document-store-v1',
  'catalogue-store-v1',
  'commande-store-v1',
  'employee-invoice-store-v1',
  'gcp-goals-v1',
  'voice-reminder-store-v1',
  'onboarding-store-v1',
]
