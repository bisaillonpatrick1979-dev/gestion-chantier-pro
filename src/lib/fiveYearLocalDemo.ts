import type { Employee } from '@/types/employee'

const iso = (d: Date) => d.toISOString()
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const rnd = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const workers: Employee[] = [
  { id: 'demo-admin', name: 'Patrick Bisaillon', role: 'admin', pin: '0000', workMode: 'heure', hourlyRate: 55, color: '#D6B25E', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'contractor', accessProfile: 'owner', permissions: ['all'] },
  { id: 'demo-emp-001', name: 'Jean-François Roy', role: 'employee', pin: '0000', workMode: 'heure', hourlyRate: 39, color: '#3b82f6', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'contractor', accessProfile: 'subcontractor', permissions: ['punch', 'own_assignments', 'own_invoices'] },
  { id: 'demo-emp-002', name: 'Marc Leblanc', role: 'employee', pin: '0000', workMode: 'heure', hourlyRate: 36, color: '#22c55e', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'contractor', accessProfile: 'self_employed', permissions: ['punch', 'own_assignments', 'own_invoices'] },
  { id: 'demo-emp-003', name: 'Kevin Tremblay', role: 'employee', pin: '0000', workMode: 'heure', hourlyRate: 34, color: '#f97316', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'salaried', accessProfile: 'field_worker', permissions: ['punch', 'own_assignments'] },
  { id: 'demo-emp-004', name: 'Sophie Gagnon', role: 'employee', pin: '0000', workMode: 'heure', hourlyRate: 29, color: '#a855f7', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'salaried', accessProfile: 'field_worker', permissions: ['punch', 'own_assignments'] },
  { id: 'demo-emp-005', name: 'Luc Fortin', role: 'employee', pin: '0000', workMode: 'surface', hourlyRate: 2.65, color: '#14b8a6', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'contractor', accessProfile: 'subcontractor', permissions: ['punch', 'own_assignments', 'own_invoices'] },
  { id: 'demo-accountant', name: 'Amélie Comptable', role: 'accountant', pin: '0000', workMode: 'heure', hourlyRate: 42, color: '#38bdf8', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'salaried', accessProfile: 'accounting', permissions: ['accounting', 'payroll', 'contracts', 'clients', 'projects', 'documents'] },
  { id: 'demo-secretary', name: 'Nathalie Bureau', role: 'secretary', pin: '0000', workMode: 'heure', hourlyRate: 31, color: '#f472b6', active: true, createdAt: iso(new Date()), invoiceSequence: 1, workerType: 'salaried', accessProfile: 'office_secretary', permissions: ['appointments', 'inventory', 'contracts', 'clients', 'projects', 'documents', 'no_money'] },
]

const clientNames = ['Martin Côté', 'Jennifer Walsh', 'Robert Chen', 'Sarah Nguyen', 'Michael Brown', 'Airdrie Condo Board', 'Okotoks Family Homes', 'Calgary Hail Claim Group']
const projects = ['Siding grêle', 'Toiture complète', 'Soffit fascia', 'Hardie Board', 'Réparation urgence', 'Cladding façade']

function buildDemoInventory(now: Date) {
  const updatedAt = iso(now)
  const items = [
    { id: 'demo-invitem-001', name: 'Vinyl siding blanc D4', category: 'siding', unit: 'box', location: 'Entrepôt A-01', supplier: 'Gentek / Kaycan', quantity: 18, reserved: 4, minQuantity: 12, reorderQuantity: 40, unitCost: 92, notes: 'Matériaux siding démo', updatedAt },
    { id: 'demo-invitem-002', name: 'Hardie Board 8.25 Arctic White', category: 'siding', unit: 'pcs', location: 'Entrepôt A-02', supplier: 'James Hardie', quantity: 46, reserved: 18, minQuantity: 30, reorderQuantity: 120, unitCost: 17.5, notes: 'Matériaux Hardie démo', updatedAt },
    { id: 'demo-invitem-003', name: 'Soffit ventilé blanc', category: 'soffit', unit: 'box', location: 'Entrepôt B-01', supplier: 'Gentek', quantity: 7, reserved: 1, minQuantity: 10, reorderQuantity: 25, unitCost: 74, notes: 'Bas stock volontaire', updatedAt },
    { id: 'demo-invitem-004', name: 'Fascia aluminium noir', category: 'fascia', unit: 'pcs', location: 'Rack B-04', supplier: 'Kaycan', quantity: 32, reserved: 6, minQuantity: 20, reorderQuantity: 60, unitCost: 14.25, notes: '', updatedAt },
    { id: 'demo-invitem-005', name: 'Bardeaux architectural gris', category: 'roofing', unit: 'bundle', location: 'Cour extérieure', supplier: 'Roofmart', quantity: 21, reserved: 0, minQuantity: 24, reorderQuantity: 80, unitCost: 43, notes: 'Bas stock volontaire', updatedAt },
    { id: 'demo-invitem-006', name: 'Clous coil siding 2 po', category: 'fasteners', unit: 'box', location: 'Étagère C-01', supplier: 'Home Depot Pro', quantity: 11, reserved: 2, minQuantity: 8, reorderQuantity: 20, unitCost: 52, notes: 'Consommable', updatedAt },
    { id: 'demo-invitem-007', name: 'Scellant extérieur OSI Quad', category: 'sealants', unit: 'tube', location: 'Étagère C-02', supplier: 'Home Depot Pro', quantity: 24, reserved: 8, minQuantity: 18, reorderQuantity: 60, unitCost: 9.25, notes: 'Consommable', updatedAt },
    { id: 'demo-invitem-008', name: 'Plieuse brake aluminium 10 pi', category: 'tools', unit: 'pcs', location: 'Camion 1', supplier: 'Tapco', quantity: 1, reserved: 0, minQuantity: 1, reorderQuantity: 1, unitCost: 1850, notes: 'Outil durable', updatedAt },
    { id: 'demo-invitem-009', name: 'Scie circulaire cordless', category: 'tools', unit: 'pcs', location: 'Camion 2', supplier: 'Milwaukee', quantity: 3, reserved: 1, minQuantity: 2, reorderQuantity: 2, unitCost: 249, notes: 'Outil', updatedAt },
    { id: 'demo-invitem-010', name: 'Harnais sécurité complet', category: 'safety', unit: 'pcs', location: 'Sécurité S-01', supplier: 'Safety Express', quantity: 5, reserved: 2, minQuantity: 4, reorderQuantity: 6, unitCost: 139, notes: 'PPE', updatedAt },
    { id: 'demo-invitem-011', name: 'Lunettes sécurité anti-buée', category: 'safety', unit: 'pcs', location: 'Sécurité S-02', supplier: 'Acklands', quantity: 3, reserved: 0, minQuantity: 10, reorderQuantity: 30, unitCost: 7.5, notes: 'Bas stock volontaire', updatedAt },
  ] as any[]
  const movements = items.slice(0, 8).map((item, i) => {
    const quantity = 1 + (i % 5)
    const totalCost = Math.round(quantity * item.unitCost * 100) / 100
    return { id: `demo-move-${i + 1}`, itemId: item.id, itemName: item.name, type: i % 3 === 0 ? 'out' : i % 3 === 1 ? 'in' : 'reserved', quantity, requestedQuantity: quantity, unitCost: item.unitCost, totalCost, jobName: projects[i % projects.length], employeeName: workers[(i % 5) + 1].name, note: 'Mouvement inventaire démo local', createdAt: iso(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - i))) }
  })
  return { items, movements }
}

export function buildFiveYearLocalDemo() {
  const now = new Date()
  const startYear = now.getFullYear() - 4
  const clients = clientNames.map((name, i) => ({ id: `demo-client-${i + 1}`, name, phone: `403-555-${String(1200 + i)}`, email: `client${i + 1}@demo.local`, address: `${100 + i * 77} Demo Street`, city: i % 3 === 0 ? 'Calgary' : i % 3 === 1 ? 'Airdrie' : 'Okotoks', province: 'AB', postalCode: 'T2X 0A1', notes: 'Donnée locale de démonstration — ne pas synchroniser.', createdAt: iso(now) }))
  const dayDetails: Record<string, any> = {}
  const docs: any[] = []
  const invoices: any[] = []
  const payroll: any[] = []
  const expenses: any[] = []
  let docNo = 1
  let expNo = 1

  for (let y = startYear; y <= now.getFullYear(); y++) {
    const lastMonth = y === now.getFullYear() ? now.getMonth() : 11
    for (let m = 0; m <= lastMonth; m++) {
      const season = m >= 4 && m <= 9 ? 1.22 : 0.82
      const growth = 1 + (y - startYear) * 0.09
      const monthSeed = y * 100 + m
      const clientCount = 3 + Math.floor(rnd(monthSeed) * 3)
      let monthlyPayroll = 0
      for (const emp of workers.filter(w => w.role === 'employee')) {
        let empHours = 0
        for (let d = 1; d <= 28; d++) {
          const date = new Date(y, m, d)
          const dow = date.getDay()
          if (dow === 0 || dow === 6) continue
          if (rnd(monthSeed + d + emp.hourlyRate) < 0.24) continue
          const hours = Math.round((6.5 + rnd(monthSeed + d * 3 + emp.hourlyRate) * 4.6) * 10) / 10
          const revenue = Math.round(hours * emp.hourlyRate * 100) / 100
          const dateStr = ymd(date)
          empHours += hours
          monthlyPayroll += revenue
          const start = new Date(y, m, d, 7, 30)
          const end = new Date(start.getTime() + (hours + 0.5) * 3600000)
          dayDetails[`${emp.id}-${dateStr}`] = { date: dateStr, employeeId: emp.id, totalHours: hours, totalRevenue: revenue, totalBreak: 1800, notes: 'Donnée démo locale 5 ans', sessions: [{ id: `sess-${emp.id}-${dateStr}`, employeeId: emp.id, startTime: iso(start), endTime: iso(end), elapsed: hours * 3600, breakElapsed: 1800, revenue, workMode: emp.workMode, isOnBreak: false }] }
        }
        payroll.push({ id: `demo-pay-${emp.id}-${y}-${m + 1}`, employeeId: emp.id, employeeName: emp.name, amount: Math.round(empHours * emp.hourlyRate * 100) / 100, periodStart: `${y}-${pad(m + 1)}-01`, periodEnd: `${y}-${pad(m + 1)}-28`, paidAt: rnd(monthSeed + emp.hourlyRate) > 0.18 ? `${y}-${pad(m + 1)}-28` : undefined, status: rnd(monthSeed + emp.hourlyRate) > 0.18 ? 'paid' : 'approved', note: 'Paye locale de démonstration' })
      }
      for (let i = 0; i < clientCount; i++) {
        const client = clients[(i + m + y) % clients.length]
        const subtotal = Math.round((4200 + rnd(monthSeed + i) * 18500) * season * growth)
        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100
        const total = subtotal + taxAmount
        const paidRatio = rnd(monthSeed + i * 7) > 0.12 ? 1 : rnd(monthSeed + i * 11) > 0.5 ? 0.5 : 0
        const paidAmount = Math.round(total * paidRatio * 100) / 100
        const status = paidRatio === 1 ? 'paid' : paidRatio > 0 ? 'partial' : 'sent'
        const issueDate = `${y}-${pad(m + 1)}-${pad(3 + i * 4)}`
        invoices.push({ id: `demo-inv-${docNo}`, invoiceNo: `INV-${y}-${pad(docNo)}`, clientName: client.name, projectName: projects[(i + m) % projects.length], amount: subtotal, taxAmount, paidAmount, issueDate, dueDate: `${y}-${pad(m + 1)}-28`, status })
        docs.push({ id: `demo-doc-${docNo}`, type: 'invoice', number: `INV-${y}-${pad(docNo)}`, date: issueDate, dueDate: `${y}-${pad(m + 1)}-28`, status, clientId: client.id, clientName: client.name, clientAddress: `${client.address}, ${client.city} AB`, clientEmail: client.email, clientPhone: client.phone, companyName: 'Hailite Xteriors', companyAddress: 'Calgary AB', companyPhone: '403-555-0100', companyEmail: 'demo@hailite.local', companyGST: 'DEMO GST', companyWCB: 'DEMO WCB', lines: [{ id: `l-${docNo}`, description: projects[(i + m) % projects.length], qty: 1, unit: 'forfait', unitPrice: subtotal }], subtotal, discountPct: 0, discountAmount: 0, taxRate: 5, taxAmount, total, depositAmount: 0, balanceDue: total - paidAmount, notes: 'Facture démo locale 5 ans', createdAt: iso(now), updatedAt: iso(now) })
        docNo++
      }
      const materialSpend = Math.round(monthlyPayroll * (0.95 + rnd(monthSeed + 44) * 0.75))
      const otherSpend = Math.round(650 + rnd(monthSeed + 45) * 2200)
      expenses.push({ id: `demo-exp-${expNo++}`, vendor: 'Beacon / Roofmart / Home Depot', category: 'materials', projectName: 'Matériaux mensuels', amount: materialSpend, taxAmount: Math.round(materialSpend * 0.05 * 100) / 100, date: `${y}-${pad(m + 1)}-14`, status: rnd(monthSeed) > 0.15 ? 'paid' : 'unpaid', note: 'Matériaux démo locale' })
      expenses.push({ id: `demo-exp-${expNo++}`, vendor: 'Fuel / Rentals / Admin', category: 'other', projectName: 'Frais généraux', amount: otherSpend, taxAmount: Math.round(otherSpend * 0.05 * 100) / 100, date: `${y}-${pad(m + 1)}-21`, status: rnd(monthSeed + 1) > 0.12 ? 'paid' : 'unpaid', note: 'Dépenses démo locale' })
    }
  }

  const inventory = buildDemoInventory(now)

  return {
    company: { name: 'Hailite Xteriors DEMO LOCAL', ownerName: 'Patrick Bisaillon', address: '12 Abalone Crescent NE', city: 'Calgary', province: 'AB', postalCode: 'T2A 6W7', phone: '403-555-0100', email: 'demo@hailite.local', gstNumber: 'DEMO-LOCAL-ONLY', wcbNumber: 'DEMO-WCB', logoUrl: '', defaultNotes: 'Données de démonstration locales seulement.', defaultPaymentTerms: 'Net 30' },
    employees: workers,
    clients,
    documents: docs,
    dayDetails,
    inventory,
    accounting: { clientInvoices: invoices, payrollPayments: payroll, expenses },
  }
}
