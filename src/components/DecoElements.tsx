'use client'

// ─── Composant de gravures Art Déco luxueux ───────────────────────────────────
// Utilise var(--primary) pour s'adapter à tous les thèmes
// Les classes deco-separator-svg / deco-flower-svg / deco-ornament-svg
// sont animées via le globalCSS du thème Déco (ThemeInjector)

// ── 1. Séparateur avec diamant central ────────────────────────────────────────
export function DecoSeparator({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <svg
      className="deco-separator-svg"
      viewBox="0 0 320 24"
      fill="none"
      style={{ width: '100%', opacity, pointerEvents: 'none', display: 'block' }}
    >
      <line x1="0" y1="12" x2="110" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="210" y1="12" x2="320" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="100" y1="12" x2="108" y2="4" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="108" y1="4" x2="116" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="116" y1="12" x2="124" y2="20" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="124" y1="20" x2="132" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      {/* Diamant central */}
      <polygon points="160,2 174,12 160,22 146,12" stroke="var(--primary)" strokeWidth="1" fill="none"/>
      <polygon points="160,6 170,12 160,18 150,12" fill="var(--primary)" opacity="0.3"/>
      <circle cx="160" cy="12" r="2" fill="var(--primary)" opacity="0.6"/>
      {/* Miroir droite */}
      <line x1="220" y1="12" x2="212" y2="4" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="212" y1="4" x2="204" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="204" y1="12" x2="196" y2="20" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="196" y1="20" x2="188" y2="12" stroke="var(--primary)" strokeWidth="0.8"/>
      {/* Points décoratifs */}
      <circle cx="60" cy="12" r="1.5" fill="var(--primary)" opacity="0.5"/>
      <circle cx="260" cy="12" r="1.5" fill="var(--primary)" opacity="0.5"/>
      <circle cx="30" cy="12" r="1" fill="var(--primary)" opacity="0.3"/>
      <circle cx="290" cy="12" r="1" fill="var(--primary)" opacity="0.3"/>
    </svg>
  )
}

// ── 2. Fleur géométrique centrale ─────────────────────────────────────────────
export function DecoFlower({ size = 60, opacity = 0.2 }: { size?: number; opacity?: number }) {
  return (
    <svg
      className="deco-flower-svg"
      viewBox="0 0 100 100"
      fill="none"
      style={{ width: size, height: size, opacity, pointerEvents: 'none', display: 'block' }}
    >
      {/* Pétales */}
      <ellipse cx="50" cy="28" rx="6" ry="22" stroke="var(--primary)" strokeWidth="0.8" fill="none"/>
      <ellipse cx="50" cy="28" rx="6" ry="22" stroke="var(--primary)" strokeWidth="0.8" fill="none" transform="rotate(45 50 50)"/>
      <ellipse cx="50" cy="28" rx="6" ry="22" stroke="var(--primary)" strokeWidth="0.8" fill="none" transform="rotate(90 50 50)"/>
      <ellipse cx="50" cy="28" rx="6" ry="22" stroke="var(--primary)" strokeWidth="0.8" fill="none" transform="rotate(135 50 50)"/>
      {/* Cercles */}
      <circle cx="50" cy="50" r="20" stroke="var(--primary)" strokeWidth="0.6" fill="none" strokeDasharray="2 3"/>
      <circle cx="50" cy="50" r="12" stroke="var(--primary)" strokeWidth="0.8" fill="none"/>
      <circle cx="50" cy="50" r="5" fill="var(--primary)" opacity="0.4"/>
      <circle cx="50" cy="50" r="2" fill="var(--primary)" opacity="0.8"/>
      {/* Petits diamants sur le cercle */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 50 + 20 * Math.cos(rad)
        const y = 50 + 20 * Math.sin(rad)
        return <circle key={i} cx={x} cy={y} r="1.5" fill="var(--primary)" opacity="0.5"/>
      })}
    </svg>
  )
}

// ── 3. Panneau vide luxueux (remplace les espaces vides) ──────────────────────
export function DecoEmptyPanel({ message, subtext }: { message?: string; subtext?: string }) {
  return (
    <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <DecoSeparator opacity={0.25} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.3 }}>
        <DecoFlower size={40} opacity={1}/>
        <svg className="deco-ornament-svg" viewBox="0 0 60 60" fill="none" style={{ width: 50, height: 50 }}>
          <polygon points="30,2 38,22 58,22 42,34 48,54 30,42 12,54 18,34 2,22 22,22" stroke="var(--primary)" strokeWidth="1" fill="none"/>
          <polygon points="30,10 35,24 50,24 39,32 43,46 30,38 17,46 21,32 10,24 25,24" fill="var(--primary)" opacity="0.2"/>
          <circle cx="30" cy="30" r="5" fill="var(--primary)" opacity="0.4"/>
        </svg>
        <DecoFlower size={40} opacity={1}/>
      </div>

      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          {message}
        </p>
      )}
      {subtext && (
        <p style={{ color: 'var(--text-weak)', fontSize: '12px', textAlign: 'center' }}>
          {subtext}
        </p>
      )}

      <DecoSeparator opacity={0.25} />
    </div>
  )
}

// ── 4. Coins Art Déco pour les cartes ─────────────────────────────────────────
export function DecoCorners({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <>
      <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderTop: '1.5px solid var(--primary)', borderLeft: '1.5px solid var(--primary)', opacity, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderTop: '1.5px solid var(--primary)', borderRight: '1.5px solid var(--primary)', opacity, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: 6, left: 6, width: 18, height: 18, borderBottom: '1.5px solid var(--primary)', borderLeft: '1.5px solid var(--primary)', opacity, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: 6, right: 6, width: 18, height: 18, borderBottom: '1.5px solid var(--primary)', borderRight: '1.5px solid var(--primary)', opacity, pointerEvents: 'none' }}/>
    </>
  )
}

// ── 5. Bandeau titre luxueux ───────────────────────────────────────────────────
export function DecoTitle({ children, opacity = 0.35 }: { children: React.ReactNode; opacity?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, var(--primary))`, opacity }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg className="deco-star-item" viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10, opacity }}>
          <polygon points="6,0 8,4 12,4 9,7 10,11 6,9 2,11 3,7 0,4 4,4" fill="var(--primary)"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {children}
        </span>
        <svg className="deco-star-item" viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10, opacity }}>
          <polygon points="6,0 8,4 12,4 9,7 10,11 6,9 2,11 3,7 0,4 4,4" fill="var(--primary)"/>
        </svg>
      </div>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, var(--primary), transparent)`, opacity }}/>
    </div>
  )
}

// ── 6. Motif de fond répété (pour grandes zones vides) ────────────────────────
export function DecoBackground({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.04, ...style }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="decoPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <polygon points="30,5 45,30 30,55 15,30" stroke="var(--primary)" strokeWidth="0.8" fill="none"/>
            <line x1="30" y1="0" x2="30" y2="60" stroke="var(--primary)" strokeWidth="0.3"/>
            <line x1="0" y1="30" x2="60" y2="30" stroke="var(--primary)" strokeWidth="0.3"/>
            <circle cx="30" cy="30" r="2" fill="var(--primary)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#decoPattern)"/>
      </svg>
    </div>
  )
}

// ── 7. Bordure lumineuse animée ────────────────────────────────────────────────
export function DecoBorderCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', ...style }}>
      <DecoBackground />
      <DecoCorners opacity={0.3}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

// ── 8. Étoile filante ─────────────────────────────────────────────────────────
export function DecoStarRow({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '8px 0', opacity: 0.25 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="deco-star-item"
          viewBox="0 0 20 20"
          fill="none"
          style={{ width: i === Math.floor(count/2) ? 20 : 14, height: i === Math.floor(count/2) ? 20 : 14 }}
        >
          <polygon
            points="10,1 12.5,7 19,7 14,11 16,18 10,14 4,18 6,11 1,7 7.5,7"
            stroke="var(--primary)"
            strokeWidth={i === Math.floor(count/2) ? "1.2" : "0.8"}
            fill={i === Math.floor(count/2) ? "var(--primary)" : "none"}
            opacity={i === Math.floor(count/2) ? "0.6" : "1"}
          />
        </svg>
      ))}
    </div>
  )
}

// ── 9. Ornement complet pour grande zone vide ─────────────────────────────────
export function DecoOrnament({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg
      className="deco-ornament-svg"
      viewBox="0 0 320 120"
      fill="none"
      style={{ width: '100%', maxWidth: 320, opacity, display: 'block', margin: '0 auto' }}
    >
      {/* Lignes horizontales */}
      <line x1="0" y1="60" x2="90" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="230" y1="60" x2="320" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      {/* Motif gauche */}
      <line x1="80" y1="60" x2="90" y2="50" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="90" y1="50" x2="100" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="100" y1="60" x2="90" y2="70" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="90" y1="70" x2="80" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      {/* Motif droit */}
      <line x1="240" y1="60" x2="230" y2="50" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="230" y1="50" x2="220" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="220" y1="60" x2="230" y2="70" stroke="var(--primary)" strokeWidth="0.8"/>
      <line x1="230" y1="70" x2="240" y2="60" stroke="var(--primary)" strokeWidth="0.8"/>
      {/* Fleur centrale */}
      <circle cx="160" cy="60" r="30" stroke="var(--primary)" strokeWidth="0.6" strokeDasharray="2 4"/>
      <circle cx="160" cy="60" r="20" stroke="var(--primary)" strokeWidth="0.8"/>
      <circle cx="160" cy="60" r="10" stroke="var(--primary)" strokeWidth="1"/>
      <circle cx="160" cy="60" r="4" fill="var(--primary)" opacity="0.4"/>
      {/* Pétales */}
      <ellipse cx="160" cy="40" rx="4" ry="18" stroke="var(--primary)" strokeWidth="0.6" fill="none"/>
      <ellipse cx="160" cy="40" rx="4" ry="18" stroke="var(--primary)" strokeWidth="0.6" fill="none" transform="rotate(45 160 60)"/>
      <ellipse cx="160" cy="40" rx="4" ry="18" stroke="var(--primary)" strokeWidth="0.6" fill="none" transform="rotate(90 160 60)"/>
      <ellipse cx="160" cy="40" rx="4" ry="18" stroke="var(--primary)" strokeWidth="0.6" fill="none" transform="rotate(135 160 60)"/>
      {/* Points cardinaux */}
      <circle cx="160" cy="30" r="2.5" fill="var(--primary)" opacity="0.5"/>
      <circle cx="160" cy="90" r="2.5" fill="var(--primary)" opacity="0.5"/>
      <circle cx="130" cy="60" r="2.5" fill="var(--primary)" opacity="0.5"/>
      <circle cx="190" cy="60" r="2.5" fill="var(--primary)" opacity="0.5"/>
      {/* Lignes diagonales décoratives */}
      <line x1="40" y1="30" x2="50" y2="40" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="50" y1="30" x2="40" y2="40" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="270" y1="30" x2="280" y2="40" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="280" y1="30" x2="270" y2="40" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="40" y1="80" x2="50" y2="90" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="50" y1="80" x2="40" y2="90" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="270" y1="80" x2="280" y2="90" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      <line x1="280" y1="80" x2="270" y2="90" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6"/>
      {/* Petits losanges sur les lignes */}
      <polygon points="30,60 35,55 40,60 35,65" stroke="var(--primary)" strokeWidth="0.8" fill="none"/>
      <polygon points="280,60 285,55 290,60 285,65" stroke="var(--primary)" strokeWidth="0.8" fill="none"/>
      {/* Ligne déco haute et basse */}
      <line x1="60" y1="20" x2="260" y2="20" stroke="var(--primary)" strokeWidth="0.4" opacity="0.4"/>
      <line x1="60" y1="100" x2="260" y2="100" stroke="var(--primary)" strokeWidth="0.4" opacity="0.4"/>
    </svg>
  )
}

// ── 10. Petit losange répété horizontal ───────────────────────────────────────
export function DecoDiamondRow({ count = 7, opacity = 0.2 }: { count?: number; opacity?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '6px 0', opacity }}>
      {Array.from({ length: count }).map((_, i) => {
        const isCenter = i === Math.floor(count / 2)
        return (
          <svg key={i} className="deco-star-item" viewBox="0 0 16 16" fill="none" style={{ width: isCenter ? 16 : 10, height: isCenter ? 16 : 10 }}>
            <polygon
              points="8,0 16,8 8,16 0,8"
              stroke="var(--primary)"
              strokeWidth={isCenter ? "1.5" : "1"}
              fill={isCenter ? "var(--primary)" : "none"}
              opacity={isCenter ? "0.5" : "1"}
            />
            {isCenter && <circle cx="8" cy="8" r="2" fill="var(--primary)" opacity="0.8"/>}
          </svg>
        )
      })}
    </div>
  )
}
