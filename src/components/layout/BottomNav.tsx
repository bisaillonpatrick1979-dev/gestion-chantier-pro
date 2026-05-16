'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'

// ── Icônes Art Déco gravées ───────────────────────────────────────────────────

function IcoDashboard({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="15" y="2" width="9" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="2" y="15" width="9" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="15" y="15" width="9" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="6.5" y1="6.5" x2="6.5" y2="6.6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="19.5" y1="6.5" x2="19.5" y2="6.6" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IcoStats({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <line x1="13" y1="24" x2="13" y2="2" stroke={c} strokeWidth="1.2" strokeDasharray="1 2"/>
      <line x1="2" y1="24" x2="24" y2="24" stroke={c} strokeWidth="1.5"/>
      <rect x="3" y="14" width="4" height="10" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="11" y="8" width="4" height="16" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="19" y="11" width="4" height="13" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="2" y1="24" x2="5" y2="14" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="5" y1="14" x2="13" y2="8" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="13" y1="8" x2="21" y2="11" stroke={c} strokeWidth="1" opacity="0.4"/>
    </svg>
  )
}

function IcoCatalogue({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="2" y="2" width="22" height="22" rx="3" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="2" y1="9" x2="24" y2="9" stroke={c} strokeWidth="1"/>
      <line x1="2" y1="17" x2="24" y2="17" stroke={c} strokeWidth="1"/>
      <line x1="9" y1="2" x2="9" y2="24" stroke={c} strokeWidth="1"/>
      <circle cx="5.5" cy="5.5" r="1" fill={c}/>
      <circle cx="5.5" cy="13" r="1" fill={c}/>
      <circle cx="5.5" cy="20.5" r="1" fill={c}/>
    </svg>
  )
}

function IcoDocuments({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M6 2h10l6 6v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M16 2v6h6" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="8" y1="13" x2="18" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="18" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="21" x2="13" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoPaye({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="11" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="13" y1="5" x2="13" y2="21" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 8H11a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H9" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="6" y1="6" x2="20" y2="20" stroke={c} strokeWidth="0.8" opacity="0.2"/>
      <line x1="20" y1="6" x2="6" y2="20" stroke={c} strokeWidth="0.8" opacity="0.2"/>
    </svg>
  )
}

function IcoClients({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="10" cy="8" r="4" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M3 22v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="8" r="3" stroke={c} strokeWidth="1.2" fill="none"/>
      <path d="M23 22v-1.5a4 4 0 0 0-3-3.87" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <line x1="10" y1="4" x2="10" y2="12" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    </svg>
  )
}

function IcoReglages({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="3.5" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M13 2v3M13 21v3M2 13h3M21 13h3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 5.5l2.1 2.1M18.4 18.4l2.1 2.1M5.5 20.5l2.1-2.1M18.4 7.6l2.1-2.1" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="13" r="7" stroke={c} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5"/>
    </svg>
  )
}

function IcoCompta({ c }: { c: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="2" y="4" width="22" height="18" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="2" y1="10" x2="24" y2="10" stroke={c} strokeWidth="1.2"/>
      <line x1="8" y1="4" x2="8" y2="22" stroke={c} strokeWidth="1"/>
      <line x1="16" y1="4" x2="16" y2="22" stroke={c} strokeWidth="1"/>
      <circle cx="5" cy="15" r="1" fill={c}/>
      <circle cx="5" cy="19" r="1" fill={c}/>
      <line x1="10" y1="15" x2="14" y2="15" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10" y1="19" x2="14" y2="19" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18" y1="15" x2="22" y2="15" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18" y1="19" x2="22" y2="19" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Composant principal ────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) ?? null
  const isAdmin = currentEmployee?.role === 'admin'

  const adminItems = [
    { href: '/',            label: 'Accueil',   Icon: IcoDashboard  },
    { href: '/stats',       label: 'Stats',     Icon: IcoStats      },
    { href: '/catalogue',   label: 'Catalogue', Icon: IcoCatalogue  },
    { href: '/documents',   label: 'Documents', Icon: IcoDocuments  },
    { href: '/paye',        label: 'Facturation', Icon: IcoPaye     },
    { href: '/clients',     label: 'Clients',   Icon: IcoClients    },
    { href: '/settings',    label: 'Reglages',  Icon: IcoReglages   },
  ]

  const employeeItems = [
    { href: '/',       label: 'Accueil', Icon: IcoDashboard },
    { href: '/stats',  label: 'Stats',   Icon: IcoStats     },
    { href: '/paye',   label: 'Paye',    Icon: IcoPaye      },
  ]

  const items = isAdmin ? adminItems : employeeItems

  return (
    <>
      <style>{`
        @keyframes navGlow {
          0%,100% { filter: drop-shadow(0 0 4px var(--nav-active)); }
          50%      { filter: drop-shadow(0 0 8px var(--nav-active)); }
        }
        .nav-active-icon { animation: navGlow 2.5s ease-in-out infinite; }
      `}</style>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'var(--nav-bg, #111)',
        borderTop: '1px solid var(--nav-border, #222)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* Ligne décorative en haut */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--nav-active), transparent)',
          opacity: 0.4,
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '62px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '0 4px',
        }}>
          {items.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            const color = isActive
              ? 'var(--nav-active, #D4AF37)'
              : 'var(--nav-inactive, #555)'

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  minWidth: '44px',
                  flex: 1,
                  padding: '6px 2px',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'opacity 0.2s',
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {/* Indicateur actif */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '2px',
                    background: 'var(--nav-active)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}

                <div className={isActive ? 'nav-active-icon' : ''}>
                  <item.Icon c={color} />
                </div>

                <span style={{
                  fontSize: '8px',
                  fontWeight: isActive ? 800 : 500,
                  color,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
