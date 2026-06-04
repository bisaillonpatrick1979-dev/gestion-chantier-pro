'use client'

import { useState } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type CircularButtonProps = {
  onClick?: () => void
  isActive: boolean
  label: string
  time: string
}

export default function CircularButton({ onClick, isActive, label, time }: CircularButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const actionLabel = isActive ? 'PUNCH OUT' : 'PUNCH IN'

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`relative flex aspect-square w-56 flex-col items-center justify-center rounded-full border-4 border-[#00D9FF] bg-[#1A1A1A] p-6 text-center text-white shadow-2xl transition duration-200 hover:shadow-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0F1117] ${isPressed ? 'scale-95' : 'scale-100'}`}
      style={{ boxShadow: `0 0 44px ${hailiteTheme.colors.cyan}33` }}
      aria-label={label}
    >
      <span className="text-xs font-black uppercase tracking-[0.28em] text-[#A0AEC0]">{label}</span>
      <span className="mt-3 text-3xl font-black leading-tight tracking-tight">{actionLabel}</span>
      <span className="mt-4 rounded-full bg-white/10 px-4 py-1 text-sm font-bold text-[#00D9FF]">{time}</span>
    </button>
  )
}

export type { CircularButtonProps }
