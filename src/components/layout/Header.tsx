'use client'

import Image from 'next/image'
import { useState } from 'react'
import { hailiteTheme } from '@/theme/hailiteTheme'

type HeaderProps = {
  userName: string
  userAvatar: string
  onLogout: () => void
}

const themeColors = hailiteTheme.colors

export default function Header({ userName, userAvatar, onLogout }: HeaderProps) {
  const [isGuideHovered, setIsGuideHovered] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'HX'

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 h-[60px] border-b border-white/10 bg-[#0F1117] text-white"
      data-theme-background={themeColors.background}
      data-theme-primary={themeColors.primary}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF5722] text-sm font-black tracking-tight text-white">
            HX
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-black tracking-[0.16em] text-white sm:text-base">HAILITE XTERIORS INC.</p>
            <p className="truncate text-xs font-semibold text-[#A0AEC0] sm:text-sm">Gestion Chantier Pro</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onMouseEnter={() => setIsGuideHovered(true)}
            onMouseLeave={() => setIsGuideHovered(false)}
            className={`hidden rounded-xl bg-[#FF5722] px-3 py-2 text-xs font-black text-white transition duration-200 hover:bg-[#ff6b3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117] sm:inline-flex md:px-4 ${isGuideHovered ? '-translate-y-0.5' : 'translate-y-0'}`}
          >
            Guide de Validation app
          </button>
          <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-black text-[#00D9FF]">FR</span>
          <span className="hidden max-w-36 truncate text-sm font-bold text-white md:inline">{userName}</span>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#FF5722] bg-[#1A1A1A] text-xs font-black text-white">
            {userAvatar && !avatarFailed ? (
              <Image
                src={userAvatar}
                alt={`Avatar de ${userName}`}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                onError={() => setAvatarFailed(true)}
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white transition hover:border-[#FF5722]/60 hover:text-[#FF5722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

export type { HeaderProps }
