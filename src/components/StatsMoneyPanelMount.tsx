'use client'

import { usePathname } from 'next/navigation'
import AccountingQuickPanel from './AccountingQuickPanel'
import { useEmployeeStore } from '@/store/useEmployeeStore'

export default function StatsMoneyPanelMount() {
  const path = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const current = employees.find(e => e.id === currentEmployeeId)
  const allowed = !current || current.role === 'admin' || current.role === 'accountant'
  if (path !== '/stats' || !allowed) return null
  return <div className="stats-money-panel-mount"><AccountingQuickPanel /></div>
}
