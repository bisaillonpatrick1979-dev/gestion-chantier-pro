'use client'

import { useState } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type BottomNavbarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
}

type BottomNavItem = {
  id: string
  label: string
  icon: string
}

const navItems: BottomNavItem[] = [
  { id: 'accueil', label: 'ACCUEIL', icon: '⌂' },
  { id: 'factures', label: 'FACTURES', icon: '▤' },
  { id: 'projets', label: 'PROJETS', icon: '▧' },
  { id: 'docs', label: 'DOCS', icon: '▣' },
  { id: 'inventaire', label: 'INVENT.', icon: '◫' },
  { id: 'communications', label: 'COMMS.', icon: '✉' },
  { id: 'stats', label: 'STATS', icon: '◒' },
  { id: 'reglages', label: 'RÉGLAGES', icon: '⚙' },
]

const themeColors = hailiteTheme.colors

export default function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
  const [pressedTab, setPressedTab] = useState<string | null>(null)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-[70px] border-t border-white/10 bg-[#1A1A1A] text-white"
      data-theme-surface={themeColors.surface}
      data-theme-primary={themeColors.primary}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-1 overflow-x-auto px-2 sm:justify-center sm:gap-2 sm:px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || activeTab === item.label
          const isPressed = pressedTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              onMouseDown={() => setPressedTab(item.id)}
              onMouseUp={() => setPressedTab(null)}
              onMouseLeave={() => setPressedTab(null)}
              className={`flex h-[54px] min-w-[76px] flex-1 flex-col items-center justify-center rounded-2xl px-2 text-[10px] font-black transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A] sm:max-w-28 sm:text-xs ${
                isActive ? 'bg-[#FF5722]/15 text-[#FF5722]' : 'text-[#A0AEC0] hover:bg-white/[0.06] hover:text-white'
              } ${isPressed ? 'scale-95' : 'scale-100'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg leading-none sm:text-xl" aria-hidden="true">
                {item.icon}
              </span>
              <span className="mt-1 whitespace-nowrap leading-none">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { BottomNavbarProps, BottomNavItem }
