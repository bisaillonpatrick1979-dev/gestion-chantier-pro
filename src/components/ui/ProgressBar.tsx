'use client'

import { useState } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type ProgressBarProps = {
  value: number
  color: string
  label?: string
}

export default function ProgressBar({ value, color, label }: ProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const safeValue = Math.min(100, Math.max(0, value))
  const barColor = color || hailiteTheme.colors.primary

  return (
    <div
      className="w-full rounded-2xl bg-[#1A1A1A] p-4 text-white shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        {label && <p className="text-sm font-bold text-[#A0AEC0]">{label}</p>}
        <span className="ml-auto text-sm font-black text-white">{Math.round(safeValue)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${safeValue}%`,
            backgroundColor: barColor,
            boxShadow: isHovered ? `0 0 24px ${barColor}` : `0 0 12px ${barColor}80`,
          }}
        />
      </div>
    </div>
  )
}

export type { ProgressBarProps }
