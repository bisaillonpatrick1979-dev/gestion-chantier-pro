export type EmployeeRole           = 'admin' | 'employee' | 'accountant' | 'secretary'
export type EmployeeWorkMode       = 'heure' | 'forfait' | 'surface'
export type EmployeeWorkerType     = 'contractor' | 'self_employed' | 'salaried' | 'office'
export type EmployeeCountry        = 'CA' | 'US'
export type EmployeePayFrequency   = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type EmployeePayPeriodStart =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export type EmployeePermission =
  | 'all'
  | 'punch'
  | 'own_assignments'
  | 'own_invoices'
  | 'accounting'
  | 'payroll'
  | 'appointments'
  | 'inventory'
  | 'contracts'
  | 'clients'
  | 'projects'
  | 'documents'
  | 'no_money'

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
  phone?: string
  email?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string

  // ── Contact d'urgence — TOUS les employés ───────────────────────────────
  emergencyContact?: string
  emergencyPhone?: string
  emergencyRelation?: string

  // ── Type de travailleur et paie ──────────────────────────────────────────
  workerType?: EmployeeWorkerType
  employeeCountry?: EmployeeCountry
  employeeProvince?: string
  payFrequency?: EmployeePayFrequency
  payPeriodStart?: EmployeePayPeriodStart
  annualSalary?: number
  accessProfile?: 'owner' | 'field_worker' | 'subcontractor' | 'self_employed' | 'accounting' | 'office_secretary'
  permissions?: EmployeePermission[]

  // ── Champs sous-traitant / travailleur autonome ──────────────────────────
  businessName?: string
  gstNumber?: string
  sin?: string

  // ── RH — Ancienneté & conformité ─────────────────────────────────────────
  hireDate?: string                  // ISO date — ex: "2023-06-15"
  contractRenewalDate?: string       // Rappel renouvellement contrat
  alertsAcknowledged?: string[]      // IDs des alertes RH déjà vues/fermées
  vacationRateOverride?: number      // % custom si admin veut forcer (ex: 8.5)
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
