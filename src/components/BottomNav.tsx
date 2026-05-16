'use client'
// src/components/layout/BottomNav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'

// ════════════════════════════════════════════════════════
// ICÔNES ART DÉCO SVG
// ════════════════════════════════════════════════════════

// Dashboard — éventail Art Déco
const IconDashboardDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <line x1="12" y1="22" x2="2"  y2="6"  stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.45"/>
      <line x1="12" y1="22" x2="5"  y2="4"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.55"/>
      <line x1="12" y1="22" x2="8"  y2="3"  stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity="0.70"/>
      <line x1="12" y1="22" x2="10" y2="3"  stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="12" y1="22" x2="12" y2="3"  stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="22" x2="14" y2="3"  stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="12" y1="22" x2="16" y2="3"  stroke={c} strokeWidth="1.1" strokeLinecap="round" opacity="0.70"/>
      <line x1="12" y1="22" x2="19" y2="4"  stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.55"/>
      <line x1="12" y1="22" x2="22" y2="6"  stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.45"/>
      <path d="M4 20 Q12 13 20 20" stroke={c} strokeWidth="1" fill="none" opacity="0.55"/>
      <path d="M6 21.5 Q12 16 18 21.5" stroke={c} strokeWidth="0.7" fill="none" opacity="0.35"/>
      <circle cx="12" cy="22" r="1.5" fill={c}/>
    </svg>
  )
}

// Stats — colonnes géométriques
const IconStatsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.15)' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <rect x="2"  y="14" width="4" height="8" stroke={c} strokeWidth="1.2" fill={fill}/>
      <rect x="8"  y="9"  width="4" height="13" stroke={c} strokeWidth="1.2" fill={fill}/>
      <rect x="14" y="5"  width="4" height="17" stroke={c} strokeWidth="1.5" fill={active ? 'rgba(214,178,94,0.22)' : 'none'}/>
      <line x1="1"  y1="14" x2="7"  y2="14" stroke={c} strokeWidth="1.5"/>
      <line x1="7"  y1="9"  x2="13" y2="9"  stroke={c} strokeWidth="1.5"/>
      <line x1="13" y1="5"  x2="19" y2="5"  stroke={c} strokeWidth="1.5"/>
      <line x1="1" y1="22" x2="21" y2="22" stroke={c} strokeWidth="1.2"/>
    </svg>
  )
}

// Projets — bâtiment géométrique
const IconProjetsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.18)' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <polygon points="12,2 20,8 20,9 12,4 4,9 4,8" stroke={c} strokeWidth="1.2" fill="none"/>
      <polygon points="12,5 18,9 18,10 12,7 6,10 6,9" stroke={c} strokeWidth="0.9" fill="none" opacity="0.6"/>
      <rect x="4" y="9" width="16" height="13" stroke={c} strokeWidth="1.2" fill={fill}/>
      <rect x="6"  y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="10" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="15" y="12" width="3" height="4" stroke={c} strokeWidth="0.9" fill={active ? 'rgba(214,178,94,0.25)' : 'none'}/>
      <rect x="10" y="18" width="4" height="4" stroke={c} strokeWidth="0.9" fill="none"/>
      <path d="M10.5 0.5L12 3L13.5 0.5L12 1.5Z" fill={c} opacity="0.75"/>
    </svg>
  )
}

// Documents — parchemin géométrique
const IconDocumentsDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.08)' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <path d="M5 3H15L19 7V21H5V3Z" stroke={c} strokeWidth="1.3" fill={fill}/>
      <path d="M15 3L15 7H19" stroke={c} strokeWidth="1.3"/>
      <line x1="8" y1="11" x2="16" y2="11" stroke={c} strokeWidth="1"   opacity="0.8"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke={c} strokeWidth="1"   opacity="0.6"/>
      <line x1="8" y1="17" x2="13" y2="17" stroke={c} strokeWidth="1"   opacity="0.4"/>
      <path d="M15 5L17 7L15 9L13 7Z" stroke={c} strokeWidth="0.8" fill={active ? 'rgba(214,178,94,0.25)' : 'none'} opacity="0.7"/>
      <line x1="5" y1="21" x2="19" y2="21" stroke={c} strokeWidth="1.5"/>
    </svg>
  )
}

// Comptabilité — cercle $ Art Déco
const IconComptaDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.08)' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.3" fill={fill}/>
      <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="0.7" fill="none" opacity="0.4"/>
      <line x1="12" y1="6"  x2="12" y2="18" stroke={c} strokeWidth="1.3"/>
      <path d="M15 8.5C14 7.5 10 7.5 10 10C10 12.5 14 12 14 14.5C14 17 10 17 9 16" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="3"  r="1.2" fill={c} opacity="0.7"/>
      <circle cx="21" cy="12" r="1.2" fill={c} opacity="0.7"/>
      <circle cx="12" cy="21" r="1.2" fill={c} opacity="0.7"/>
      <circle cx="3"  cy="12" r="1.2" fill={c} opacity="0.7"/>
    </svg>
  )
}

// Réglages — roue géométrique
const IconReglagesDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.20)' : 'none'
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="3.5" stroke={c} strokeWidth="1.4" fill={fill}/>
      <circle cx="12" cy="12" r="7"   stroke={c} strokeWidth="0.7" strokeDasharray="2 2" fill="none" opacity="0.5"/>
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const cx2 = 12 + 8.5 * Math.sin(rad)
        const cy2 = 12 - 8.5 * Math.cos(rad)
        return (
          <path key={i}
            d={`M${cx2} ${cy2 - 1.4}L${cx2 + 1.4} ${cy2}L${cx2} ${cy2 + 1.4}L${cx2 - 1.4} ${cy2}Z`}
            fill={c} opacity={i % 2 === 0 ? 0.9 : 0.5}
          />
        )
      })}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line key={i}
            x1={12 + 3.5 * Math.sin(rad)} y1={12 - 3.5 * Math.cos(rad)}
            x2={12 + 7   * Math.sin(rad)} y2={12 - 7   * Math.cos(rad)}
            stroke={c} strokeWidth="1.3" opacity="0.7"
          />
        )
      })}
    </svg>
  )
}

// Stats employé — courbe montante
const IconStatsEmpDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <polyline points="3,18 8,12 13,15 20,6" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="3"  cy="18" r="1.5" fill={c}/>
      <circle cx="8"  cy="12" r="1.5" fill={c}/>
      <circle cx="13" cy="15" r="1.5" fill={c}/>
      <circle cx="20" cy="6"  r="1.5" fill={c}/>
      <path d="M18 4L20 6L22 4" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke={c} strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}

// Ma paye — pièce de monnaie
const IconPayeDeco = ({ active }: { active: boolean }) => {
  const c = active ? '#D6B25E' : 'rgba(214,178,94,0.40)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(214,178,94,0.80))' : 'none'
  const fill = active ? 'rgba(214,178,94,0.12)' : 'none'
  const rayAngles = [0, 60, 120, 180, 240, 300]
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="9"   stroke={c} strokeWidth="1.4" fill={fill}/>
      <circle cx="12" cy="12" r="6.5" stroke={c} strokeWidth="0.8" fill="none" opacity="0.5"/>
      <line x1="12" y1="7"  x2="12" y2="17" stroke={c} strokeWidth="1.2"/>
      <path d="M14.5 9C13.5 8 10 8 10 10.5C10 13 14 12.5 14 15C14 17 10.5 17 9.5 16" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {rayAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line key={i}
            x1={12 + 7 * Math.sin(rad)} y1={12 - 7 * Math.cos(rad)}
            x2={12 + 9 * Math.sin(rad)} y2={12 - 9 * Math.cos(rad)}
            stroke={c} strokeWidth="1.2" opacity="0.6"
          />
        )
      })}
    </svg>
  )
}

// Logo standard (autres thèmes)
const StandardLogo = () => (
  <svg width="36" height="36" viewBox="0 0 200 120">
    <rect width="200" height="120" fill="#0a0500"/>
    <polygon points="100,10 180,55 180,60 100,18 20,60 20,55" fill="#e2e0dc"/>
    <polygon points="100,22 165,58 165,62 100,30 35,62 35,58" fill="#a8a49e"/>
    <polygon points="100,34 150,62 150,66 100,42 50,66 50,62" fill="#e2e0dc"/>
    <rect x="82" y="58" width="8"  height="30" fill="#e2e0dc"/>
    <rect x="110" y="58" width="8" height="30" fill="#e2e0dc"/>
    <rect x="82"  y="58" width="36" height="8" fill="#a8a49e"/>
  </svg>
)

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════

export default function BottomNav() {
  const pathname = usePathname()
  const { theme, themeId } = useThemeStore()
  const { lang } = useLangStore()
  const { currentEmployeeId, employees } = useEmployeeStore()

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en
  const isDeco = themeId === 'deco'

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isAdmin    = currentEmployee?.role === 'admin'
  const isLoggedIn = !!currentEmployeeId

  const adminTabs = [
    { href: '/',             emoji: '🏠', decoIcon: (a: boolean) => <IconDashboardDeco  active={a} />, label: t('Dashboard', 'Dashboard')  },
    { href: '/projects',     emoji: '🏗️', decoIcon: (a: boolean) => <IconProjetsDeco    active={a} />, label: t('Projets',   'Projects')   },
    { href: '/documents',    emoji: '🧾', decoIcon: (a: boolean) => <IconDocumentsDeco  active={a} />, label: t('Documents', 'Documents')  },
    { href: '/comptabilite', emoji: '📊', decoIcon: (a: boolean) => <IconComptaDeco     active={a} />, label: t('Compta',    'Accounting') },
    { href: '/settings',     emoji: '⚙️', decoIcon: (a: boolean) => <IconReglagesDeco   active={a} />, label: t('Réglages',  'Settings')   },
  ]

  const employeeTabs = [
    { href: '/',      emoji: '🏠', decoIcon: (a: boolean) => <IconDashboardDeco  active={a} />, label: t('Dashboard', 'Dashboard') },
    { href: '/stats', emoji: '📈', decoIcon: (a: boolean) => <IconStatsEmpDeco   active={a} />, label: t('Stats',     'Stats')     },
    { href: '/paye',  emoji: '💵', decoIcon: (a: boolean) => <IconPayeDeco        active={a} />, label: t('Ma paye',   'My pay')    },
  ]

  const navStyle: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 64, zIndex: 50,
    backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center',
    background: isDeco ? 'rgba(5,5,5,0.98)' : 'rgba(10,5,0,0.95)',
    borderTop: isDeco ? '1px solid rgba(214,178,94,0.25)' : `1px solid ${theme.colors.border}`,
    justifyContent: isLoggedIn ? 'space-around' : 'center',
  }

  if (!isLoggedIn) {
    return (
      <nav style={navStyle}>
        {isDeco && (
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
            background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.55),transparent)', pointerEvents:'none' }} />
        )}
        <p style={{ color: isDeco ? 'rgba(214,178,94,0.50)' : theme.colors.textMuted, fontSize:12,
          letterSpacing: isDeco ? '0.10em' : '0' }}>
          🔒 {t('Connectez-vous pour accéder', 'Login to access')}
        </p>
      </nav>
    )
  }

  const tabs = isAdmin ? adminTabs : employeeTabs

  // ── ART DÉCO ───────────────────────────────────────────────────────────────
  if (isDeco) {
    return (
      <nav style={navStyle}>
        {/* Ligne dorée en haut */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1,
          background:'linear-gradient(90deg,transparent,rgba(214,178,94,0.60),transparent)', pointerEvents:'none' }} />

        {tabs.map(({ href, decoIcon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              textDecoration:'none', padding:'8px 0', flex:1,
            }}>
              <div style={{ transform: active ? 'scale(1.15) translateY(-1px)' : 'scale(1)', transition:'transform 0.2s ease' }}>
                {decoIcon(active)}
              </div>
              <span style={{
                fontSize:9, fontWeight: active ? 800 : 600,
                letterSpacing:'0.08em', textTransform:'uppercase',
                color: active ? '#D6B25E' : 'rgba(214,178,94,0.40)',
                textShadow: active ? '0 0 10px rgba(214,178,94,0.70)' : 'none',
                transition:'all 0.2s ease',
              }}>
                {label}
              </span>
              {active && (
                <div style={{
                  width:18, height:2,
                  background:'linear-gradient(90deg,transparent,#D6B25E,transparent)',
                  borderRadius:1, boxShadow:'0 0 6px rgba(214,178,94,0.80)',
                }} />
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  // ── AUTRES THÈMES ──────────────────────────────────────────────────────────
  return (
    <nav style={navStyle}>
      {tabs.map(({ href, emoji, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={href} href={href} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            textDecoration:'none', padding:'8px 0', flex:1,
          }}>
            <span style={{ fontSize:20, filter: active ? 'none' : 'grayscale(30%)',
              transition:'transform 0.15s', transform: active ? 'scale(1.15)' : 'scale(1)', display:'block' }}>
              {emoji}
            </span>
            <span style={{ fontSize:9, fontWeight: active ? 800 : 600, letterSpacing:'0.5px',
              color: active ? theme.colors.primary : theme.colors.textMuted, transition:'color 0.15s' }}>
              {label}
            </span>
            {active && (
              <div style={{ width:4, height:4, borderRadius:'50%',
                background:theme.colors.primary, boxShadow:`0 0 6px ${theme.colors.primary}` }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
