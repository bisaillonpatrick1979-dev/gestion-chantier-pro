'use client'

import { useState, type ReactNode } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#FF5722] hover:bg-[#ff6b3d] focus-visible:ring-[#FF5722]',
  secondary: 'bg-[#00D084] text-[#0F1117] hover:bg-[#19dc95] focus-visible:ring-[#00D084]',
  danger: 'bg-[#EF4444] hover:bg-[#f15b5b] focus-visible:ring-[#EF4444]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
}

export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled = false }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const variantColor = {
    primary: hailiteTheme.colors.primary,
    secondary: hailiteTheme.colors.secondary,
    danger: hailiteTheme.colors.status.error,
  }[variant]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`inline-flex items-center justify-center rounded-xl font-black text-white shadow-lg transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${isPressed ? 'scale-95' : 'scale-100'}`}
      style={{ boxShadow: disabled ? undefined : `0 12px 30px ${variantColor}33` }}
    >
      {children}
    </button>
  )
}

export type { ButtonProps, ButtonSize, ButtonVariant }
