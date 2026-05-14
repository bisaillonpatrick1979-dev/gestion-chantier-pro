'use client'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

export default function Navbar() {
  const { theme } = useThemeStore()
  const { lang, setLang } = useLangStore()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '64px', zIndex: 50,
      background: 'rgba(10,5,0,0.90)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 16px',
    }}>

      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '8px', overflow: 'hidden',
          border: `1px solid ${theme.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: theme.colors.card,
        }}>
          <svg width="36" height="36" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="120" fill="#0a0500"/>
            <polygon points="100,10 180,55 180,60 100,18 20,60 20,55" fill="#e2e0dc"/>
            <polygon points="100,22 165,58 165,62 100,30 35,62 35,58" fill="#a8a49e"/>
            <polygon points="100,34 150,62 150,66 100,42 50,66 50,62" fill="#e2e0dc"/>
            <rect x="82" y="58" width="8" height="30" fill="#e2e0dc"/>
            <rect x="110" y="58" width="8" height="30" fill="#e2e0dc"/>
            <rect x="82" y="58" width="36" height="8" fill="#a8a49e"/>
          </svg>
        </div>
        <div>
          <div className="metal-text" style={{
            fontSize: '13px', fontWeight: '800',
            letterSpacing: '2px', lineHeight: 1
          }}>HAILITE</div>
          <div className="metal-text" style={{
            fontSize: '11px', fontWeight: '700',
            letterSpacing: '3px', lineHeight: 1
          }}>XTERIORS</div>
        </div>
      </div>

      {/* LANGUAGE TOGGLE */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['fr', 'en'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
            border: lang === l
              ? `2px solid ${theme.colors.primary}`
              : `1px solid ${theme.colors.border}`,
            background: lang === l ? theme.colors.glow1 : 'transparent',
            color: lang === l ? theme.colors.primary : theme.colors.textMuted,
            fontSize: '12px', fontWeight: '700',
          }}>
            {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
          </button>
        ))}
      </div>
    </nav>
  )
}
