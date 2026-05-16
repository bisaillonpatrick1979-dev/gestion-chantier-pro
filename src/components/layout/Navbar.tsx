'use client'
// src/components/layout/Navbar.tsx
// Header avec design Art Déco Prestige quand thème deco actif

import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

// ── Logo Art Déco — immeuble géométrique en or ────────────────────────────────
const DecoLogo = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
    {/* Fond sombre */}
    <rect width="100" height="100" rx="6" fill="#0A0800"/>
    {/* Bâtiment principal — triangles géométriques */}
    <polygon points="50,8 88,32 88,35 50,14 12,35 12,32" fill="#D6B25E"/>
    <polygon points="50,18 80,36 80,39 50,24 20,39 20,36" fill="#A67C2D"/>
    <polygon points="50,28 72,40 72,43 50,34 28,43 28,40" fill="#D6B25E"/>
    <polygon points="50,36 66,44 66,47 50,41 34,47 34,44" fill="#8B6010"/>
    {/* Corps du bâtiment */}
    <rect x="38" y="44" width="8"  height="32" fill="#D6B25E"/>
    <rect x="54" y="44" width="8"  height="32" fill="#D6B25E"/>
    <rect x="38" y="44" width="24" height="7"  fill="#A67C2D"/>
    {/* Fenêtres */}
    <rect x="40" y="56" width="4" height="5" fill="#0A0800" opacity="0.8"/>
    <rect x="56" y="56" width="4" height="5" fill="#0A0800" opacity="0.8"/>
    {/* Base */}
    <rect x="28" y="76" width="44" height="4" fill="#A67C2D"/>
    {/* Ornement étoile au sommet */}
    <path d="M50 4 L52 9 L57 9 L53 12 L55 17 L50 14 L45 17 L47 12 L43 9 L48 9Z" fill="#F2D27A" opacity="0.9"/>
    {/* Bordure dorée */}
    <rect width="100" height="100" rx="6" fill="none" stroke="rgba(214,178,94,0.45)" strokeWidth="2"/>
  </svg>
)

// ── Logo standard (autres thèmes) ────────────────────────────────────────────
const StandardLogo = ({ theme }: { theme: { colors: { border: string; card: string } } }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: theme.colors.card,
  }}>
    <svg width="36" height="36" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#0a0500"/>
      <polygon points="100,10 180,55 180,60 100,18 20,60 20,55" fill="#e2e0dc"/>
      <polygon points="100,22 165,58 165,62 100,30 35,62 35,58" fill="#a8a49e"/>
      <polygon points="100,34 150,62 150,66 100,42 50,66 50,62" fill="#e2e0dc"/>
      <rect x="82" y="58" width="8"  height="30" fill="#e2e0dc"/>
      <rect x="110" y="58" width="8" height="30" fill="#e2e0dc"/>
      <rect x="82"  y="58" width="36" height="8" fill="#a8a49e"/>
    </svg>
  </div>
)

export default function Navbar() {
  const { theme, themeId } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const isDeco = themeId === 'deco'

  // ── ART DÉCO ────────────────────────────────────────────────────────────────
  if (isDeco) {
    return (
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 64, zIndex: 50,
        background: 'rgba(5,5,5,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(214,178,94,0.30)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'fixed' as const,
      }}>
        {/* Ligne décorative or en haut */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.80), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Coins Art Déco */}
        <div style={{ position:'absolute', top:6, left:6, width:16, height:16,
          borderTop:'1.5px solid rgba(214,178,94,0.65)', borderLeft:'1.5px solid rgba(214,178,94,0.65)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:6, right:6, width:16, height:16,
          borderTop:'1.5px solid rgba(214,178,94,0.65)', borderRight:'1.5px solid rgba(214,178,94,0.65)',
          pointerEvents:'none' }} />

        {/* LOGO + NOM */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <DecoLogo />
          <div>
            <div style={{
              fontSize:13, fontWeight:900, letterSpacing:'3px', lineHeight:1.1,
              background: 'linear-gradient(90deg, #8B6010, #D6B25E, #F2D27A, #D6B25E, #8B6010)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'decoShimmerText 4s linear infinite',
            }}>
              HAILITE
            </div>
            <div style={{
              fontSize:10, fontWeight:700, letterSpacing:'4px', lineHeight:1.1,
              background: 'linear-gradient(90deg, #A67C2D, #D6B25E, #F2D27A, #D6B25E, #A67C2D)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'decoShimmerText 4s linear infinite 0.5s',
            }}>
              XTERIORS
            </div>
          </div>
        </div>

        {/* TOGGLE FR/EN — pill Art Déco */}
        <div style={{
          display:'flex', alignItems:'center',
          background: '#111109',
          border: '1px solid rgba(214,178,94,0.40)',
          borderRadius: 999,
          padding: 3,
          gap: 2,
        }}>
          {(['fr', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '5px 14px', borderRadius: 999, cursor: 'pointer',
              border: 'none',
              background: lang === l
                ? 'linear-gradient(135deg, #C49A3C, #D6B25E)'
                : 'transparent',
              color: lang === l ? '#0A0800' : 'rgba(214,178,94,0.60)',
              fontSize: 12, fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: lang === l ? '0 0 10px rgba(214,178,94,0.40)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Ligne décorative or en bas */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.50), transparent)',
          pointerEvents: 'none',
        }} />
      </nav>
    )
  }

  // ── AUTRES THÈMES ────────────────────────────────────────────────────────────
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 64, zIndex: 50,
      background: 'rgba(10,5,0,0.90)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 16px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <StandardLogo theme={theme} />
        <div>
          <div className="metal-text" style={{ fontSize:13, fontWeight:800, letterSpacing:'2px', lineHeight:1 }}>HAILITE</div>
          <div className="metal-text" style={{ fontSize:11, fontWeight:700, letterSpacing:'3px', lineHeight:1 }}>XTERIORS</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {(['fr', 'en'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding:'6px 12px', borderRadius:20, cursor:'pointer',
            border: lang === l ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
            background: lang === l ? theme.colors.glow1 : 'transparent',
            color: lang === l ? theme.colors.primary : theme.colors.textMuted,
            fontSize:12, fontWeight:700,
          }}>
            {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>
    </nav>
  )
}
