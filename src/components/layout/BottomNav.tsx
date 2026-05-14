'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { tr } from '@/lib/translations'

export default function BottomNav() {
  const pathname = usePathname()
  const { theme } = useThemeStore()
  const { lang } = useLangStore()

  const tabs = [
    { href: '/',           emoji: '📊', label: tr('dashboard', lang)  },
    { href: '/stats',      emoji: '📈', label: tr('stats', lang)       },
    { href: '/documents',  emoji: '📁', label: tr('documents', lang)   },
    { href: '/settings',   emoji: '⚙️', label: tr('settings', lang)   },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: '64px', zIndex: 50,
      background: 'rgba(10,5,0,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${theme.colors.border}`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-around',
    }}>
      {tabs.map(({ href, emoji, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
            textDecoration: 'none', padding: '8px 16px',
          }}>
            <span style={{ fontSize: '20px' }}>{emoji}</span>
            <span style={{
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px',
              color: active ? theme.colors.primary : theme.colors.textMuted,
            }}>
              {label}
            </span>
            {active && (
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: theme.colors.primary, marginTop: '2px',
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
