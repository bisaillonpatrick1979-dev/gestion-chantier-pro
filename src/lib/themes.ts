// src/lib/themes.ts
// 6 thèmes ultra-premium — effets lumineux, glassmorphism, reflets, gravures animées

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
  emoji: '⚡',
  colors: {
    background: '#020818',
    surface: '#040E26',
    card: 'rgba(6,16,40,0.90)',
    cardAlt: 'rgba(10,24,56,0.75)',
    border: 'rgba(56,130,255,0.28)',
    borderStrong: 'rgba(56,217,255,0.70)',
    text: '#E8F4FF',
    textMuted: '#8AAFD4',
    textWeak: '#4A6080',
    primary: '#2B7FFF',
    primaryLight: '#38D9FF',
    secondary: '#7B61FF',
    secondaryLight: '#A78BFF',
    glow1: 'rgba(43,127,255,0.55)',
    glow2: 'rgba(123,97,255,0.30)',
    success: '#00E676',
    warning: '#FFB020',
    danger: '#FF4458',
    info: '#38D9FF',
    navBackground: 'rgba(2,8,24,0.98)',
    navBorder: 'rgba(43,127,255,0.20)',
    navActive: '#2B7FFF',
    navInactive: '#4A6080',
  },
  globalCSS: `
    body {
      background: radial-gradient(ellipse at 20% 20%, #0A1E4A 0%, #020818 40%, #030C22 100%) !important;
      background-attachment: fixed !important;
    }

    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes quantumBorderRotate { to { --angle: 360deg; } }
    @keyframes quantumPulse {
      0%,100% { box-shadow: 0 0 0 1px rgba(43,127,255,0.30), 0 0 20px rgba(43,127,255,0.15), 0 0 60px rgba(43,127,255,0.05), inset 0 1px 0 rgba(56,217,255,0.08); }
      50%      { box-shadow: 0 0 0 1px rgba(56,217,255,0.60), 0 0 35px rgba(56,217,255,0.30), 0 0 80px rgba(56,217,255,0.10), inset 0 1px 0 rgba(56,217,255,0.15); }
    }
    @keyframes quantumSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes quantumNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(43,127,255,0.60)); }
      50%      { filter: drop-shadow(0 0 10px rgba(56,217,255,1.00)); }
    }
    @keyframes quantumFloat {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-3px); }
    }
    @keyframes quantumShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes quantumParticle {
      0%   { opacity: 0; transform: translateY(0px) scale(0); }
      20%  { opacity: 1; transform: translateY(-8px) scale(1); }
      100% { opacity: 0; transform: translateY(-30px) scale(0.3); }
    }

    .quantum-card-glow {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: quantumPulse 4s ease-in-out infinite;
    }
    .quantum-card-glow::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: conic-gradient(
        from var(--angle, 0deg),
        transparent 0deg,
        transparent 50deg,
        rgba(56,217,255,0.90) 80deg,
        rgba(43,127,255,1.00) 100deg,
        rgba(123,97,255,0.90) 120deg,
        transparent 150deg,
        transparent 360deg
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: quantumBorderRotate 3s linear infinite;
    }
    .quantum-card-glow::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(56,217,255,0.60), rgba(43,127,255,0.80), transparent);
      pointer-events: none;
    }

    .metal-text {
      background: linear-gradient(90deg, #2B7FFF 0%, #38D9FF 30%, #A78BFF 50%, #38D9FF 70%, #2B7FFF 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: quantumShimmer 4s linear infinite;
    }

    .quantum-nav-active { animation: quantumNavGlow 2s ease-in-out infinite; }

    .quantum-engraving {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(43,127,255,0.15), rgba(56,217,255,0.70), rgba(43,127,255,0.15), transparent);
      background-size: 200% 100%;
      animation: quantumSweep 2.5s linear infinite;
      position: relative;
    }
    .quantum-engraving::after {
      content: '';
      position: absolute;
      inset: 0;
      background: inherit;
      filter: blur(2px);
      opacity: 0.5;
    }
    .quantum-punch-ring {
      box-shadow: 0 0 0 3px rgba(43,127,255,0.45), 0 0 40px rgba(43,127,255,0.35), 0 0 100px rgba(43,127,255,0.18);
    }
  `,
}

// ─── 2. GAMIFICATION XP ──────────────────────────────────────────────────────
const gamificationXP: Theme = {
  id: 'xp',
  name: 'Gamification XP',
  nameFr: 'Gamification XP',
  emoji: '🎮',
  colors: {
    background: '#060318',
    surface: '#0E0828',
    card: 'rgba(20,10,52,0.92)',
    cardAlt: 'rgba(30,18,70,0.85)',
    border: 'rgba(168,85,247,0.28)',
    borderStrong: 'rgba(168,85,247,0.70)',
    text: '#F5F0FF',
    textMuted: '#C4B5FD',
    textWeak: '#7C6FAF',
    primary: '#A855F7',
    primaryLight: '#22D3EE',
    secondary: '#FACC15',
    secondaryLight: '#FDE047',
    glow1: 'rgba(168,85,247,0.55)',
    glow2: 'rgba(34,211,238,0.30)',
    success: '#22C55E',
    warning: '#F97316',
    danger: '#EF4444',
    info: '#22D3EE',
    navBackground: 'rgba(6,3,24,0.98)',
    navBorder: 'rgba(168,85,247,0.20)',
    navActive: '#A855F7',
    navInactive: '#7C6FAF',
  },
  globalCSS: `
    body {
      background: radial-gradient(ellipse at 30% 10%, #1A0840 0%, #060318 45%, #0A0520 100%) !important;
      background-attachment: fixed !important;
    }

    @property --xp-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes xpBorderRotate { to { --xp-angle: 360deg; } }
    @keyframes xpCardPulse {
      0%,100% { box-shadow: 0 0 0 1px rgba(168,85,247,0.28), 0 0 20px rgba(168,85,247,0.12), inset 0 1px 0 rgba(168,85,247,0.10); }
      50%      { box-shadow: 0 0 0 1px rgba(34,211,238,0.55), 0 0 35px rgba(34,211,238,0.25), inset 0 1px 0 rgba(34,211,238,0.15); }
    }
    @keyframes xpNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.65)); }
      50%      { filter: drop-shadow(0 0 12px rgba(34,211,238,1.00)); }
    }
    @keyframes xpShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes xpSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes xpStarBurst {
      0%   { transform: scale(0) rotate(0deg); opacity: 1; }
      100% { transform: scale(2) rotate(180deg); opacity: 0; }
    }

    .xp-card-glow {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      animation: xpCardPulse 3.5s ease-in-out infinite;
    }
    .xp-card-glow::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: conic-gradient(
        from var(--xp-angle, 0deg),
        transparent 0deg,
        transparent 40deg,
        rgba(168,85,247,0.90) 70deg,
        rgba(34,211,238,1.00) 100deg,
        rgba(250,204,21,0.80) 120deg,
        rgba(168,85,247,0.90) 140deg,
        transparent 170deg,
        transparent 360deg
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: xpBorderRotate 2.5s linear infinite;
    }
    .xp-card-glow::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(168,85,247,0.60), rgba(34,211,238,0.80), transparent);
      pointer-events: none;
    }

    .metal-text {
      background: linear-gradient(90deg, #A855F7 0%, #22D3EE 25%, #FACC15 50%, #22D3EE 75%, #A855F7 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: xpShimmer 3s linear infinite;
    }

    .xp-bar {
      background: linear-gradient(90deg, #A855F7, #22D3EE);
      border-radius: 999px;
      position: relative;
      overflow: hidden;
    }
    .xp-bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.30) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: xpSweep 2s linear infinite;
    }

    .xp-badge {
      background: linear-gradient(135deg, rgba(168,85,247,0.25), rgba(34,211,238,0.15));
      border: 1px solid rgba(168,85,247,0.45);
      border-radius: 999px;
    }
    .xp-nav-active { animation: xpNavGlow 2s ease-in-out infinite; }
    .xp-punch-glow {
      box-shadow: 0 0 0 4px rgba(168,85,247,0.40), 0 0 50px rgba(168,85,247,0.40), 0 0 120px rgba(168,85,247,0.20);
    }
  `,
}

// ─── 3. ART DÉCO PRESTIGE ────────────────────────────────────────────────────
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

    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes decoCardRotate { to { --angle: 360deg; } }
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
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(360deg); }
    }
    @keyframes decoRaysRotateReverse {
      from { transform: translate(-50%,-50%) rotate(0deg); }
      to   { transform: translate(-50%,-50%) rotate(-360deg); }
    }
    @keyframes decoPress {
      0%  { transform: scale(1); }
      40% { transform: scale(0.95); }
      100%{ transform: scale(1); }
    }
    @keyframes decoFadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
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
    @keyframes decoEngraving {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes decoNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(214,178,94,0.55)) drop-shadow(0 0 2px rgba(214,178,94,0.35)); color: #C8A96A; }
      50%      { filter: drop-shadow(0 0 10px rgba(242,210,122,1.00)) drop-shadow(0 0 4px rgba(214,178,94,0.80)); color: #F2D27A; }
    }
    @keyframes decoNavActivePulse {
      0%,100% { filter: drop-shadow(0 0 6px rgba(214,178,94,0.80)) drop-shadow(0 0 3px rgba(242,210,122,0.60)); color: #D6B25E; }
      50%      { filter: drop-shadow(0 0 14px rgba(242,210,122,1.00)) drop-shadow(0 0 6px rgba(214,178,94,1.00)); color: #FFE9A0; }
    }
    @keyframes decoPunchWrapperGlow {
      0%,100% { border-color: rgba(214,178,94,0.35); box-shadow: 0 0 0px transparent, inset 0 0 0px transparent; }
      50%      { border-color: rgba(242,210,122,0.90); box-shadow: 0 0 22px rgba(214,178,94,0.40), 0 0 50px rgba(214,178,94,0.18), inset 0 0 18px rgba(214,178,94,0.06); }
    }
    @keyframes decoSepGlow {
      0%,100% { filter: brightness(0.50); opacity: 0.25; }
      50%      { filter: brightness(2.00) drop-shadow(0 0 10px rgba(214,178,94,0.90)); opacity: 0.70; }
    }
    @keyframes decoFlowerGlow {
      0%,100% { filter: brightness(0.45) drop-shadow(0 0 0px transparent); }
      50%      { filter: brightness(1.80) drop-shadow(0 0 10px rgba(214,178,94,0.70)); }
    }
    @keyframes decoOrnamentGlow {
      0%,100% { filter: brightness(0.40); opacity: 0.10; }
      50%      { filter: brightness(1.70) drop-shadow(0 0 14px rgba(214,178,94,0.60)); opacity: 0.26; }
    }
    @keyframes decoStarTwinkle {
      0%,100% { filter: brightness(0.45); opacity: 0.30; }
      50%      { filter: brightness(2.00) drop-shadow(0 0 6px rgba(214,178,94,0.80)); opacity: 0.90; }
    }

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
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: decoCardRotate 4s linear infinite;
    }

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
      background: linear-gradient(90deg, transparent 0%, rgba(242,210,122,0.80) 50%, transparent 100%);
      animation: decoEngraving 2.5s ease-in-out infinite;
    }

    .deco-nav-inactive-glow { animation: decoNavGlow 3s ease-in-out infinite; }
    .deco-nav-active { color: #D6B25E !important; animation: decoNavActivePulse 2.5s ease-in-out infinite; }

    .metal-text {
      background: linear-gradient(90deg, #7A5A1A 0%, #C49A3C 20%, #F2D27A 40%, #FFE9A0 50%, #F2D27A 60%, #C49A3C 80%, #7A5A1A 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: decoShimmerText 5s linear infinite;
    }

    .deco-amount {
      background: linear-gradient(90deg, #C49A3C 0%, #F2D27A 30%, #FFE9A0 50%, #F2D27A 70%, #C49A3C 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: decoShimmerText 3.5s linear infinite;
    }

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

    .deco-frame {
      position: relative;
      border: 1px solid rgba(214,178,94,0.35);
      border-radius: 10px;
      animation: decoBorderPulse 4s ease-in-out infinite;
    }

    .deco-punch-wrapper {
      position: relative;
      background: #0A0B0B;
      border: 1px solid rgba(214,178,94,0.40);
      border-radius: 12px;
      padding: 40px 16px;
      overflow: hidden;
      animation: decoFadeUp 0.5s ease, decoPunchWrapperGlow 3s ease-in-out 0.6s infinite;
    }
    .deco-punch-wrapper::before, .deco-punch-wrapper::after {
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

    .deco-rays-outer {
      position: absolute;
      top: 50%; left: 50%;
      width: 480px; height: 480px;
      background: repeating-conic-gradient(rgba(214,178,94,0.07) 0deg 8deg, transparent 8deg 18deg);
      border-radius: 50%;
      pointer-events: none;
      animation: decoRaysRotateSlow 80s linear infinite;
    }
    .deco-rays-inner {
      position: absolute;
      top: 50%; left: 50%;
      width: 320px; height: 320px;
      background: repeating-conic-gradient(rgba(214,178,94,0.10) 0deg 5deg, transparent 5deg 10deg);
      border-radius: 50%;
      pointer-events: none;
      animation: decoRaysRotateReverse 40s linear infinite;
    }

    .deco-punch-btn {
      background: radial-gradient(circle at 38% 32%, #FFF0C0 0%, #F5DC90 15%, #D6B25E 40%, #B8922A 65%, #8C6A18 82%, #5C4010 100%) !important;
      box-shadow: 0 0 0 3px rgba(214,178,94,0.60), 0 0 0 8px rgba(214,178,94,0.18), 0 0 50px rgba(214,178,94,0.45), 0 0 100px rgba(214,178,94,0.18), inset 0 2px 6px rgba(255,240,180,0.35), inset 0 -3px 8px rgba(0,0,0,0.40), 0 10px 40px rgba(0,0,0,0.90) !important;
      animation: decoGlow 3s ease-in-out infinite;
      cursor: pointer;
    }
    .deco-punch-btn-out {
      background: radial-gradient(circle at 38% 32%, #FF9090 0%, #D45050 20%, #A83A32 55%, #7B1D1D 100%) !important;
      box-shadow: 0 0 0 3px rgba(168,58,50,0.65), 0 0 0 8px rgba(168,58,50,0.20), 0 0 50px rgba(168,58,50,0.45), inset 0 2px 4px rgba(255,150,150,0.25), inset 0 -3px 8px rgba(0,0,0,0.40), 0 10px 40px rgba(0,0,0,0.90) !important;
      animation: decoGlowOut 3s ease-in-out infinite;
    }

    .deco-separator-svg { animation: decoSepGlow 3s ease-in-out infinite; }
    .deco-flower-svg    { animation: decoFlowerGlow 4s ease-in-out infinite; }
    .deco-ornament-svg  { animation: decoOrnamentGlow 6s ease-in-out infinite; }
    .deco-star-item     { animation: decoStarTwinkle 2.5s ease-in-out infinite; }
    .deco-star-item:nth-child(2) { animation-delay: 0.4s; }
    .deco-star-item:nth-child(3) { animation-delay: 0.8s; }
    .deco-star-item:nth-child(4) { animation-delay: 1.2s; }
    .deco-star-item:nth-child(5) { animation-delay: 1.6s; }
    .deco-status-dot    { animation: decoStatusPulse 2s ease-in-out infinite; }
  `,
}

// ─── 4. INFERNO ──────────────────────────────────────────────────────────────
const inferno: Theme = {
  id: 'inferno',
  name: 'Infernal',
  nameFr: 'Infernal',
  emoji: '🔥',
  colors: {
    background: '#0A0500',
    surface: 'transparent',
    card: 'transparent',
    cardAlt: 'transparent',
    border: 'rgba(255,100,20,0.28)',
    borderStrong: 'rgba(255,160,40,0.70)',
    text: '#FFF0E0',
    textMuted: '#D4956A',
    textWeak: '#7A4A2A',
    primary: '#FF6014',
    primaryLight: '#FF9040',
    secondary: '#FF3000',
    secondaryLight: '#FF6030',
    glow1: 'rgba(255,96,20,0.55)',
    glow2: 'rgba(255,48,0,0.30)',
    success: '#50C878',
    warning: '#FF9040',
    danger: '#FF2020',
    info: '#FF6014',
    navBackground: 'rgba(5,5,5,0.12)',
    navBorder: 'rgba(255,96,20,0.20)',
    navActive: '#FF6014',
    navInactive: '#7A4A2A',
  },
  globalCSS: `
    .inferno-card-glow {
      background: transparent !important;
      background-color: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid rgba(255, 110, 35, 0.42) !important;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.50), inset 0 0 0 1px rgba(255, 122, 20, 0.20) !important;
    }
    .inferno-nav-active { color: #ff7a14 !important; }
  `,
}

// ─── 5. ARCTIC ───────────────────────────────────────────────────────────────
const arctic: Theme = {
  id: 'arctic',
  name: 'Arctic',
  nameFr: 'Arctique',
  emoji: '🧊',
  colors: {
    background: '#010810',
    surface: '#020E1A',
    card: 'rgba(4,16,30,0.92)',
    cardAlt: 'rgba(6,22,40,0.85)',
    border: 'rgba(100,220,255,0.22)',
    borderStrong: 'rgba(140,240,255,0.65)',
    text: '#E8F8FF',
    textMuted: '#7ABCD4',
    textWeak: '#3A6070',
    primary: '#00D4FF',
    primaryLight: '#80EEFF',
    secondary: '#0088CC',
    secondaryLight: '#00AAEE',
    glow1: 'rgba(0,212,255,0.50)',
    glow2: 'rgba(0,136,204,0.28)',
    success: '#00E5A0',
    warning: '#FFD080',
    danger: '#FF4488',
    info: '#00D4FF',
    navBackground: 'rgba(1,8,16,0.98)',
    navBorder: 'rgba(0,212,255,0.18)',
    navActive: '#00D4FF',
    navInactive: '#3A6070',
  },
  globalCSS: `
    body {
      background:
        radial-gradient(ellipse at 50% 0%, rgba(0,100,180,0.20) 0%, transparent 60%),
        radial-gradient(ellipse at 0% 50%, rgba(0,180,220,0.10) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 50%, rgba(0,80,160,0.10) 0%, transparent 50%),
        #010810 !important;
      background-attachment: fixed !important;
    }

    @property --arctic-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes arcticBorderRotate { to { --arctic-angle: 360deg; } }
    @keyframes arcticPulse {
      0%,100% {
        box-shadow:
          0 0 0 1px rgba(0,212,255,0.22),
          0 0 20px rgba(0,212,255,0.10),
          0 0 60px rgba(0,136,204,0.05),
          inset 0 1px 0 rgba(140,240,255,0.08),
          inset 0 0 30px rgba(0,212,255,0.03);
      }
      50% {
        box-shadow:
          0 0 0 1px rgba(140,240,255,0.55),
          0 0 30px rgba(0,212,255,0.25),
          0 0 80px rgba(0,212,255,0.10),
          inset 0 1px 0 rgba(140,240,255,0.15),
          inset 0 0 40px rgba(0,212,255,0.06);
      }
    }
    @keyframes arcticSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes arcticShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes arcticNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(0,212,255,0.60)); }
      50%      { filter: drop-shadow(0 0 12px rgba(140,240,255,1.00)); }
    }
    @keyframes arcticCrystal {
      0%,100% { opacity: 0.15; transform: scale(1) rotate(0deg); }
      50%      { opacity: 0.40; transform: scale(1.05) rotate(3deg); }
    }
    @keyframes arcticFreeze {
      0%   { background-position: 0% 0%; }
      100% { background-position: 100% 100%; }
    }

    .arctic-card-glow {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(24px) saturate(1.5);
      -webkit-backdrop-filter: blur(24px) saturate(1.5);
      animation: arcticPulse 4s ease-in-out infinite;
    }
    .arctic-card-glow::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: conic-gradient(
        from var(--arctic-angle, 0deg),
        transparent 0deg,
        transparent 50deg,
        rgba(0,212,255,0.70) 80deg,
        rgba(140,240,255,1.00) 100deg,
        rgba(200,255,255,0.90) 115deg,
        rgba(0,212,255,0.70) 130deg,
        transparent 160deg,
        transparent 360deg
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: arcticBorderRotate 4s linear infinite;
    }
    .arctic-card-glow::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,212,255,0.50), rgba(140,240,255,0.90), rgba(0,212,255,0.50), transparent);
      pointer-events: none;
    }

    .metal-text {
      background: linear-gradient(90deg, #0088CC 0%, #00D4FF 25%, #80EEFF 45%, #FFFFFF 50%, #80EEFF 55%, #00D4FF 75%, #0088CC 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: arcticShimmer 4s linear infinite;
    }

    .arctic-nav-active { animation: arcticNavGlow 2s ease-in-out infinite; }

    .arctic-engraving {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), rgba(140,240,255,0.80), rgba(0,212,255,0.15), transparent);
      background-size: 200% 100%;
      animation: arcticSweep 2.5s linear infinite;
      position: relative;
    }
    .arctic-engraving::after {
      content: '';
      position: absolute;
      inset: 0;
      background: inherit;
      filter: blur(2px);
      opacity: 0.5;
    }

    .arctic-crystal {
      position: absolute;
      pointer-events: none;
      border: 1px solid rgba(0,212,255,0.20);
      border-radius: 2px;
      animation: arcticCrystal 6s ease-in-out infinite;
    }
  `,
}

// ─── 6. CARBON ───────────────────────────────────────────────────────────────
const carbon: Theme = {
  id: 'carbon',
  name: 'Carbon',
  nameFr: 'Carbone',
  emoji: '🪙',
  colors: {
    background: '#080808',
    surface: '#101010',
    card: 'rgba(18,18,18,0.95)',
    cardAlt: 'rgba(24,24,24,0.90)',
    border: 'rgba(180,180,180,0.18)',
    borderStrong: 'rgba(220,220,220,0.55)',
    text: '#F0F0F0',
    textMuted: '#A0A0A0',
    textWeak: '#505050',
    primary: '#C0C0C0',
    primaryLight: '#E8E8E8',
    secondary: '#808080',
    secondaryLight: '#B0B0B0',
    glow1: 'rgba(200,200,200,0.40)',
    glow2: 'rgba(150,150,150,0.20)',
    success: '#40C060',
    warning: '#D0A020',
    danger: '#C03030',
    info: '#6090D0',
    navBackground: 'rgba(8,8,8,0.98)',
    navBorder: 'rgba(180,180,180,0.12)',
    navActive: '#C0C0C0',
    navInactive: '#505050',
  },
  globalCSS: `
    body {
      background: #080808 !important;
      background-image:
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.015) 2px,
          rgba(255,255,255,0.015) 4px
        ) !important;
    }

    @property --carbon-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes carbonBorderRotate { to { --carbon-angle: 360deg; } }
    @keyframes carbonPulse {
      0%,100% {
        box-shadow:
          0 0 0 1px rgba(180,180,180,0.18),
          0 0 20px rgba(180,180,180,0.08),
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.30);
      }
      50% {
        box-shadow:
          0 0 0 1px rgba(220,220,220,0.50),
          0 0 35px rgba(200,200,200,0.20),
          inset 0 1px 0 rgba(255,255,255,0.12),
          inset 0 -1px 0 rgba(0,0,0,0.30);
      }
    }
    @keyframes carbonSweep {
      0%   { background-position: -200% 0; }
      100% { background-position:  300% 0; }
    }
    @keyframes carbonShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes carbonNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px rgba(200,200,200,0.50)); }
      50%      { filter: drop-shadow(0 0 10px rgba(240,240,240,0.90)); }
    }
    @keyframes carbonChrome {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .carbon-card-glow {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      animation: carbonPulse 4s ease-in-out infinite;
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 3px,
        rgba(255,255,255,0.012) 3px,
        rgba(255,255,255,0.012) 6px
      ) !important;
    }
    .carbon-card-glow::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: conic-gradient(
        from var(--carbon-angle, 0deg),
        transparent 0deg,
        transparent 60deg,
        rgba(150,150,150,0.60) 85deg,
        rgba(240,240,240,1.00) 100deg,
        rgba(200,200,200,0.80) 115deg,
        rgba(100,100,100,0.40) 130deg,
        transparent 160deg,
        transparent 360deg
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      animation: carbonBorderRotate 5s linear infinite;
    }
    .carbon-card-glow::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(180,180,180,0.40), rgba(255,255,255,0.80), rgba(180,180,180,0.40), transparent);
      pointer-events: none;
    }

    .metal-text {
      background: linear-gradient(90deg, #404040 0%, #909090 15%, #C8C8C8 30%, #F0F0F0 45%, #FFFFFF 50%, #F0F0F0 55%, #C8C8C8 70%, #909090 85%, #404040 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: carbonShimmer 5s linear infinite;
    }

    .carbon-nav-active { animation: carbonNavGlow 2.5s ease-in-out infinite; }

    .carbon-engraving {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(180,180,180,0.12), rgba(255,255,255,0.70), rgba(180,180,180,0.12), transparent);
      background-size: 200% 100%;
      animation: carbonSweep 3s linear infinite;
      position: relative;
    }
    .carbon-engraving::after {
      content: '';
      position: absolute;
      inset: 0;
      background: inherit;
      filter: blur(2px);
      opacity: 0.4;
    }

    .carbon-chrome {
      background: linear-gradient(135deg, #303030, #808080, #C0C0C0, #E8E8E8, #C0C0C0, #808080, #303030);
      background-size: 200% 200%;
      animation: carbonChrome 4s ease infinite;
    }
  `,
}



// ─── 7. MOON TIDE ────────────────────────────────────────────────────────────
const moonTide: Theme = {
  id: 'moon-tide',
  name: 'Moon Tide',
  nameFr: 'Marée Lunaire',
  emoji: '🌙',
  colors: {
    background: '#03152B',
    surface: 'rgba(7,20,36,0.82)',
    card: 'rgba(10,30,55,0.42)',
    cardAlt: 'rgba(8,24,44,0.34)',
    border: 'rgba(255,255,255,0.14)',
    borderStrong: 'rgba(63,203,255,0.40)',
    text: '#EAF6FF',
    textMuted: '#A9C7DB',
    textWeak: '#79A4C1',
    primary: '#3FCBFF',
    primaryLight: '#7BE0FF',
    secondary: '#0C5C8E',
    secondaryLight: '#36B8E8',
    glow1: 'rgba(63,203,255,0.35)',
    glow2: 'rgba(220,235,250,0.25)',
    success: '#52D6A1',
    warning: '#F9C46B',
    danger: '#FF6B7A',
    info: '#36B8E8',
    navBackground: 'rgba(6,22,38,0.72)',
    navBorder: 'rgba(123,224,255,0.22)',
    navActive: '#7BE0FF',
    navInactive: '#A9C7DB',
  },
  globalCSS: `
    body[data-theme='moon-tide'] {
      background:
        linear-gradient(180deg, rgba(2,12,24,0.55), rgba(2,12,24,0.68)),
        radial-gradient(ellipse at 18% 8%, rgba(191,216,242,0.22) 0%, rgba(3,21,43,0.0) 30%),
        radial-gradient(ellipse at 50% 92%, rgba(54,184,232,0.20) 0%, rgba(3,21,43,0.0) 45%),
        url('/themes/moon-tide/moon-tide-bg.jpg'),
        linear-gradient(180deg, #03152B 0%, #07294A 62%, #031A36 100%) !important;
      background-size: cover, cover, cover, cover, cover !important;
      background-position: center center !important;
      background-repeat: no-repeat !important;
      background-attachment: scroll !important;
      color: #EAF6FF !important;
    }
    @media (min-width: 768px) {
      body[data-theme='moon-tide'] { background-attachment: fixed !important; }
    }

    @keyframes moonTideCardIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes moonTideGlow {
      0%,100% { box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.10); }
      50% { box-shadow: 0 12px 34px rgba(0,0,0,0.45), 0 0 0 1px rgba(123,224,255,0.30), 0 0 26px rgba(63,203,255,0.20); }
    }
    @keyframes moonTidePulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(63,203,255,0.0), 0 0 16px rgba(63,203,255,0.24); }
      50% { box-shadow: 0 0 0 8px rgba(63,203,255,0.08), 0 0 26px rgba(123,224,255,0.34); }
    }

    body[data-theme='moon-tide'] header {
      background: rgba(7,20,36,0.62) !important;
      backdrop-filter: blur(12px) saturate(1.1);
      -webkit-backdrop-filter: blur(12px) saturate(1.1);
      border-bottom: 1px solid rgba(255,255,255,0.12) !important;
    }

    body[data-theme='moon-tide'] nav {
      background: rgba(6,22,38,0.72) !important;
      border-top: 1px solid rgba(123,224,255,0.22) !important;
      backdrop-filter: blur(12px) saturate(1.15);
      -webkit-backdrop-filter: blur(12px) saturate(1.15);
      box-shadow: 0 -10px 30px rgba(0,0,0,0.26);
    }

    body[data-theme='moon-tide'] main > * {
      animation: moonTideCardIn .35s ease-out both;
    }

    body[data-theme='moon-tide'] main > div,
    body[data-theme='moon-tide'] section,
    body[data-theme='moon-tide'] article,
    body[data-theme='moon-tide'] [role='dialog'] > div {
      border-radius: 18px;
    }

    body[data-theme='moon-tide'] .quantum-card-glow,
    body[data-theme='moon-tide'] .deco-card-sweep,
    body[data-theme='moon-tide'] .inferno-card-glow,
    body[data-theme='moon-tide'] .arctic-card-glow,
    body[data-theme='moon-tide'] .carbon-card-glow {
      background: rgba(10,30,55,0.42) !important;
      border: 1px solid rgba(255,255,255,0.14) !important;
      backdrop-filter: blur(12px) saturate(1.2);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      animation: moonTideGlow 4s ease-in-out infinite;
    }

    body[data-theme='moon-tide'] button {
      border-radius: 14px !important;
      transition: transform .15s ease, filter .2s ease, box-shadow .2s ease;
    }
    body[data-theme='moon-tide'] button:active {
      transform: translateY(1px) scale(0.98);
    }
    body[data-theme='moon-tide'] button:hover,
    body[data-theme='moon-tide'] button:focus-visible {
      filter: brightness(1.05);
    }

    body[data-theme='moon-tide'] input,
    body[data-theme='moon-tide'] textarea,
    body[data-theme='moon-tide'] select {
      background: rgba(8,24,44,0.52) !important;
      border: 1px solid rgba(255,255,255,0.14) !important;
      color: #EAF6FF !important;
      border-radius: 14px !important;
    }
    body[data-theme='moon-tide'] input:focus,
    body[data-theme='moon-tide'] textarea:focus,
    body[data-theme='moon-tide'] select:focus {
      border-color: rgba(63,203,255,0.50) !important;
      box-shadow: 0 0 0 3px rgba(63,203,255,0.16) !important;
      outline: none;
    }

    body[data-theme='moon-tide'] .np,
    body[data-theme='moon-tide'] .nr {
      animation: moonTidePulse 2.8s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      body[data-theme='moon-tide'] *,
      body[data-theme='moon-tide'] *::before,
      body[data-theme='moon-tide'] *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }
  `,
}

// ─── 8. HAILITE ORANGE ────────────────────────────────────────────────────────
const hailiteOrange: Theme = {
  id: 'hailite-orange',
  name: 'Hailite Orange',
  nameFr: 'Hailite Orange',
  emoji: '🔶',
  colors: {
    background:    '#0F1115',
    surface:       '#16191F',
    card:          '#16191F',
    cardAlt:       '#121620',
    border:        'rgba(31,41,55,0.85)',
    borderStrong:  'rgba(55,65,81,1)',
    text:          '#E0E2E6',
    textMuted:     '#9CA3AF',
    textWeak:      '#6B7280',
    primary:       '#F97316',
    primaryLight:  '#FB923C',
    secondary:     '#06B6D4',
    secondaryLight:'#22D3EE',
    glow1:         'rgba(249,115,22,0.30)',
    glow2:         'rgba(249,115,22,0.15)',
    success:       '#22C55E',
    warning:       '#F59E0B',
    danger:        '#EF4444',
    info:          '#06B6D4',
    navBackground: '#16191F',
    navBorder:     'rgba(31,41,55,0.85)',
    navActive:     '#F97316',
    navInactive:   '#6B7280',
  },
  globalCSS: `
    body[data-theme='hailite-orange'] {
      background: #0F1115 !important;
    }

    body[data-theme='hailite-orange'] input,
    body[data-theme='hailite-orange'] textarea,
    body[data-theme='hailite-orange'] select {
      background: #16191F !important;
      border: 1px solid rgba(31,41,55,0.85) !important;
      color: #E0E2E6 !important;
      border-radius: 10px !important;
    }

    body[data-theme='hailite-orange'] input:focus,
    body[data-theme='hailite-orange'] textarea:focus,
    body[data-theme='hailite-orange'] select:focus {
      border-color: rgba(249,115,22,0.60) !important;
      box-shadow: 0 0 0 2px rgba(249,115,22,0.14) !important;
      outline: none;
    }

    @media (prefers-reduced-motion: reduce) {
      body[data-theme='hailite-orange'] *,
      body[data-theme='hailite-orange'] *::before,
      body[data-theme='hailite-orange'] *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }
  `,
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const THEMES: Record<string, Theme> = {
  quantum:  quantumGlass,
  xp:       gamificationXP,
  deco:     artDecoPrestige,
  inferno:  inferno,
  arctic:   arctic,
  carbon:   carbon,
  'moon-tide': moonTide,
  'hailite-orange': hailiteOrange,
}

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES.quantum
}

export function getAllThemes(): Theme[] {
  return Object.values(THEMES)
}

export const THEME_IDS = Object.keys(THEMES)
export const DEFAULT_THEME_ID = 'quantum'
