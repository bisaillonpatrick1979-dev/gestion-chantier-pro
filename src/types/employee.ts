export type EmployeeRole           = 'admin' | 'employee'
export type EmployeeWorkMode       = 'heure' | 'forfait' | 'surface'
export type EmployeeWorkerType     = 'contractor' | 'salaried'
export type EmployeeCountry        = 'CA' | 'US'
export type EmployeePayFrequency   = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type EmployeePayPeriodStart =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  pin: string
  workMode: EmployeeWorkMode
  hourlyRate: number
  color: string
  active: boolean
  createdAt: string
  invoiceSequence: number

  // ── Coordonnées — TOUS les employés ─────────────────────────────────────
  phone?: string            // Téléphone principal
  email?: string            // Courriel — invoices, slips de paye, communications
  address?: string          // Numéro civique + rue
  city?: string             // Ville
  province?: string         // Province (coordonnées — pas la même que employeeProvince)
  postalCode?: string       // Code postal

  // ── Contact d'urgence — TOUS les employés ───────────────────────────────
  // Important pour travaux en hauteur / toiture
  emergencyContact?: string // Nom de la personne à contacter
  emergencyPhone?: string   // Son numéro de téléphone
  emergencyRelation?: string // Ex: "Conjointe", "Père", "Frère"

  // ── Type de travailleur et paie ──────────────────────────────────────────
  workerType?: EmployeeWorkerType
  employeeCountry?: EmployeeCountry
  employeeProvince?: string   // Province pour calcul impôt/paie
  payFrequency?: EmployeePayFrequency
  payPeriodStart?: EmployeePayPeriodStart
  annualSalary?: number

  // ── Champs sous-traitant uniquement (légal CRA) ──────────────────────────
  businessName?: string     // "Toiture Leblanc Inc." si différent du nom
  gstNumber?: string        // Si inscrit TPS → on lui paie GST 5%
  sin?: string              // NAS — si PAS de GST → T4A requis fin d'année
}

export interface EmployeeSession {
  id: string
  employeeId: string
  startTime: string
  endTime: string | null
  elapsed: number
  breakElapsed: number
  revenue: number
  workMode: EmployeeWorkMode
  materials?: MaterialEntry[]
  isOnBreak: boolean
}

export interface MaterialEntry {
  id: string
  material: string
  squareFeet: number
  pricePerSqFt: number
  total: number
}

export interface DayDetail {
  date: string
  employeeId: string
  sessions: EmployeeSession[]
  totalHours: number
  totalRevenue: number
  totalBreak: number
  materials?: MaterialEntry[]
  notes: string
}
