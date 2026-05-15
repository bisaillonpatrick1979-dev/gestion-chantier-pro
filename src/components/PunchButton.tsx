'use client'
import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

interface PunchButtonProps {
  isRunning: boolean
  isOnBreak: boolean
  onPunch: () => void
  elapsed?: number
  revenue?: number
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const FingerprintSVG = ({ color = 'white', size = 64 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 8C18.7 8 8 18.7 8 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
    <path d="M32 12C21 12 12 21 12 32c0 4.5 1.5 8.6 4 11.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    <path d="M32 16c-8.8 0-16 7.2-16 16 0 3.8 1.3 7.2 3.5 9.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    <path d="M32 20c-6.6 0-12 5.4-12 12 0 2.8 1 5.4 2.6 7.4" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
    <path d="M32 24c-4.4 0-8 3.6-8 8 0 1.8.6 3.5 1.6 4.8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="32" cy="32" r="3" fill={color}/>
    <path d="M44 20.5C47.6 23.4 50 27.9 50 33c0 5.5-2.8 10.4-7 13.3" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    <path d="M40 16.8C44.8 19.5 48 24.9 48 31c0 4.2-1.6 8-4.2 10.9" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
)

const DiamondSVG = ({ color = '#D6B25E', size = 48 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 6L38 18L24 42L10 18L24 6Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M10 18H38" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    <path d="M16 12L20 18M32 12L28 18" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    <path d="M24 6L20 18L24 42L28 18L24 6Z" stroke={color} strokeWidth="1" opacity="0.4"/>
  </svg>
)

const PowerSVG = ({ color = 'white', size = 52 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <path d="M26 8V26" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M16 13.5C11.5 16.8 8.5 22 8.5 28c0 9.7 7.8 17.5 17.5 17.5S43.5 37.7 43.5 28c0-6-3-11.2-7.5-14.5" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

const LeafSVG = ({ color = '#C85F3D', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6C22 6 8 14 8 28c0 6.6 6.3 10 14 10 7.7 0 14-3.4 14-10C36 14 22 6 22 6Z" stroke={color} strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M22 38V16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M22 28C18 24 14 20 14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M22 24C26 20 30 18 30 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
)

const HammerSVG = ({ color = '#FF9F1C', size = 52 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect x="8" y="14" width="28" height="14" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M28 21H44V28H28" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
    <path d="M16 28V42" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M12 42H20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const StarSVG = ({ color = '#FACC15', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6L26.5 17H38L28.5 23.5L32 35L22 28L12 35L15.5 23.5L6 17H17.5L22 6Z"
      stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3"/>
  </svg>
)

// ─── Theme Configs ────────────────────────────────────────────────────────────
function getThemeConfig(themeId: string, isRunning: boolean, isFr: boolean) {
  const configs: Record<string, {
    wrapperStyle: React.CSSProperties
    buttonStyle: React.CSSProperties
    buttonClass: string
    icon: React.ReactNode
    label: string
    sublabel: string
    statusText: string
    statusColor: string
    statusDot: string
    ringStyle?: React.CSSProperties
    decorBefore?: React.ReactNode
    decorAfter?: React.ReactNode
    size: number
  }> = {

    // ── QUANTUM GLASS ──────────────────────────────────────────────────────
    quantum: {
      wrapperStyle: {
        background: 'rgba(10,22,48,0.82)',
        border: '1px solid rgba(60,130,255,0.28)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonStyle: {
        width: 180, height: 180,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF4444, #B91C1C)'
          : 'radial-gradient(circle at 40% 35%, #38D9FF, #2F80FF 55%, #1A4ADB)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(239,68,68,0.45), 0 0 50px rgba(239,68,68,0.40), 0 0 100px rgba(239,68,68,0.20)'
          : '0 0 0 3px rgba(47,128,255,0.45), 0 0 50px rgba(47,128,255,0.40), 0 0 100px rgba(47,128,255,0.20)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, color: 'white',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <FingerprintSVG color="white" size={56} />,
      label: isRunning ? (isFr ? 'PUNCH OUT' : 'PUNCH OUT') : (isFr ? 'PUNCH IN' : 'PUNCH IN'),
      sublabel: isRunning ? (isFr ? 'Appuyez pour sortir' : 'Tap to clock out') : (isFr ? 'Appuyez pour entrer' : 'Tap to clock in'),
      statusText: isRunning ? (isFr ? 'EN COURS' : 'IN PROGRESS') : (isFr ? 'PRÊT À POINTER' : 'READY'),
      statusColor: isRunning ? '#FFB020' : '#30D979',
      statusDot: isRunning ? '#FFB020' : '#30D979',
      size: 180,
      // Blueprint grid CSS via inline
      decorBefore: (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px)',
        }} />
      ),
    },

    // ── GAMIFICATION XP ───────────────────────────────────────────────────
    xp: {
      wrapperStyle: {
        background: '#1B1245',
        border: '1px solid rgba(168,85,247,0.30)',
        borderRadius: '24px',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonStyle: {
        width: 190, height: 190,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #F97316, #EA580C 55%, #C2410C)'
          : 'radial-gradient(circle at 40% 35%, #C084FC, #A855F7 55%, #7C3AED)',
        boxShadow: isRunning
          ? '0 0 0 4px rgba(249,115,22,0.40), 0 0 60px rgba(249,115,22,0.45), 0 0 120px rgba(249,115,22,0.20)'
          : '0 0 0 4px rgba(168,85,247,0.40), 0 0 60px rgba(168,85,247,0.45), 0 0 120px rgba(168,85,247,0.20)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, color: 'white',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <StarSVG color="#FACC15" size={48} />,
      label: isRunning ? (isFr ? 'POINTEZ LA SORTIE' : 'PUNCH OUT') : (isFr ? 'POINTEZ L\'ENTRÉE' : 'PUNCH IN'),
      sublabel: isRunning ? '+XP en cours...' : (isFr ? 'Gagnez des XP !' : 'Earn XP!'),
      statusText: isRunning ? (isFr ? '🔥 EN COURSE' : '🔥 IN PROGRESS') : (isFr ? '✅ PRÊT À POINTER' : '✅ READY'),
      statusColor: isRunning ? '#F97316' : '#22C55E',
      statusDot: isRunning ? '#F97316' : '#22C55E',
      size: 190,
      decorBefore: (
        <>
          {/* Rayons d'énergie */}
          {[0,45,90,135,180,225,270,315].map((deg) => (
            <div key={deg} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '120px', height: '2px',
              background: 'linear-gradient(90deg, rgba(168,85,247,0.6), transparent)',
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg)`,
              pointerEvents: 'none',
              opacity: 0.4,
            }} />
          ))}
        </>
      ),
    },

    // ── ART DÉCO PRESTIGE ─────────────────────────────────────────────────
    deco: {
      wrapperStyle: {
        background: '#12120F',
        border: '1px solid rgba(214,178,94,0.35)',
        borderRadius: '12px',
        padding: '40px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonStyle: {
        width: 185, height: 185,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #CD5C5C, #A83A32 55%, #7B1D1D)'
          : 'radial-gradient(circle at 40% 35%, #F2D27A, #D6B25E 45%, #A67C2D 75%, #7A5A1A)',
        boxShadow: isRunning
          ? '0 0 0 4px rgba(168,58,50,0.50), 0 0 40px rgba(168,58,50,0.40), 0 8px 30px rgba(0,0,0,0.70)'
          : '0 0 0 4px rgba(214,178,94,0.45), 0 0 40px rgba(214,178,94,0.35), 0 8px 30px rgba(0,0,0,0.70)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, color: '#12120F',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <DiamondSVG color="#12120F" size={40} />,
      label: isRunning ? (isFr ? 'POINÇONNER' : 'PUNCH') : (isFr ? 'POINÇONNER' : 'PUNCH'),
      sublabel: isRunning ? (isFr ? 'LA SORTIE' : 'OUT') : (isFr ? "L'ENTRÉE" : 'IN'),
      statusText: isRunning ? (isFr ? '● EN SERVICE' : '● IN SERVICE') : (isFr ? '● PRÊT À POINÇONNER' : '● READY'),
      statusColor: isRunning ? '#D6B25E' : '#6FAF5A',
      statusDot: isRunning ? '#D6B25E' : '#6FAF5A',
      size: 185,
      decorBefore: (
        <>
          {/* Rayons Art Déco */}
          {Array.from({length: 18}).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '200px', height: '1px',
              background: 'linear-gradient(90deg, rgba(214,178,94,0.25), transparent)',
              transformOrigin: '0 50%',
              transform: `translateY(-50%) rotate(${i * 20}deg)`,
              pointerEvents: 'none',
            }} />
          ))}
          {/* Coins déco */}
          {[
            { top: 8, left: 8, borderW: '2px 0 0 2px' },
            { top: 8, right: 8, borderW: '2px 2px 0 0' },
            { bottom: 8, left: 8, borderW: '0 0 2px 2px' },
            { bottom: 8, right: 8, borderW: '0 2px 2px 0' },
          ].map((corner, i) => (
            <div key={i} style={{
              position: 'absolute', width: 20, height: 20,
              border: `${corner.borderW} solid rgba(214,178,94,0.70)`,
              ...corner, pointerEvents: 'none',
            } as React.CSSProperties} />
          ))}
        </>
      ),
    },

    // ── AVENTURE CHANTIERS ────────────────────────────────────────────────
    aventure: {
      wrapperStyle: {
        background: '#231D10',
        border: '2px solid rgba(255,159,28,0.40)',
        borderRadius: '16px',
        padding: '8px 16px 28px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonStyle: {
        width: 185, height: 185,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF233C, #C0392B 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #FFB020, #F97316 55%, #C85000)',
        boxShadow: isRunning
          ? '0 0 0 6px rgba(239,35,60,0.30), 0 0 50px rgba(239,35,60,0.40), 0 8px 30px rgba(0,0,0,0.60)'
          : '0 0 0 6px rgba(255,159,28,0.30), 0 0 50px rgba(249,115,22,0.45), 0 8px 30px rgba(0,0,0,0.60)',
        border: '3px solid rgba(0,0,0,0.40)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, color: 'white',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <HammerSVG color="white" size={48} />,
      label: isRunning ? (isFr ? 'POINTEZ VOTRE SORTIE' : 'PUNCH OUT') : (isFr ? 'POINTEZ VOTRE ENTRÉE' : 'PUNCH IN'),
      sublabel: isRunning ? (isFr ? 'Mission en cours!' : 'Mission active!') : (isFr ? 'À l\'attaque!' : "Let's go!"),
      statusText: isRunning ? (isFr ? '🔨 EN MISSION' : '🔨 ON MISSION') : (isFr ? '🟢 PRÊT' : '🟢 READY'),
      statusColor: isRunning ? '#FF9F1C' : '#3BAA35',
      statusDot: isRunning ? '#FF9F1C' : '#3BAA35',
      size: 185,
      decorBefore: (
        <>
          {/* Bande hazard */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 6,
            background: 'repeating-linear-gradient(-45deg,#FF9F1C 0px,#FF9F1C 8px,#231D10 8px,#231D10 16px)',
            opacity: 0.7,
          }} />
          {/* Boulons décoratifs */}
          {[{t:16,l:16},{t:16,r:16},{b:16,l:16},{b:16,r:16}].map((pos,i) => (
            <div key={i} style={{
              position: 'absolute', width: 10, height: 10,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(255,159,28,0.8), rgba(100,80,40,0.6))',
              border: '1px solid rgba(255,159,28,0.5)',
              ...pos as React.CSSProperties, pointerEvents: 'none',
            }} />
          ))}
        </>
      ),
    },

    // ── ZEN ORGANIQUE ─────────────────────────────────────────────────────
    zen: {
      wrapperStyle: {
        background: '#FFFDF8',
        border: '1px solid rgba(98,82,60,0.12)',
        borderRadius: '28px',
        padding: '40px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(98,82,60,0.10)',
      },
      buttonStyle: {
        width: 175, height: 175,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #D97745, #B85A4A 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #D97745, #C85F3D 55%, #A84A2A)',
        boxShadow: isRunning
          ? '0 18px 45px rgba(184,90,74,0.35), 0 0 0 4px rgba(184,90,74,0.20)'
          : '0 18px 45px rgba(200,95,61,0.30), 0 0 0 4px rgba(200,95,61,0.18)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, color: 'white',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <LeafSVG color="white" size={40} />,
      label: isRunning ? (isFr ? 'POINTER LA SORTIE' : 'PUNCH OUT') : (isFr ? 'POINTER' : 'PUNCH IN'),
      sublabel: isRunning ? (isFr ? "l'arrivée" : '') : (isFr ? "l'arrivée" : ''),
      statusText: isRunning ? (isFr ? '● En cours' : '● In progress') : (isFr ? '● Prêt' : '● Ready'),
      statusColor: isRunning ? '#C8A96A' : '#6F8F5C',
      statusDot: isRunning ? '#C8A96A' : '#6F8F5C',
      size: 175,
      decorBefore: (
        <>
          {/* Blob organique gauche */}
          <div style={{
            position: 'absolute', width: 200, height: 200,
            borderRadius: '50% 40% 60% 30% / 40% 60% 40% 60%',
            background: 'rgba(200,95,61,0.06)',
            top: -60, left: -80, pointerEvents: 'none',
          }} />
          {/* Feuille droite */}
          <div style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.12, fontSize: 90, pointerEvents: 'none',
            lineHeight: 1,
          }}>🌿</div>
        </>
      ),
    },

    // ── LUDIQUE PREMIUM ───────────────────────────────────────────────────
    ludique: {
      wrapperStyle: {
        background: 'linear-gradient(135deg, #003B3D, #063B3A)',
        borderRadius: '24px',
        padding: '28px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(15,23,42,0.20)',
      },
      buttonStyle: {
        width: 185, height: 185,
        borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #FF5F5F, #FF3B30 55%, #C0392B)'
          : 'radial-gradient(circle at 40% 35%, #FF9B3D, #FF7A1A 55%, #E05E00)',
        boxShadow: isRunning
          ? '0 0 0 5px rgba(255,59,48,0.30), 0 0 60px rgba(255,59,48,0.40), 0 12px 30px rgba(15,23,42,0.35)'
          : '0 0 0 5px rgba(255,122,26,0.30), 0 0 60px rgba(255,122,26,0.40), 0 12px 30px rgba(15,23,42,0.35)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, color: 'white',
        transition: 'all 0.3s',
      },
      buttonClass: '',
      icon: <FingerprintSVG color="white" size={52} />,
      label: isRunning ? (isFr ? 'POINÇONNER LA SORTIE' : 'PUNCH OUT') : (isFr ? "POINÇONNER L'ENTRÉE" : 'PUNCH IN'),
      sublabel: isRunning ? (isFr ? 'Appuyez pour sortir' : 'Tap to clock out') : (isFr ? 'Appuyez pour pointer' : 'Tap to clock in'),
      statusText: isRunning ? (isFr ? 'EN COURS ●' : 'IN PROGRESS ●') : (isFr ? 'Prêt ●' : 'Ready ●'),
      statusColor: isRunning ? '#FF9B3D' : '#34C759',
      statusDot: isRunning ? '#FF9B3D' : '#34C759',
      size: 185,
      decorBefore: (
        <>
          {/* Greeting banner */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>
              {isFr ? 'Bonjour ! 👋' : 'Hello! 👋'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
              {isFr ? 'Prêt à construire une excellente journée.' : 'Ready to build a great day.'}
            </p>
          </div>
        </>
      ),
    },
  }

  return configs[themeId] ?? configs.quantum
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PunchButton({
  isRunning,
  isOnBreak,
  onPunch,
  elapsed = 0,
  revenue = 0,
}: PunchButtonProps) {
  const { themeId, theme } = useThemeStore()
  const { lang } = useLangStore()
  const isFr = lang === 'fr'

  const config = getThemeConfig(themeId, isRunning, isFr)

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n)

  const isDecoTheme = themeId === 'deco'
  const isZenTheme = themeId === 'zen'

  return (
    <div style={{ ...config.wrapperStyle, margin: '0 0 8px' }}>
      {/* Décor avant */}
      {config.decorBefore}

      {/* Contenu principal */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
        paddingTop: themeId === 'ludique' ? 56 : 0,
      }}>

        {/* Revenus + timer si actif */}
        {isRunning && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 8, width: '100%', maxWidth: 320,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 12, padding: '10px 12px', textAlign: 'center',
            }}>
              <p style={{ color: theme.colors.textMuted, fontSize: 10, margin: '0 0 4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {isFr ? '⏱ Temps' : '⏱ Time'}
              </p>
              <p style={{ color: theme.colors.text, fontSize: 18, fontWeight: 900, fontFamily: 'monospace', margin: 0 }}>
                {formatTime(elapsed)}
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 12, padding: '10px 12px', textAlign: 'center',
            }}>
              <p style={{ color: theme.colors.textMuted, fontSize: 10, margin: '0 0 4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {isFr ? '💰 Revenus' : '💰 Revenue'}
              </p>
              <p style={{ color: theme.colors.secondary, fontSize: 16, fontWeight: 900, margin: 0 }}>
                {formatMoney(revenue)}
              </p>
            </div>
          </div>
        )}

        {/* Le bouton punch */}
        <button
          onClick={onPunch}
          disabled={isOnBreak}
          style={{
            ...config.buttonStyle,
            opacity: isOnBreak ? 0.5 : 1,
            transform: isOnBreak ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          {/* Icône SVG */}
          {config.icon}

          {/* Texte label principal */}
          <span style={{
            fontSize: isDecoTheme ? 15 : 14,
            fontWeight: 900,
            letterSpacing: isDecoTheme ? '0.12em' : '0.05em',
            textAlign: 'center',
            lineHeight: 1.2,
            color: isDecoTheme ? '#12120F' : 'white',
            textTransform: 'uppercase',
            maxWidth: 130,
          }}>
            {config.label}
          </span>

          {/* Sous-label */}
          {config.sublabel && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: isDecoTheme ? 'rgba(18,18,15,0.65)' : isZenTheme ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.75)',
              letterSpacing: isDecoTheme ? '0.15em' : '0.03em',
              textTransform: isDecoTheme ? 'uppercase' : 'none',
            }}>
              {config.sublabel}
            </span>
          )}
        </button>

        {/* Statut sous le bouton */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isZenTheme
            ? 'rgba(98,82,60,0.08)'
            : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isZenTheme ? 'rgba(98,82,60,0.15)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 999, padding: '6px 16px',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: config.statusDot,
            boxShadow: `0 0 8px ${config.statusDot}`,
          }} />
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: config.statusColor,
            letterSpacing: isDecoTheme ? '0.1em' : '0.05em',
            textTransform: isDecoTheme ? 'uppercase' : 'none',
          }}>
            {config.statusText}
          </span>
        </div>

        {/* Message pause */}
        {isOnBreak && (
          <div style={{
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.35)',
            borderRadius: 12, padding: '8px 16px',
          }}>
            <p style={{ color: '#F97316', fontSize: 13, fontWeight: 700, margin: 0, textAlign: 'center' }}>
              ☕ {isFr ? 'En pause — reprenez d\'abord' : 'On break — resume first'}
            </p>
          </div>
        )}
      </div>

      {/* Décor après */}
      {config.decorAfter}
    </div>
  )
}

