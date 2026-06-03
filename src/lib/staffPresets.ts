export const STAFF_PRESETS = {
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
    workerType: 'self_employed',
    accessProfile: 'self_employed',
    permissions: ['punch', 'own_assignments', 'own_invoices'],
    workMode: 'forfait',
  },
  accountant: {
    labelFr: 'Comptable',
    role: 'accountant',
    workerType: 'office',
    accessProfile: 'accounting',
    permissions: ['accounting', 'payroll', 'contracts', 'clients', 'projects', 'documents'],
    workMode: 'heure',
  },
  secretary: {
    labelFr: 'Secrétaire / administration',
    role: 'secretary',
    workerType: 'office',
    accessProfile: 'office_secretary',
    permissions: ['appointments', 'inventory', 'contracts', 'clients', 'projects', 'documents', 'no_money'],
    workMode: 'heure',
  },
} as const

export type StaffPresetKey = keyof typeof STAFF_PRESETS
