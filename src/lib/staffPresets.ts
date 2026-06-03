import type { EmployeePermission, EmployeeRole, EmployeeWorkerType, EmployeeWorkMode } from '@/types/employee'

type StaffPreset = {
  labelFr: string
  role: EmployeeRole
  workerType: EmployeeWorkerType
  accessProfile: 'owner' | 'field_worker' | 'subcontractor' | 'self_employed' | 'accounting' | 'office_secretary'
  permissions: EmployeePermission[]
  workMode: EmployeeWorkMode
}

export const STAFF_PRESETS: Record<string, StaffPreset> = {
  salaried: {
    labelFr: 'Employé salarié',
    role: 'employee',
    workerType: 'salaried',
    accessProfile: 'field_worker',
    permissions: ['punch', 'own_assignments'],
    workMode: 'heure',
  },
  subcontractor: {
    labelFr: 'Sous-traitant',
    role: 'employee',
    workerType: 'contractor',
    accessProfile: 'subcontractor',
    permissions: ['punch', 'own_assignments', 'own_invoices'],
    workMode: 'surface',
  },
  self_employed: {
    labelFr: 'Travailleur autonome',
    role: 'employee',
    workerType: 'contractor',
    accessProfile: 'self_employed',
    permissions: ['punch', 'own_assignments', 'own_invoices'],
    workMode: 'forfait',
  },
  accountant: {
    labelFr: 'Comptable',
    role: 'accountant',
    workerType: 'salaried',
    accessProfile: 'accounting',
    permissions: ['accounting', 'payroll', 'contracts', 'clients', 'projects', 'documents'],
    workMode: 'heure',
  },
  secretary: {
    labelFr: 'Secrétaire / administration',
    role: 'secretary',
    workerType: 'salaried',
    accessProfile: 'office_secretary',
    permissions: ['appointments', 'inventory', 'contracts', 'clients', 'projects', 'documents', 'no_money'],
    workMode: 'heure',
  },
}

export type StaffPresetKey = keyof typeof STAFF_PRESETS
