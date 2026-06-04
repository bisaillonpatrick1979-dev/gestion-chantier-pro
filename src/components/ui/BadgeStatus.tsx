'use client'

import { useState } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type BadgeStatusValue = 'PENDING' | 'PAID' | 'EN_COURS'

type BadgeStatusProps = {
  status: BadgeStatusValue
}

const statusClasses: Record<BadgeStatusValue, string> = {
  PENDING: 'bg-[#8B5A3C]',
  PAID: 'bg-[#10B981]',
  EN_COURS: 'bg-[#00D9FF]',
}

const statusLabels: Record<BadgeStatusValue, string> = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  EN_COURS: 'EN COURS',
}

const statusColors: Record<BadgeStatusValue, string> = {
  PENDING: hailiteTheme.colors.status.pending,
  PAID: hailiteTheme.colors.status.success,
  EN_COURS: hailiteTheme.colors.cyan,
}

export default function BadgeStatus({ status }: BadgeStatusProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white shadow-md transition duration-200 ${statusClasses[status]} ${isHovered ? 'scale-105' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? `0 10px 24px ${statusColors[status]}55` : undefined }}
    >
      {statusLabels[status]}
    </span>
  )
}

export type { BadgeStatusProps, BadgeStatusValue }
