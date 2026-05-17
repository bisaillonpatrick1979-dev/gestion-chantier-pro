'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useGoalStore } from '@/store/useGoalStore'
import { useLangStore } from '@/store/useLangStore'

function IcoAccueil({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <path d="M3 12L12 3L21 12" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10V20C5 20.6 5.4 21 6 21H10V16H14V21H18C18.6 21 19 20.6 19 20V10" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
function IcoFacture({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <rect x="3" y="2" width="14" height="18" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
    <path d="M17 6H21V22H7V20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="7" y1="8" x2="13" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7" y1="11" x2="13" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="7" y1="14" x2="10" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function IcoProjet({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
    <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.5"/>
    <circle cx="12" cy="15.5" r="1.8" stroke={c} strokeWidth="1.5" fill="none"/>
  </svg>
}
function IcoDocument({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z" stroke={c} strokeWidth="1.8" fill="none"/>
    <path d="M14 2V8H20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="17" x2="16" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
}
function IcoStats({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <line x1="2" y1="22" x2="22" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="3" y="13" width="4" height="9" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
    <rect x="10" y="7" width="4" height="15" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
    <rect x="17" y="10" width="4" height="12" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
  </svg>
}
function IcoReglages({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8" fill="none"/>
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
}
function IcoPaye({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" fill="none"/>
    <line x1="12" y1="6" x2="12" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M15 9H10.5C9.1 9 8 10.1 8 11.5C8 12.9 9.1 14 10.5 14H13.5C14.9 14 16 15.1 16 16.5C16 17.9 14.9 19 13.5 19H9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
}
function IcoCommandes({ c, glow }: { c: string; glow?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={glow ? { filter: `drop-shadow(0 0 6px ${c}) drop-shadow(0 0 3px ${c})` } : {}}>
    <path d="M9 2H15C15.6 2 16 2.4 16 3V4H8V3C8 2.4 8.4 2 9 2Z" stroke={c} strokeWidth="1.5" fill="none"/>
    <path d="M4 4H8V5C8 5.6 8.4 6 9 6H15C15.6 6 16 5.6 16 5V4H20C20.6 4 21 4.4 21 5V21C21 21.6 20.6 22 20 22H4C3.4 22 3 21.6 3 21V5C3 4.4 3.4 4 4 4Z" stroke={c} strokeWidth="1.8" fill="none"/>
    <path d="M8 12L10.5 14.5L16 9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
function IcoXP({ active }: { active: boolean }) {
  const c = active ? '#fff' : '#c4b5fd'
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <polygon points="16,2 20,11 30,11 22,17 25,27 16,21 7,27 10,17 2,11 12,11" fill={active ? '#7c3aed' : 'none'} stroke={c} strokeWidth="1.5"/>
    <text x="16" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill={c}>XP</text>
  </svg>
}

export default function BottomNav() {
  const pathname = usePathname()
  const { employees, currentEmployeeId } = useEmployeeStore()
  const { themeId, theme } = useThemeStore()
  const { getGoal } = useGoalStore()
  const { lang } = useLangStore()   // ← FIX : écoute les changements de langue en temps réel

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  const currentEmployee = employees.find(e => e.id === currentEmployeeId) ?? null
  const isAdmin    = currentEmployee?.role === 'admin'
  const isXP       = themeId === 'xp'
  const isDeco     = themeId === 'deco'
  const isQuantum  = themeId === 'quantum'
  const goal       = currentEmployeeId ? getGoal(currentEmployeeId) : null

  // ── Labels bilingues ───────────────────────────────────────────────────────
  const adminItems = [
    { href: '/',          label: isXP ? 'Base'                       : t('Accueil',   'Home'),     Icon: IcoAccueil   },
    { href: '/invoice',   label:                                        t('Factures',  'Invoices'), Icon: IcoFacture   },
    { href: '/projects',  label: isXP ? t('Quêtes', 'Quests')        : t('Projets',  'Projects'), Icon: IcoProjet    },
    { href: '/documents', label:                                        t('Docs',      'Docs'),     Icon: IcoDocument  },
    { href: '/commandes', label: isXP ? 'PO'                          : t('Commandes','Orders'),   Icon: IcoCommandes },
    { href: '/stats',     label: isXP ? t('Stats XP', 'XP Stats')    : 'Stats',                   Icon: IcoStats     },
    { href: '/settings',  label: isXP ? t('Config',   'Config')      : t('Réglages', 'Settings'), Icon: IcoReglages  },
  ]

  const employeeItems = [
    { href: '/',         label: t('Accueil',  'Home'),     Icon: IcoAccueil  },
    { href: '/invoice',  label: t('Factures', 'Invoices'), Icon: IcoFacture  },
    { href: '/stats',    label: 'Stats',                   Icon: IcoStats    },
    { href: '/paye',     label: t('Paye',     'Payroll'),  Icon: IcoPaye     },
    { href: '/settings', label: t('Réglages', 'Settings'), Icon: IcoReglages },
  ]

  const items = isAdmin ? adminItems : employeeItems

  const xpAdminItems = [
    adminItems[0], adminItems[1], adminItems[2],
    { href: '/stats', label: 'XP', Icon: null as never, isXPCenter: true },
    adminItems[3], adminItems[4], adminItems[5], adminItems[6],
  ]
  const displayItems = isXP && isAdmin ? xpAdminItems : items

  const activeColor       = isXP ? '#a855f7' : isDeco ? '#D6B25E' : isQuantum ? '#2F80FF' : theme.colors.navActive
  const inactiveColor     = isXP ? '#7c3aed' : isDeco ? '#A67C2D' : isQuantum ? '#4A6FA5' : theme.colors.navInactive
  const inactiveGlowColor = isXP ? 'rgba(168,85,247,0.40)' : isDeco ? 'rgba(214,178,94,0.35)' : isQuantum ? 'rgba(47,128,255,0.35)' : theme.colors.glow1
  const decoLineColor     = isXP
    ? 'linear-gradient(90deg,transparent,#a855f7,#22d3ee,#a855f7,transparent)'
    : isDeco
    ? 'linear-gradient(90deg,transparent,#7A5A1A,#D6B25E,#FFE9A0,#D6B25E,#7A5A1A,transparent)'
    : isQuantum
    ? 'linear-gradient(90deg,transparent,#2F80FF,#38D9FF,#2F80FF,transparent)'
    : `linear-gradient(90deg,transparent,${theme.colors.primary},transparent)`

  return (
    <>
      <style>{`
        @keyframes xpNavPulse{0%,100%{box-shadow:0 0 12px rgba(168,85,247,0.6),0 0 24px rgba(168,85,247,0.3)}50%{box-shadow:0 0 20px rgba(168,85,247,0.9),0 0 40px rgba(168,85,247,0.5)}}
        @keyframes xpIconBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .xp-center-icon{animation:xpNavPulse 2s ease-in-out infinite,xpIconBounce 3s ease-in-out infinite}
        @keyframes navActiveGlow{0%,100%{filter:drop-shadow(0 0 5px ${activeColor}) drop-shadow(0 0 2px ${activeColor})}50%{filter:drop-shadow(0 0 12px ${activeColor}) drop-shadow(0 0 5px ${activeColor})}}
        .nav-active-glow{animation:navActiveGlow 2s ease-in-out infinite}
        @keyframes navInactiveGlow{0%,100%{filter:drop-shadow(0 0 2px ${inactiveGlowColor})}50%{filter:drop-shadow(0 0 5px ${inactiveGlowColor})}}
        .nav-inactive-glow{animation:navInactiveGlow 3.5s ease-in-out infinite}
        @keyframes navLineSweep{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
        .nav-line-sweep::after{content:'';position:absolute;top:0;left:0;width:25%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.90),transparent);animation:navLineSweep 3s ease-in-out infinite}
        @keyframes indicatorPulse{0%,100%{opacity:0.7}50%{opacity:1.0}}
        .nav-indicator{animation:indicatorPulse 2s ease-in-out infinite}
        .nav-link:active{opacity:0.6 !important}
      `}</style>

      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background: isXP ? 'rgba(10,5,20,0.97)' : 'var(--nav-bg,#0a0a0a)',
        borderTop:`1px solid ${isXP ? 'rgba(168,85,247,0.3)' : 'var(--nav-border,#222)'}`,
        paddingBottom:'env(safe-area-inset-bottom,0px)',
      }}>
        <div className="nav-line-sweep" style={{
          height:'1px', background:decoLineColor,
          opacity: isDeco ? 0.7 : 0.5, position:'relative', overflow:'hidden',
        }}/>

        <div style={{
          display:'flex', justifyContent:'space-around', alignItems:'flex-end',
          height: isXP ? '68px' : '60px', padding:'0 2px',
        }}>
          {displayItems.map((item: typeof displayItems[0]) => {

            if (isXP && (item as { isXPCenter?: boolean }).isXPCenter) {
              const isActive = pathname === '/stats'
              return (
                <Link key="xp-center" href="/stats" className="nav-link" style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'flex-end', flex:1, padding:'0 2px 8px',
                  textDecoration:'none', position:'relative',
                }}>
                  <div className="xp-center-icon" style={{
                    width:'52px', height:'52px', borderRadius:'14px',
                    background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'absolute', bottom:'8px',
                    border:'2px solid rgba(196,181,253,0.4)',
                  }}>
                    <IcoXP active={isActive}/>
                  </div>
                </Link>
              )
            }

            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            const color = isActive ? activeColor : inactiveColor

            return (
              <Link key={item.href} href={item.href} className="nav-link" style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:'2px', flex:1,
                padding:'5px 1px', textDecoration:'none',
                opacity: isActive ? 1 : 0.85, position:'relative', transition:'opacity 0.2s',
              }}>
                {isActive && (
                  <div className="nav-indicator" style={{
                    position:'absolute', top:0, left:'20%', right:'20%', height:'2px',
                    background: isXP     ? 'linear-gradient(90deg,#a855f7,#22d3ee)'
                      : isDeco   ? 'linear-gradient(90deg,#A67C2D,#FFE9A0,#A67C2D)'
                      : isQuantum ? 'linear-gradient(90deg,#2F80FF,#38D9FF,#2F80FF)'
                      : activeColor,
                    borderRadius:'0 0 2px 2px', margin:'0 auto',
                  }}/>
                )}
                <div className={isActive ? (isXP ? '' : 'nav-active-glow') : 'nav-inactive-glow'}>
                  <item.Icon c={color} glow={isActive}/>
                </div>
                <span style={{
                  fontSize:'7px', fontWeight: isActive ? 800 : 600, color,
                  whiteSpace:'nowrap', letterSpacing: isXP ? '0.5px' : '0.04em',
                  textTransform:'uppercase',
                  textShadow: isActive ? `0 0 8px ${activeColor}` : `0 0 4px ${inactiveGlowColor}`,
                }}>
                  {item.label}
                </span>
                {isXP && isActive && goal && (
                  <span style={{fontSize:'6px', color:'#22d3ee', fontWeight:700}}>Nv.{goal.level}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
