'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useMotivationStore } from '@/store/useMotivationStore'

export default function MotivationQuickAccess() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const goals = useMotivationStore(s => s.goals)
  const current = employees.find(e => e.id === currentEmployeeId)
  const canSee = employees.length === 0 || current?.role === 'admin' || current?.role === 'accountant' || current?.role === 'secretary'
  if (!canSee || pathname === '/motivation') return null
  const activeCount = goals.filter(g => g.status === 'active').length
  return <Link href="/motivation" aria-label="Motivation et récompenses" style={{
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 78,
    zIndex: 120,
    minHeight: 44,
    borderRadius: 999,
    padding: '10px 16px',
    border: '1px solid rgba(250,204,21,.45)',
    background: 'linear-gradient(135deg,rgba(180,83,9,.96),rgba(124,58,237,.96))',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 950,
    fontSize: 14,
    boxShadow: '0 0 18px rgba(250,204,21,.45),0 10px 30px rgba(0,0,0,.55)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }}>🏆 Motivation {activeCount > 0 ? <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, padding: '2px 7px' }}>{activeCount}</span> : null}</Link>
}
