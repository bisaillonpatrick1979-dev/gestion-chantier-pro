// src/lib/themes.ts
// 6 thèmes premium — avec effets lumineux animés sur bordures et gravures

export interface Theme {
  id: string
  name: string
  nameFr: string
  emoji: string
  colors: {
    background: string
    surface: string
    card: string
    cardAlt: string
    border: string
    borderStrong: string
    text: string
    textMuted: string
    textWeak: string
    primary: string
    primaryLight: string
    secondary: string
    secondaryLight: string
    glow1: string
    glow2: string
    success: string
    warning: string
    danger: string
    info: string
    navBackground: string
    navBorder: string
    navActive: string
    navInactive: string
  }
  globalCSS?: string
}

// ─── 1. QUANTUM GLASS ────────────────────────────────────────────────────────
const quantumGlass: Theme = {
  id: 'quantum',
  name: 'Quantum Glass',
  nameFr: 'Quantum Glass',
  emoji: '🔵',
  colors: {
    background: '#050B18',
    surface: '#071226',
    card: 'rgba(10,22,48,0.85)',
    cardAlt: 'rgba(15,30,64,0.70)',
    border: 'rgba(60,130,255,0.30)',
    borderStrong: 'rgba(60,130,255,0.65)',
    text: '#F3F7FF',
    textMuted: '#AAB8D4',
    textWeak: '#6F7C99',
    primary: '#2F80FF',
    primaryLight: '#38D9FF',
    secondary: '#7B61FF',
    secondaryLight: '#9B8FFF',
    glow1: 'rgba(47,128,255,0.50)',
    glow2: 'rgba(123,97,255,0.28)',
    success: '#30D979',
    warning: '#FFB020',
    danger: '#EF4444',
    info: '#38D9FF',
    navBackground: 'rgba(5,11,24,0.97)',
    navBorder: 'rgba(47,128,255,0.25)',
    navActive: '#2F80FF',
    navInactive: '#6F7C99',
  },
  globalCSS: `
    body{background:linear-gradient(160deg,#050B18 0%,#071226 55%,#0A1630 100%) !important;}

    /* ── ANIMATIONS QUANTUM ──────────────────────── */
    @keyframes quantumSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes quantumPulse {
      0%,100% { box-shadow: 0 0 0 1px rgba(47,128,255,0.35), 0 0 12px rgba(47,128,255,0.20), inset 0 0 20px rgba(47,128,255,0.04); }
      50%      { box-shadow: 0 0 0 1px rgba(56,217,255,0.55), 0 0 24px rgba(56,217,255,0.35), inset 0 0 30px rgba(56,217,255,0.08); }
    }
    @keyframes quantumNavGlow {
      0%,100% { filter: drop-shadow(0 0 3px rgba(47,128,255,0.50)); }
      50%      { filter: drop-shadow(0 0 8px rgba(56,217,255,0.90)); }
    }
    @keyframes quantumBorderTravel {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* ── REFLET QUI SE PROMÈNE SUR LES CARDS ─────── */
    /* Appliqué via pseudo-element sur toutes les cards */
    [style*="var(--card)"],
    [style*="background:\"var(--card)\""],
    div[style*="borderRadius:\"12px\""],
    div[style*="border-radius: 12px"] {
      position: relative;
    }

    /* Toutes les cards Quantum — bordure animée */
    .quantum-glass,
    [class*="card"] {
      background: rgba(10,22,48,0.82);
      border: 1px solid rgba(60,130,255,0.28);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      animation: quantumPulse 4s ease-in-out infinite;
    }

    /* ── REFLET LUMINEUX SUR BORDURES ────────────── */
    /* Card avec effet de lumière qui fait le tour */
    .quantum-card-glow {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      animation: quantumPulse 4s ease-in-out infinite;
    }
    .quantum-card-glow::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      padding: 1px;
      background: linear-gradient(
        115deg,
        transparent 0%,
        transparent 25%,
        rgba(56,217,255,0.80) 45%,
        rgba(47,128,255,0.90) 50%,
        rgba(56,217,255,0.80) 55%,
        transparent 75%,
        transparent 100%
      );
      background-size: 300% 300%;
      animation: quantumBorderTravel 3s linear infinite;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
    }

    /* ── TEXTE MÉTALLIQUE ────────────────────────── */
    .metal-text {
      color: #38D9FF;
      text-shadow: 0 0 20px rgba(56,217,255,0.5);
    }

    /* ── ICÔNES NAV ACTIVES — GLOW ANIMÉ ─────────── */
    .quantum-nav-active {
      color: #2F80FF !important;
      animation: quantumNavGlow 2s ease-in-out infinite;
    }

    /* ── GRAVURES / SÉPARATEURS LUMINEUX ─────────── */
    .quantum-engraving {
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(47,128,255,0.15) 20%,
        rgba(56,217,255,0.60) 50%,
        rgba(47,128,255,0.15) 80%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: quantumSweep 3s linear infinite;
      height: 1px;
    }

    .metal-text{color:#38D9FF;text-shadow:0 0 20px rgba(56,217,255,0.5);}
    .quantum-glass{background:rgba(10,22,48,0.82);border:1px solid rgba(60,130,255,0.28);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
    .quantum-punch-ring{box-shadow:0 0 0 3px rgba(47,128,255,0.45),0 0 40px rgba(47,128,255,0.35),0 0 100px rgba(47,128,255,0.18);}
  `,
}

// ─── 2. GAMIFICATION XP ──────────────────────────────────────────────────────
const gamificationXP: Theme = {
  id: 'xp',
  name: 'Gamification XP',
  nameFr: 'Gamification XP',
  emoji: '🎮',
  colors: {
    background: '#08051A',
    surface: '#100A2A',
    card: '#1B1245',
    cardAlt: 'rgba(35,22,90,0.80)',
    border: 'rgba(168,85,247,0.30)',
    borderStrong: 'rgba(168,85,247,0.65)',
    text: '#F5F3FF',
    textMuted: '#C4B5FD',
    textWeak: '#8B7BBF',
    primary: '#A855F7',
    primaryLight: '#22D3EE',
    secondary: '#FACC15',
    secondaryLight: '#FDE047',
    glow1: 'rgba(168,85,247,0.50)',
    glow2: 'rgba(34,211,238,0.30)',
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
    info: '#22D3EE',
    navBackground: '#08051A',
    navBorder: 'rgba(168,85,247,0.25)',
    navActive: '#A855F7',
    navInactive: '#8B7BBF',
  },
  globalCSS: `
    body{background:linear-gradient(160deg,#08051A 0%,#100A2A 60%,#17103A 100%) !important;}

    @keyframes xpSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes xpBorderTravel {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes xpNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.60)); }
      50%      { filter: drop-shadow(0 0 10px rgba(34,211,238,1.00)); }
    }
    @keyframes xpCardPulse {
      0%,100% { box-shadow: 0 0 0 1px rgba(168,85,247,0.30), 0 0 15px rgba(168,85,247,0.15); }
      50%      { box-shadow: 0 0 0 1px rgba(34,211,238,0.50), 0 0 30px rgba(34,211,238,0.25); }
    }

    .metal-text{color:#FACC15;text-shadow:0 0 20px rgba(250,204,21,0.5);}
    .xp-bar{background:linear-gradient(90deg,#A855F7,#22D3EE);border-radius:999px;}
    .xp-punch-glow{box-shadow:0 0 0 4px rgba(168,85,247,0.40),0 0 50px rgba(168,85,247,0.40),0 0 120px rgba(168,85,247,0.20);}
    .xp-badge{background:linear-gradient(135deg,rgba(168,85,247,0.25),rgba(34,211,238,0.15));border:1px solid rgba(168,85,247,0.45);border-radius:999px;}
    .xp-nav-active { animation: xpNavGlow 2s ease-in-out infinite; }
    .xp-card-glow  { animation: xpCardPulse 3s ease-in-out infinite; }
  `,
}

// ─── 3. AVENTURE CHANTIERS ───────────────────────────────────────────────────
const aventureChantiers: Theme = {
  id: 'aventure',
  name: 'Aventure Chantiers',
  nameFr: 'Aventure Chantiers',
  emoji: '🦺',
  colors: {
    background: '#1A1712',
    surface: '#2B2418',
    card: '#231D10',
    cardAlt: '#2E2515',
    border: 'rgba(255,159,28,0.30)',
    borderStrong: 'rgba(255,159,28,0.65)',
    text: '#FFF7E6',
    textMuted: '#E8D8B8',
    textWeak: '#9E8F70',
    primary: '#FF9F1C',
    primaryLight: '#FFD166',
    secondary: '#F97316',
    secondaryLight: '#FB923C',
    glow1: 'rgba(255,159,28,0.50)',
    glow2: 'rgba(249,115,22,0.28)',
    success: '#3BAA35',
    warning: '#FF9F1C',
    danger: '#EF233C',
    info: '#00A6FB',
    navBackground: '#12100A',
    navBorder: 'rgba(255,159,28,0.25)',
    navActive: '#FF9F1C',
    navInactive: '#9E8F70',
  },
  globalCSS: `
    body{background:#1A1712 !important;}

    @keyframes aventureSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes aventureNavGlow {
      0%,100% { filter: drop-shadow(0 0 3px rgba(255,159,28,0.50)); }
      50%      { filter: drop-shadow(0 0 9px rgba(255,209,102,0.90)); }
    }
    @keyframes aventureCardPulse {
      0%,100% { box-shadow: 0 0 0 1px rgba(255,159,28,0.25), 0 0 12px rgba(255,159,28,0.10); }
      50%      { box-shadow: 0 0 0 1px rgba(255,209,102,0.50), 0 0 25px rgba(255,209,102,0.20); }
    }

    .metal-text{color:#FFD166;text-shadow:0 0 16px rgba(255,209,102,0.5);}
    .adventure-card{background:#231D10;border:2px solid rgba(255,159,28,0.35);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.50),inset 0 1px 0 rgba(255,159,28,0.15);}
    .adventure-hazard{background:repeating-linear-gradient(-45deg,#FF9F1C 0px,#FF9F1C 10px,#1A1712 10px,#1A1712 20px);height:4px;opacity:0.6;}
    .adventure-punch{background:radial-gradient(circle at 40% 35%,#FFB020,#F97316 55%,#C85000);box-shadow:0 0 0 6px rgba(255,159,28,0.30),0 0 50px rgba(249,115,22,0.40),0 8px 30px rgba(0,0,0,0.60);}
    .aventure-nav-active { animation: aventureNavGlow 2s ease-in-out infinite; }
    .aventure-card-glow  { animation: aventureCardPulse 3.5s ease-in-out infinite; }
  `,
}

// ─── 4. ART DÉCO PRESTIGE ────────────────────────────────────────────────────
const artDecoPrestige: Theme = {
  id: 'deco',
  name: 'Art Déco Prestige',
  nameFr: 'Art Déco Prestige',
  emoji: '✨',
  colors: {
    background: '#050505',
    surface: '#0A0B0B',
    card: '#111109',
    cardAlt: '#181713',
    border: 'rgba(214,178,94,0.30)',
    borderStrong: 'rgba(214,178,94,0.70)',
    text: '#F4E8C1',
    textMuted: '#C8A96A',
    textWeak: '#8A7040',
    primary: '#D6B25E',
    primaryLight: '#F2D27A',
    secondary: '#A67C2D',
    secondaryLight: '#C49A3C',
    glow1: 'rgba(214,178,94,0.40)',
    glow2: 'rgba(214,178,94,0.15)',
    success: '#6FAF5A',
    warning: '#D6B25E',
    danger: '#A83A32',
    info: '#7A9EAD',
    navBackground: '#050505',
    navBorder: 'rgba(214,178,94,0.25)',
    navActive: '#D6B25E',
    navInactive: '#6B5830',
  },
  globalCSS: `
    body {
      background: #050505 !important;
      color: #F4E8C1 !important;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(214,178,94,0.04) 59px, rgba(214,178,94,0.04) 60px),
        repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(214,178,94,0.04) 59px, rgba(214,178,94,0.04) 60px);
    }

    /* ══════════════════════════════════════════════
       ANIMATIONS ART DÉCO
    ══════════════════════════════════════════════ */

    @keyframes decoGoldShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes decoGlow {
      0%,100% { box-shadow: 0 0 0 3px rgba(214,178,94,0.50), 0 0 0 7px rgba(214,178,94,0.18), 0 0 45px rgba(214,178,94,0.35), 0 8px 40px rgba(0,0,0,0.85); }
      50%      { box-shadow: 0 0 0 3px rgba(214,178,94,0.75), 0 0 0 9px rgba(214,178,94,0.25), 0 0 70px rgba(214,178,94,0.55), 0 8px 40px rgba(0,0,0,0.85); }
    }
    @keyframes decoGlowOut {
      0%,100% { box-shadow: 0 0 0 3px rgba(168,58,50,0.55), 0 0 0 7px rgba(168,58,50,0.18), 0 0 45px rgba(168,58,50,0.40), 0 8px 40px rgba(0,0,0,0.85); }
      50%      { box-shadow: 0 0 0 3px rgba(168,58,50,0.80), 0 0 0 9px rgba(168,58,50,0.25), 0 0 70px rgba(168,58,50,0.60), 0 8px 40px rgba(0,0,0,0.85); }
    }
    @keyframes decoRaysRotateSlow {
      from { transform: translate(-50%,-50%) rotate(0deg);   }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
    @keyframes decoRaysRotateReverse {
      from { transform: translate(-50%,-50%) rotate(0deg);    }
      to   { transform: translate(-50%,-50%) rotate(-360deg); }
    }
    @keyframes decoPress {
      0%  { transform: scale(1);    }
      40% { transform: scale(0.95); }
      100%{ transform: scale(1);    }
    }
    @keyframes decoFadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    @keyframes decoShimmerText {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes decoBorderPulse {
      0%,100% { opacity: 0.55; }
      50%      { opacity: 1.00; }
    }
    @keyframes decoStatusPulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.7; transform:scale(0.85); }
    }

    /* ══ REFLET DORÉ QUI FAIT LE TOUR DES CARDS ══
       Un trait lumineux qui se déplace en continu
       sur la bordure de chaque card.
    ══════════════════════════════════════════════ */
    @keyframes decoBorderSweep {
      0%   { background-position: 0%   0%;   }
      25%  { background-position: 100% 0%;   }
      50%  { background-position: 100% 100%; }
      75%  { background-position: 0%   100%; }
      100% { background-position: 0%   0%;   }
    }
    @keyframes decoEngraving {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes decoNavGlow {
      0%,100% {
        filter: drop-shadow(0 0 4px rgba(214,178,94,0.55))
                drop-shadow(0 0 2px rgba(214,178,94,0.35));
        color: #C8A96A;
      }
      50% {
        filter: drop-shadow(0 0 10px rgba(242,210,122,1.00))
                drop-shadow(0 0 4px rgba(214,178,94,0.80));
        color: #F2D27A;
      }
    }
    @keyframes decoNavActivePulse {
      0%,100% {
        filter: drop-shadow(0 0 6px rgba(214,178,94,0.80))
                drop-shadow(0 0 3px rgba(242,210,122,0.60));
        color: #D6B25E;
      }
      50% {
        filter: drop-shadow(0 0 14px rgba(242,210,122,1.00))
                drop-shadow(0 0 6px rgba(214,178,94,1.00));
        color: #FFE9A0;
      }
    }

    /* ── Bordure animée sur les cards ────────────── */
    .deco-card-sweep {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }
    .deco-card-sweep::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: conic-gradient(
        from var(--angle, 0deg),
        transparent 0deg,
        transparent 60deg,
        rgba(242,210,122,0.90) 90deg,
        rgba(255,233,160,1.00) 100deg,
        rgba(242,210,122,0.90) 110deg,
        transparent 140deg,
        transparent 360deg
      );
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: decoCardRotate 4s linear infinite;
    }
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes decoCardRotate {
      to { --angle: 360deg; }
    }

    /* ── Reflet sur gravures / séparateurs ───────── */
    .deco-engraving {
      position: relative;
      overflow: hidden;
      background: rgba(214,178,94,0.10);
      height: 1px;
    }
    .deco-engraving::after {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 40%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(242,210,122,0.80) 50%,
        transparent 100%
      );
      animation: decoEngraving 2.5s ease-in-out infinite;
    }

    /* ── Icônes nav inactives — reflet subtil ─────── */
    .deco-nav-inactive-glow {
      animation: decoNavGlow 3s ease-in-out infinite;
    }

    /* ── Icônes nav actives — glow fort ──────────── */
    .deco-nav-active {
      color: #D6B25E !important;
      animation: decoNavActivePulse 2.5s ease-in-out infinite;
    }

    /* ── TEXTE MÉTALLIQUE OR ─────────────────────── */
    .metal-text {
      background: linear-gradient(90deg,
        #7A5A1A 0%, #C49A3C 20%, #F2D27A 40%,
        #FFE9A0 50%, #F2D27A 60%, #C49A3C 80%, #7A5A1A 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: decoShimmerText 5s linear infinite;
    }

    /* ── MONTANTS $ DORÉS ────────────────────────── */
    .deco-amount {
      background: linear-gradient(90deg,
        #C49A3C 0%, #F2D27A 30%, #FFE9A0 50%, #F2D27A 70%, #C49A3C 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: decoShimmerText 3.5s linear infinite;
    }

    /* ── DIVISEUR ART DÉCO ───────────────────────── */
    .deco-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(214,178,94,0.60) 50%, transparent 100%);
      margin: 6px 0;
      position: relative;
      overflow: hidden;
    }
    .deco-divider::after {
      content: '';
      position: absolute;
      top: 0; left: -40%;
      width: 40%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,233,160,0.90), transparent);
      animation: decoEngraving 3s ease-in-out infinite;
    }
    .deco-divider-thick {
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, rgba(214,178,94,0.80) 50%, transparent 100%);
    }

    /* ── ÉTIQUETTE ───────────────────────────────── */
    .deco-label {
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 0.68rem;
      color: rgba(214,178,94,0.70);
      font-weight: 700;
    }

    /* ── FRAME AVEC COINS DORÉS ──────────────────── */
    .deco-frame {
      position: relative;
      border: 1px solid rgba(214,178,94,0.35);
      border-radius: 10px;
      animation: decoBorderPulse 4s ease-in-out infinite;
    }
    .deco-frame::before, .deco-frame::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      border-color: rgba(214,178,94,0.85);
      border-style: solid;
      pointer-events: none;
    }
    .deco-frame::before { top:-2px; left:-2px; border-width:2px 0 0 2px; border-radius:3px 0 0 0; }
    .deco-frame::after  { bottom:-2px; right:-2px; border-width:0 2px 2px 0; border-radius:0 0 3px 0; }

    /* ── CARTE ART DÉCO ──────────────────────────── */
    .deco-card {
      background: #111109;
      border: 1px solid rgba(214,178,94,0.28);
      border-radius: 10px;
      position: relative;
      animation: decoFadeUp 0.4s ease;
    }
    .deco-card::before, .deco-card::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      border-color: rgba(214,178,94,0.55);
      border-style: solid;
      pointer-events: none;
    }
    .deco-card::before { top:-1px; left:-1px; border-width:1.5px 0 0 1.5px; }
    .deco-card::after  { bottom:-1px; right:-1px; border-width:0 1.5px 1.5px 0; }

    /* ── WRAPPER DU BOUTON PUNCH ─────────────────── */
    .deco-punch-wrapper {
      position: relative;
      background: #0A0B0B;
      border: 1px solid rgba(214,178,94,0.40);
      border-radius: 12px;
      padding: 40px 16px;
      overflow: hidden;
      animation: decoFadeUp 0.5s ease;
    }
    .deco-punch-wrapper::before,
    .deco-punch-wrapper::after {
      content: '';
      position: absolute;
      width: 28px;
      height: 28px;
      border-color: rgba(214,178,94,0.75);
      border-style: solid;
      pointer-events: none;
      z-index: 10;
    }
    .deco-punch-wrapper::before { top:8px; left:8px; border-width:2px 0 0 2px; }
    .deco-punch-wrapper::after  { bottom:8px; right:8px; border-width:0 2px 2px 0; }

    /* ── RAYONS ART DÉCO ─────────────────────────── */
    .deco-rays-outer {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 480px;
      height: 480px;
      background: repeating-conic-gradient(
        rgba(214,178,94,0.07) 0deg 8deg,
        transparent 8deg 18deg
      );
      border-radius: 50%;
      pointer-events: none;
      animation: decoRaysRotateSlow 80s linear infinite;
    }
    .deco-rays-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 320px;
      height: 320px;
      background: repeating-conic-gradient(
        rgba(214,178,94,0.10) 0deg 5deg,
        transparent 5deg 10deg
      );
      border-radius: 50%;
      pointer-events: none;
      animation: decoRaysRotateReverse 40s linear infinite;
    }

    /* ── BOUTON PUNCH PRINCIPAL ──────────────────── */
    .deco-punch-btn {
      background: radial-gradient(
        circle at 38% 32%,
        #FFF0C0 0%,
        #F5DC90 15%,
        #D6B25E 40%,
        #B8922A 65%,
        #8C6A18 82%,
        #5C4010 100%
      ) !important;
      box-shadow:
        0 0 0 3px rgba(214,178,94,0.60),
        0 0 0 8px rgba(214,178,94,0.18),
        0 0 50px rgba(214,178,94,0.45),
        0 0 100px rgba(214,178,94,0.18),
        inset 0 2px 6px rgba(255,240,180,0.35),
        inset 0 -3px 8px rgba(0,0,0,0.40),
        0 10px 40px rgba(0,0,0,0.90) !important;
      animation: decoGlow 3s ease-in-out infinite;
      transition: transform 0.2s ease, filter 0.2s ease !important;
      cursor: pointer;
    }
    .deco-punch-btn:active {
      animation: decoPress 0.25s ease forwards, decoGlow 3s ease-in-out infinite;
      filter: brightness(1.15);
    }

    /* ── BOUTON PUNCH — SORTIE ───────────────────── */
    .deco-punch-btn-out {
      background: radial-gradient(
        circle at 38% 32%,
        #FF9090 0%,
        #D45050 20%,
        #A83A32 55%,
        #7B1D1D 100%
      ) !important;
      box-shadow:
        0 0 0 3px rgba(168,58,50,0.65),
        0 0 0 8px rgba(168,58,50,0.20),
        0 0 50px rgba(168,58,50,0.45),
        inset 0 2px 4px rgba(255,150,150,0.25),
        inset 0 -3px 8px rgba(0,0,0,0.40),
        0 10px 40px rgba(0,0,0,0.90) !important;
      animation: decoGlowOut 3s ease-in-out infinite;
    }

    /* ── BOUTONS SECONDAIRES ─────────────────────── */
    .deco-btn {
      background: transparent;
      border: 1px solid rgba(214,178,94,0.40);
      color: #D6B25E;
      border-radius: 8px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .deco-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(214,178,94,0.15) 50%,
        transparent 100%);
      transform: translateX(-100%);
      transition: transform 0.45s ease;
    }
    .deco-btn:active {
      background: rgba(214,178,94,0.12);
      border-color: rgba(214,178,94,0.70);
      box-shadow: 0 0 18px rgba(214,178,94,0.30);
      transform: scale(0.97);
    }
    .deco-btn:active::after {
      transform: translateX(100%);
    }

    /* ── PIN PAD ─────────────────────────────────── */
    .deco-pin-btn {
      background: #111109;
      border: 1px solid rgba(214,178,94,0.28);
      color: #F4E8C1;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      overflow: hidden;
    }
    .deco-pin-btn:active {
      background: rgba(214,178,94,0.14);
      border-color: rgba(214,178,94,0.70);
      box-shadow: 0 0 18px rgba(214,178,94,0.30), inset 0 0 12px rgba(214,178,94,0.08);
      transform: scale(0.93);
    }

    /* ── POINT DE STATUT ─────────────────────────── */
    .deco-status-dot {
      animation: decoStatusPulse 2s ease-in-out infinite;
    }

    /* ── NAVIGATION BAS ──────────────────────────── */
    .deco-nav-item {
      transition: all 0.18s ease;
    }
    .deco-nav-item:active {
      transform: scale(0.88);
    }

    /* ── CALENDRIER ──────────────────────────────── */
    .deco-cal-today {
      border: 2px solid rgba(214,178,94,0.80) !important;
      box-shadow: 0 0 14px rgba(214,178,94,0.35), inset 0 0 8px rgba(214,178,94,0.08);
    }
    .deco-cal-day:active {
      background: rgba(214,178,94,0.16) !important;
      border-color: rgba(214,178,94,0.65) !important;
      transform: scale(0.92);
      transition: all 0.12s ease;
    }

    /* ── TOGGLE FR/EN ────────────────────────────── */
    .deco-lang-toggle {
      background: #111109;
      border: 1px solid rgba(214,178,94,0.40);
      border-radius: 999px;
      padding: 3px;
      display: inline-flex;
    }
    .deco-lang-active {
      background: linear-gradient(135deg, #C49A3C, #D6B25E);
      border-radius: 999px;
      color: #0A0A08 !important;
      font-weight: 800 !important;
      box-shadow: 0 0 10px rgba(214,178,94,0.40);
    }
  `,
}

// ─── 5. ZEN ORGANIQUE ────────────────────────────────────────────────────────
const zenOrganique: Theme = {
  id: 'zen',
  name: 'Zen Organique',
  nameFr: 'Zen Organique',
  emoji: '🌿',
  colors: {
    background: '#F8F3EA',
    surface: '#FBF8F2',
    card: '#FFFDF8',
    cardAlt: '#F3ECE1',
    border: 'rgba(98,82,60,0.12)',
    borderStrong: 'rgba(200,95,61,0.40)',
    text: '#2E2B27',
    textMuted: '#5F5A52',
    textWeak: '#9A9288',
    primary: '#C85F3D',
    primaryLight: '#D97745',
    secondary: '#7A8B67',
    secondaryLight: '#A7B18A',
    glow1: 'rgba(200,95,61,0.30)',
    glow2: 'rgba(122,139,103,0.20)',
    success: '#6F8F5C',
    warning: '#C8A96A',
    danger: '#B85A4A',
    info: '#7A9EAD',
    navBackground: '#FFFDF8',
    navBorder: 'rgba(98,82,60,0.10)',
    navActive: '#C85F3D',
    navInactive: '#9A9288',
  },
  globalCSS: `
    body{background:#F8F3EA !important;color:#2E2B27 !important;}
    .metal-text{color:#C85F3D;font-weight:800;}
    .organic-bg{position:relative;overflow:hidden;}
    .organic-bg::before{content:'';position:absolute;width:280px;height:280px;border-radius:50% 40% 60% 30% / 40% 60% 40% 60%;background:rgba(200,95,61,0.07);top:-60px;left:-80px;pointer-events:none;}
    .organic-bg::after{content:'';position:absolute;width:220px;height:220px;border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;background:rgba(122,139,103,0.07);bottom:-40px;right:-60px;pointer-events:none;}
    .organic-punch{background:radial-gradient(circle at 40% 35%,#D97745,#C85F3D 55%,#A84A2A);box-shadow:0 18px 45px rgba(200,95,61,0.30),0 0 0 4px rgba(200,95,61,0.18);}
    .organic-card{background:#FFFDF8;border:1px solid rgba(98,82,60,0.12);border-radius:20px;box-shadow:0 8px 24px rgba(98,82,60,0.08);}
  `,
}

// ─── 6. LUDIQUE PREMIUM ──────────────────────────────────────────────────────
const ludiquePremium: Theme = {
  id: 'ludique',
  name: 'Ludique Premium',
  nameFr: 'Ludique Premium',
  emoji: '🏗️',
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardAlt: '#F0F4F8',
    border: 'rgba(15,23,42,0.08)',
    borderStrong: 'rgba(255,122,26,0.45)',
    text: '#102027',
    textMuted: '#5F6B73',
    textWeak: '#A0ADB5',
    primary: '#FF7A1A',
    primaryLight: '#FF9B3D',
    secondary: '#003B3D',
    secondaryLight: '#0A5254',
    glow1: 'rgba(255,122,26,0.35)',
    glow2: 'rgba(255,122,26,0.15)',
    success: '#34C759',
    warning: '#FF9B3D',
    danger: '#FF3B30',
    info: '#007AFF',
    navBackground: '#063B3A',
    navBorder: 'rgba(255,122,26,0.20)',
    navActive: '#FF7A1A',
    navInactive: 'rgba(255,255,255,0.45)',
  },
  globalCSS: `
    body{background:#F5F7FA !important;color:#102027 !important;}
    .metal-text{color:#FF7A1A;font-weight:900;}
    .ludique-header{background:linear-gradient(135deg,#003B3D,#063B3A);color:#FFFFFF;}
    .ludique-punch{background:radial-gradient(circle at 40% 35%,#FF9B3D,#FF7A1A 55%,#E05E00);box-shadow:0 0 0 5px rgba(255,122,26,0.25),0 0 50px rgba(255,122,26,0.35),0 12px 30px rgba(15,23,42,0.25);}
    .ludique-card{background:#FFFFFF;border:1px solid rgba(15,23,42,0.08);border-radius:20px;box-shadow:0 12px 30px rgba(15,23,42,0.10);}
    .ludique-hero{background:linear-gradient(135deg,#003B3D 0%,#0A5254 50%,#063B3A 100%);border-radius:20px;overflow:hidden;}
    .ludique-ready{background:rgba(52,199,89,0.15);border:1px solid rgba(52,199,89,0.40);color:#34C759;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;}
  `,
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const THEMES: Record<string, Theme> = {
  quantum: quantumGlass,
  xp:      gamificationXP,
  aventure: aventureChantiers,
  deco:    artDecoPrestige,
  zen:     zenOrganique,
  ludique: ludiquePremium,
}

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES.quantum
}

export function getAllThemes(): Theme[] {
  return Object.values(THEMES)
}

export const THEME_IDS = Object.keys(THEMES)
export const DEFAULT_THEME_ID = 'quantum'
