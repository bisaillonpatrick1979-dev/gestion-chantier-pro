'use client'

import { useState, type ReactNode } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type StatCardProps = {
  label: string
  value: string
  icon: ReactNode
  color: string
  trend: string
}

const chartBars = [36, 58, 44, 72, 54, 86, 68]

export default function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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
