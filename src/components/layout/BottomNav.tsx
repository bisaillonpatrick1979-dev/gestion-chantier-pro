'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useGoalStore } from '@/store/useGoalStore'

function IcoAccueil({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <path d="M3 12L12 3L21 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10V20C5 20.6 5.4 21 6 21H10V16H14V21H18C18.6 21 19 20.6 19 20V10" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IcoFacture({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <rect x="3" y="2" width="14" height="18" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M17 6H21V22H7V20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="8" x2="13" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="11" x2="13" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="10" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoProjet({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.5"/>
      <circle cx="12" cy="15.5" r="1.8" stroke={c} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

function IcoDocument({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M14 2V8H20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="16" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IcoStats({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <line x1="2" y1="22" x2="22" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="3" y="13" width="4" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="10" y="7" width="4" height="15" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      <rect x="17" y="10" width="4" height="12" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

function IcoReglages({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IcoPaye({ c, glow }: { c: string; glow?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 4px ${c})` } : {}}>
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" fill="none"/>
      <line x1="12" y1="6" x2="12" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M15 9H10.5C9.1 9 8 10.1 8 11.5C8 12.9 9.1 14 10.5 14H13.5C14.9 14 16 15.1 16 16.5C16 17.9 14.9 19 13.5 19H9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// Icône XP centrale spéciale
function IcoXP({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#c4b5fd'
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polygon points="16,2 20,11 30,11 22,17 25,27 16,21 7,27 10,17 2,11 12,11" fill={active ? '#7c3aed' : 'none'} stroke={c} strokeWidth="1.5"/>
      <text x="16" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill={c}>XP</text>
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const { themeId } = useThemeStore()
  const { getGoal } = useGoalStore()
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) ?? null
  const isAdmin = currentEmployee?.role === 'admin'
  const isXP = themeId === 'xp'
  const goal = currentEmployeeId ? getGoal(currentEmployeeId) : null

  const adminItems = [
    { href: '/',          label: isXP ? 'Base' : 'Accueil',   Icon: IcoAccueil  },
    { href: '/invoice',   label: isXP ? 'Or' : 'Factures',    Icon: IcoFacture  },
    { href: '/projects',  label: isXP ? 'Quêtes' : 'Projets', Icon: IcoProjet   },
    { href: '/documents', label: 'Docs',                       Icon: IcoDocument },
    { href: '/stats',     label: isXP ? 'Stats XP' : 'Stats', Icon: IcoStats    },
    { href: '/settings',  label: isXP ? 'Config' : 'Réglages',Icon: IcoReglages },
  ]

  const employeeItems = [
    { href: '/',         label: isXP ? 'Base' : 'Accueil',  Icon: IcoAccueil  },
    { href: '/stats',    label: isXP ? 'XP' : 'Stats',      Icon: IcoStats    },
    { href: '/paye',     label: isXP ? 'Or' : 'Paye',       Icon: IcoPaye     },
    { href: '/settings', label: isXP ? 'Config' : 'Réglages', Icon: IcoReglages },
  ]

  const items = isAdmin ? adminItems : employeeItems

  // Pour XP: insérer le bouton XP central
  const xpAdminItems = [
    adminItems[0],
    adminItems[1],
    adminItems[2],
    { href: '/stats', label: 'XP', Icon: null as never, isXPCenter: true },
    adminItems[3],
    adminItems[4],
    adminItems[5],
  ]

  const displayItems = isXP && isAdmin ? xpAdminItems : items

  const navBg = isXP
    ? 'rgba(10,5,20,0.97)'
    : 'var(--nav-bg, #0a0a0a)'

  const navBorder = isXP
    ? 'rgba(168,85,247,0.3)'
    : 'var(--nav-border, #222)'

  const activeColor = isXP ? '#a855f7' : 'var(--nav-active, #D4AF37)'
  const inactiveColor = isXP ? '#4c1d95' : 'var(--nav-inactive, #555)'

  return (
    <>
      <style>{`
        @keyframes xpNavPulse {
          0%,100% { box-shadow: 0 0 12px rgba(168,85,247,0.6), 0 0 24px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 20px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.5); }
        }
        @keyframes navGlow {
          0%,100% { filter: drop-shadow(0 0 3px var(--nav-active, #D4AF37)); }
          50% { filter: drop-shadow(0 0 7px var(--nav-active, #D4AF37)); }
        }
        @keyframes xpIconBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .nav-active-glow { animation: navGlow 2.5s ease-in-out infinite; }
        .xp-center-icon { animation: xpNavPulse 2s ease-in-out infinite, xpIconBounce 3s ease-in-out infinite; }
        .nav-link:active { opacity: 0.6 !important; }
      `}</style>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: navBg,
        borderTop: `1px solid ${navBorder}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {/* Ligne déco top */}
        <div style={{
          height: '1px',
          background: isXP
            ? 'linear-gradient(90deg, transparent, #a855f7, #22d3ee, #a855f7, transparent)'
            : 'linear-gradient(90deg, transparent, var(--nav-active, #D4AF37), transparent)',
          opacity: isXP ? 0.6 : 0.3,
        }}/>

        <div style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
          height: isXP ? '68px' : '60px', padding: '0 4px',
        }}>
          {displayItems.map((item: typeof displayItems[0], idx) => {
            // Bouton XP central surélevé
            if (isXP && (item as { isXPCenter?: boolean }).isXPCenter) {
              const isActive = pathname === '/stats'
              return (
                <Link key="xp-center" href="/stats" className="nav-link" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'flex-end', gap: '2px',
                  flex: 1, padding: '0 2px 8px', textDecoration: 'none',
                  position: 'relative',
                }}>
                  <div className="xp-center-icon" style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'absolute', bottom: '8px',
                    border: '2px solid rgba(196,181,253,0.4)',
                  }}>
                    <IcoXP active={isActive}/>
                  </div>
                </Link>
              )
            }

            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

            const color = isActive ? activeColor : inactiveColor

            return (
              <Link key={item.href} href={item.href} className="nav-link" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '3px', flex: 1,
                padding: '6px 2px', textDecoration: 'none',
                opacity: isActive ? 1 : 0.6, position: 'relative', transition: 'opacity 0.2s',
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%',
                    height: '2px',
                    background: isXP ? 'linear-gradient(90deg, #a855f7, #22d3ee)' : 'var(--nav-active)',
                    borderRadius: '0 0 2px 2px',
                  }}/>
                )}
                <div className={isActive && !isXP ? 'nav-active-glow' : ''}>
                  <item.Icon c={color} glow={isActive && isXP}/>
                </div>
                <span style={{
                  fontSize: '8px', fontWeight: isActive ? 800 : 500, color,
                  whiteSpace: 'nowrap', letterSpacing: isXP ? '0.5px' : '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {item.label}
                </span>
                {/* Niveau XP sous l'icône active en mode XP */}
                {isXP && isActive && goal && (
                  <span style={{ fontSize: '7px', color: '#22d3ee', fontWeight: 700 }}>Nv.{goal.level}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
