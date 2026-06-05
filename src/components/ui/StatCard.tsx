'use client'

import { useState, type ReactNode } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type StatCardProps = {
  label: string
  value: string
  icon: ReactNode
  color: string
  trend: string
  variant?: 'vertical' | 'horizontal'
  sub?: string
}

const chartBars = [36, 58, 44, 72, 54, 86, 68]

export default function StatCard({ label, value, icon, color, trend, variant = 'vertical', sub }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (variant === 'horizontal') {
    return (
      <article
        className="rounded-2xl border border-[rgba(31,41,55,0.85)] bg-[#16191F] p-5 flex items-center gap-5 shadow-lg transition duration-200 hover:border-[rgba(55,65,81,1)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ boxShadow: isHovered ? `0 8px 32px ${color}20` : undefined }}
      >
        {/* Icon container */}
        <div
          className="p-4 rounded-xl flex-shrink-0"
          style={{ background: `${color}18`, color }}
          aria-hidden="true"
        >
          <span className="text-2xl flex items-center justify-center w-7 h-7">{icon}</span>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase font-black text-[#9CA3AF] tracking-wider">{label}</p>
          <p className="text-3xl font-black text-white mt-1 leading-none" style={{ color: isHovered ? color : 'white' }}>
            {value}
          </p>
          {(trend || sub) && (
            <span className="text-xs font-black uppercase mt-1.5 block" style={{ color }}>
              {trend || sub}
            </span>
          )}
        </div>
      </article>
    )
  }

  // Default vertical layout
  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? `0 18px 50px ${color}24` : undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A0AEC0]">{label}</p>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg"
          style={{ color }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-4xl font-black leading-none tracking-tight text-white">{value}</p>
        <p className="mt-2 text-sm font-semibold text-[#A0AEC0]">{trend}</p>
      </div>

      <div className="mt-5 flex h-12 items-end gap-1.5" aria-hidden="true">
        {chartBars.map((height, index) => (
          <span
            key={`${label}-bar-${index}`}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              height: `${height}%`,
              backgroundColor: color || hailiteTheme.colors.primary,
              opacity: isHovered ? 0.95 : 0.55 + index * 0.05,
            }}
          />
        ))}
      </div>
    </article>
  )
}

export type { StatCardProps }
