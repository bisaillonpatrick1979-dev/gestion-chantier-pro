'use client'
// src/components/PunchButton.tsx
// Bouton Punch In/Out — design unique par thème
// Art Déco Prestige : médaillon doré avec rayons animés

import { useThemeStore } from '@/store/useThemeStore'
import { useLangStore } from '@/store/useLangStore'

interface PunchButtonProps {
  isRunning: boolean
  isOnBreak: boolean
  onPunch: () => void
  elapsed?: number
  revenue?: number
}

// ─── SVGs thématiques ────────────────────────────────────────────────────────

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

// Diamant Art Déco — icône principale du thème deco
const DecoDiamondSVG = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    {/* Diamant principal */}
    <path d="M24 6L40 20L24 44L8 20L24 6Z"
      stroke="#1A1200" strokeWidth="1.8" fill="none" opacity="0.7"/>
    {/* Ligne horizontale */}
    <path d="M8 20H40" stroke="#1A1200" strokeWidth="1.5" opacity="0.5"/>
    {/* Facettes */}
    <path d="M16 11L12 20M32 11L36 20" stroke="#1A1200" strokeWidth="1.5" opacity="0.4"/>
    <path d="M24 6L20 20L24 44L28 20L24 6Z" stroke="#1A1200" strokeWidth="1" opacity="0.3"/>
    {/* Reflet */}
    <path d="M18 14L22 20" stroke="rgba(255,240,180,0.6)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const StarSVG = ({ color = '#FACC15', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6L26.5 17H38L28.5 23.5L32 35L22 28L12 35L15.5 23.5L6 17H17.5L22 6Z"
      stroke={color} strokeWidth="2" fill={color} fillOpacity="0.3"/>
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

const LeafSVG = ({ color = 'white', size = 44 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6C22 6 8 14 8 28c0 6.6 6.3 10 14 10 7.7 0 14-3.4 14-10C36 14 22 6 22 6Z"
      stroke={color} strokeWidth="2" fill="none" opacity="0.8"/>
    <path d="M22 38V16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M22 28C18 24 14 20 14 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M22 24C26 20 30 18 30 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
)

// ─── Config par thème ────────────────────────────────────────────────────────

function getConfig(themeId: string, isRunning: boolean, isFr: boolean) {
  const t = (fr: string, en: string) => isFr ? fr : en

  const configs: Record<string, {
    wrapperClass: string
    wrapperStyle: React.CSSProperties
    buttonClass: string
    buttonStyle: React.CSSProperties
    decorLayers?: React.ReactNode
    icon: React.ReactNode
    labelLine1: string
    labelLine2: string
    statusText: string
    statusColor: string
    statusDotColor: string
    textColor: string
    paddingTop?: number
  }> = {

    // ── Quantum Glass ───────────────────────────────────────────────────────
    quantum: {
      wrapperClass: '',
      wrapperStyle: {
        background: 'rgba(10,22,48,0.82)',
        border: '1px solid rgba(60,130,255,0.28)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 24,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 180, height: 180, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF4444, #B91C1C)'
          : 'radial-gradient(circle at 40% 35%, #38D9FF, #2F80FF 55%, #1A4ADB)',
        boxShadow: isRunning
          ? '0 0 0 3px rgba(239,68,68,0.45), 0 0 50px rgba(239,68,68,0.40)'
          : '0 0 0 3px rgba(47,128,255,0.45), 0 0 50px rgba(47,128,255,0.40)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(47,128,255,0.04) 30px,rgba(47,128,255,0.04) 31px)' }} />
      ),
      icon: <FingerprintSVG color="white" size={52} />,
      labelLine1: isRunning ? t('PUNCH OUT', 'PUNCH OUT') : t('PUNCH IN', 'PUNCH IN'),
      labelLine2: '',
      statusText: isRunning ? t('EN COURS', 'IN PROGRESS') : t('PRÊT À POINTER', 'READY'),
      statusColor: isRunning ? '#FFB020' : '#30D979',
      statusDotColor: isRunning ? '#FFB020' : '#30D979',
      textColor: 'white',
    },

    // ── Gamification XP ────────────────────────────────────────────────────
    xp: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#1B1245',
        border: '1px solid rgba(168,85,247,0.30)',
        borderRadius: 24, padding: '32px 16px',
        position: 'relative', overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 190, height: 190, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #F97316, #EA580C 55%, #C2410C)'
          : 'radial-gradient(circle at 40% 35%, #C084FC, #A855F7 55%, #7C3AED)',
        boxShadow: isRunning
          ? '0 0 0 4px rgba(249,115,22,0.40), 0 0 60px rgba(249,115,22,0.45)'
          : '0 0 0 4px rgba(168,85,247,0.40), 0 0 60px rgba(168,85,247,0.45)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      decorLayers: (
        <>
          {[0,45,90,135,180,225,270,315].map(deg => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 130, height: 2,
              background: 'linear-gradient(90deg, rgba(168,85,247,0.55), transparent)',
              transformOrigin: '0 50%',
              transform: `rotate(${deg}deg)`,
              pointerEvents: 'none', opacity: 0.45,
            }} />
          ))}
        </>
      ),
      icon: <StarSVG color="#FACC15" size={46} />,
      labelLine1: isRunning ? t('POINTEZ LA SORTIE', 'PUNCH OUT') : t("POINTEZ L'ENTRÉE", 'PUNCH IN'),
      labelLine2: isRunning ? '' : t('Gagnez des XP!', 'Earn XP!'),
      statusText: isRunning ? t('🔥 EN COURSE', '🔥 IN PROGRESS') : t('✅ PRÊT', '✅ READY'),
      statusColor: isRunning ? '#F97316' : '#22C55E',
      statusDotColor: isRunning ? '#F97316' : '#22C55E',
      textColor: 'white',
    },

    // ── Art Déco Prestige ───────────────────────────────────────────────────
    deco: {
      wrapperClass: 'deco-punch-wrapper',
      wrapperStyle: {
        // Style de base — les classes CSS gèrent le reste
        margin: '0 0 8px',
      },
      buttonClass: isRunning ? 'deco-punch-btn-out' : 'deco-punch-btn',
      buttonStyle: {
        width: 188, height: 188, borderRadius: '50%',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4, position: 'relative',
      },
      decorLayers: (
        <>
          {/* Rayons extérieurs — rotation lente */}
          <div className="deco-rays-outer" />
          {/* Rayons intérieurs — rotation inverse */}
          <div className="deco-rays-inner" />
          {/* Anneau doré décoratif */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 218, height: 218, borderRadius: '50%',
            border: '1px solid rgba(214,178,94,0.25)',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 236, height: 236, borderRadius: '50%',
            border: '1px solid rgba(214,178,94,0.12)',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />
          {/* Coin supérieur gauche supplémentaire */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 28, height: 28,
            borderTop: '2px solid rgba(214,178,94,0.75)',
            borderRight: '2px solid rgba(214,178,94,0.75)',
            pointerEvents: 'none', zIndex: 10,
          }} />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            width: 28, height: 28,
            borderBottom: '2px solid rgba(214,178,94,0.75)',
            borderLeft: '2px solid rgba(214,178,94,0.75)',
            pointerEvents: 'none', zIndex: 10,
          }} />
        </>
      ),
      icon: <DecoDiamondSVG size={34} />,
      labelLine1: t('POINÇONNER', isRunning ? 'PUNCH' : 'PUNCH'),
      labelLine2: isRunning ? t('LA SORTIE', 'OUT') : t("L'ENTRÉE", 'IN'),
      statusText: isRunning ? t('● EN SERVICE', '● IN SERVICE') : t('● PRÊT À POINÇONNER', '● READY'),
      statusColor: isRunning ? '#D6B25E' : '#6FAF5A',
      statusDotColor: isRunning ? '#D6B25E' : '#6FAF5A',
      textColor: '#0A0A06',
    },

    // ── Aventure Chantiers ──────────────────────────────────────────────────
    aventure: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#231D10',
        border: '2px solid rgba(255,159,28,0.40)',
        borderRadius: 16, padding: '8px 16px 28px',
        position: 'relative', overflow: 'hidden',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #EF233C, #C0392B 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #FFB020, #F97316 55%, #C85000)',
        boxShadow: isRunning
          ? '0 0 0 6px rgba(239,35,60,0.30), 0 0 50px rgba(239,35,60,0.40)'
          : '0 0 0 6px rgba(255,159,28,0.30), 0 0 50px rgba(249,115,22,0.45)',
        border: '3px solid rgba(0,0,0,0.40)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6,
          background: 'repeating-linear-gradient(-45deg,#FF9F1C 0px,#FF9F1C 8px,#231D10 8px,#231D10 16px)',
          opacity: 0.7 }} />
      ),
      icon: <HammerSVG color="white" size={48} />,
      labelLine1: isRunning ? t('POINTEZ VOTRE SORTIE', 'PUNCH OUT') : t('POINTEZ VOTRE ENTRÉE', 'PUNCH IN'),
      labelLine2: isRunning ? t('Mission en cours!', 'Mission active!') : t("À l'attaque!", "Let's go!"),
      statusText: isRunning ? t('🔨 EN MISSION', '🔨 ON MISSION') : t('🟢 PRÊT', '🟢 READY'),
      statusColor: isRunning ? '#FF9F1C' : '#3BAA35',
      statusDotColor: isRunning ? '#FF9F1C' : '#3BAA35',
      textColor: 'white',
    },

    // ── Zen Organique ───────────────────────────────────────────────────────
    zen: {
      wrapperClass: '',
      wrapperStyle: {
        background: '#FFFDF8',
        border: '1px solid rgba(98,82,60,0.12)',
        borderRadius: 28, padding: '40px 16px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(98,82,60,0.10)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 175, height: 175, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #D97745, #B85A4A 55%, #922B21)'
          : 'radial-gradient(circle at 40% 35%, #D97745, #C85F3D 55%, #A84A2A)',
        boxShadow: isRunning
          ? '0 18px 45px rgba(184,90,74,0.35)'
          : '0 18px 45px rgba(200,95,61,0.30)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      icon: <LeafSVG color="white" size={40} />,
      labelLine1: isRunning ? t('POINTER LA SORTIE', 'PUNCH OUT') : t('POINTER', 'PUNCH IN'),
      labelLine2: isRunning ? '' : t("l'arrivée", ''),
      statusText: isRunning ? t('● En cours', '● In progress') : t('● Prêt', '● Ready'),
      statusColor: isRunning ? '#C8A96A' : '#6F8F5C',
      statusDotColor: isRunning ? '#C8A96A' : '#6F8F5C',
      textColor: 'white',
    },

    // ── Ludique Premium ─────────────────────────────────────────────────────
    ludique: {
      wrapperClass: '',
      wrapperStyle: {
        background: 'linear-gradient(135deg, #003B3D, #063B3A)',
        borderRadius: 24, padding: '0 16px 28px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(15,23,42,0.20)',
      },
      buttonClass: '',
      buttonStyle: {
        width: 185, height: 185, borderRadius: '50%',
        background: isRunning
          ? 'radial-gradient(circle at 40% 35%, #FF5F5F, #FF3B30 55%, #C0392B)'
          : 'radial-gradient(circle at 40% 35%, #FF9B3D, #FF7A1A 55%, #E05E00)',
        boxShadow: isRunning
          ? '0 0 0 5px rgba(255,59,48,0.30), 0 0 60px rgba(255,59,48,0.40)'
          : '0 0 0 5px rgba(255,122,26,0.30), 0 0 60px rgba(255,122,26,0.40)',
        border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, transition: 'all 0.3s',
      },
      decorLayers: (
        <div style={{
          padding: '14px 16px 10px',
          background: 'rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 24,
        }}>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 800, margin: 0 }}>
            {isFr ? 'Bonjour! 👋' : 'Hello! 👋'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
            {isFr ? 'Prêt à construire une excellente journée.' : 'Ready to build a great day.'}
          </p>
        </div>
      ),
      icon: <FingerprintSVG color="white" size={52} />,
      labelLine1: isRunning ? t('POINÇONNER LA SORTIE', 'PUNCH OUT') : t("POINÇONNER L'ENTRÉE", 'PUNCH IN'),
      labelLine2: '',
      statusText: isRunning ? t('EN COURS ●', 'IN PROGRESS ●') : t('Prêt ●', 'Ready ●'),
      statusColor: isRunning ? '#FF9B3D' : '#34C759',
      statusDotColor: isRunning ? '#FF9B3D' : '#34C759',
      textColor: 'white',
    },
  }

  return configs[themeId] ?? configs.quantum
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function PunchButton({ isRunning, isOnBreak, onPunch }: PunchButtonProps) {
  const { themeId } = useThemeStore()
  const { lang } = useLangStore()
  const isFr = lang === 'fr'
  const cfg = getConfig(themeId, isRunning, isFr)
  const isDeco = themeId === 'deco'

  return (
    <div
      className={cfg.wrapperClass}
      style={cfg.wrapperClass ? undefined : { ...cfg.wrapperStyle, margin: '0 0 8px' }}
    >
      {/* Couches décoratives (rayons, patterns, etc.) */}
      {cfg.decorLayers}

      {/* Contenu centré */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16,
      }}>

        {/* Bouton principal */}
        <button
          onClick={onPunch}
          disabled={isOnBreak}
          className={cfg.buttonClass}
          style={{
            ...cfg.buttonStyle,
            opacity: isOnBreak ? 0.45 : 1,
          }}
        >
          {/* Icône */}
          {cfg.icon}

          {/* Label ligne 1 */}
          <span style={{
            fontSize: isDeco ? 14 : 13,
            fontWeight: 900,
            letterSpacing: isDeco ? '0.14em' : '0.06em',
            textAlign: 'center',
            lineHeight: 1.15,
            color: cfg.textColor,
            textTransform: 'uppercase',
            maxWidth: 140,
          }}>
            {cfg.labelLine1}
          </span>

          {/* Label ligne 2 */}
          {cfg.labelLine2 && (
            <span style={{
              fontSize: isDeco ? 13 : 11,
              fontWeight: isDeco ? 900 : 600,
              color: isDeco
                ? 'rgba(10,10,6,0.65)'
                : `${cfg.textColor}BB`,
              letterSpacing: isDeco ? '0.18em' : '0.04em',
              textTransform: 'uppercase',
            }}>
              {cfg.labelLine2}
            </span>
          )}
        </button>

        {/* Indicateur de statut */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: isDeco ? 'rgba(214,178,94,0.08)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isDeco ? 'rgba(214,178,94,0.25)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 999, padding: '6px 18px',
        }}>
          <div
            className={isDeco ? 'deco-status-dot' : ''}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: cfg.statusDotColor,
              boxShadow: `0 0 8px ${cfg.statusDotColor}`,
            }}
          />
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: cfg.statusColor,
            letterSpacing: isDeco ? '0.12em' : '0.05em',
            textTransform: isDeco ? 'uppercase' : 'none',
          }}>
            {cfg.statusText}
          </span>
        </div>

        {/* Message pause */}
        {isOnBreak && (
          <div style={{
            background: 'rgba(249,115,22,0.14)',
            border: '1px solid rgba(249,115,22,0.35)',
            borderRadius: 12, padding: '8px 18px',
          }}>
            <p style={{
              color: '#F97316', fontSize: 13, fontWeight: 700,
              margin: 0, textAlign: 'center',
            }}>
              ☕ {isFr ? "En pause — reprenez d'abord" : 'On break — resume first'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
