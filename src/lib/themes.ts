// src/lib/themes.ts
// 6 thèmes premium — remplacent tous les anciens

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
    .xp-bar{background:linear-gradient(90deg,#A855F7,#22D3EE);border-radius:999px;}
    .xp-punch-glow{box-shadow:0 0 0 4px rgba(168,85,247,0.40),0 0 50px rgba(168,85,247,0.40),0 0 120px rgba(168,85,247,0.20);}
    .xp-badge{background:linear-gradient(135deg,rgba(168,85,247,0.25),rgba(34,211,238,0.15));border:1px solid rgba(168,85,247,0.45);border-radius:999px;}
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
    .adventure-card{background:#231D10;border:2px solid rgba(255,159,28,0.35);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.50),inset 0 1px 0 rgba(255,159,28,0.15);}
    .adventure-hazard{background:repeating-linear-gradient(-45deg,#FF9F1C 0px,#FF9F1C 10px,#1A1712 10px,#1A1712 20px);height:4px;opacity:0.6;}
    .adventure-punch{background:radial-gradient(circle at 40% 35%,#FFB020,#F97316 55%,#C85000);box-shadow:0 0 0 6px rgba(255,159,28,0.30),0 0 50px rgba(249,115,22,0.40),0 8px 30px rgba(0,0,0,0.60);}
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
    card: '#12120F',
    cardAlt: '#181713',
    border: 'rgba(214,178,94,0.35)',
    borderStrong: 'rgba(214,178,94,0.70)',
    text: '#F4E8C1',
    textMuted: '#D8C58A',
    textWeak: '#8F8058',
    primary: '#D6B25E',
    primaryLight: '#F2D27A',
    secondary: '#A67C2D',
    glow1: 'rgba(214,178,94,0.35)',
    glow2: 'rgba(214,178,94,0.15)',
    success: '#6FAF5A',
    warning: '#D6B25E',
    danger: '#A83A32',
    info: '#7A9EAD',
    navBackground: '#050505',
    navBorder: 'rgba(214,178,94,0.30)',
    navActive: '#D6B25E',
    navInactive: '#8F8058',
  },
  globalCSS: `
    body{background:#050505 !important;color:#F4E8C1 !important;}
    .deco-frame{position:relative;border:1px solid rgba(214,178,94,0.40);border-radius:8px;}
    .deco-frame::before,.deco-frame::after{content:'';position:absolute;width:16px;height:16px;border-color:rgba(214,178,94,0.80);border-style:solid;}
    .deco-frame::before{top:-2px;left:-2px;border-width:2px 0 0 2px;}
    .deco-frame::after{bottom:-2px;right:-2px;border-width:0 2px 2px 0;}
    .deco-rays{position:relative;overflow:hidden;}
    .deco-rays::before{content:'';position:absolute;inset:0;pointer-events:none;background:conic-gradient(from 0deg,transparent 0deg,rgba(214,178,94,0.05) 10deg,transparent 20deg,rgba(214,178,94,0.05) 30deg,transparent 40deg,rgba(214,178,94,0.05) 50deg,transparent 60deg,rgba(214,178,94,0.05) 70deg,transparent 80deg,rgba(214,178,94,0.05) 90deg,transparent 100deg,rgba(214,178,94,0.05) 110deg,transparent 120deg,rgba(214,178,94,0.05) 130deg,transparent 140deg,rgba(214,178,94,0.05) 150deg,transparent 160deg,rgba(214,178,94,0.05) 170deg,transparent 180deg,rgba(214,178,94,0.05) 190deg,transparent 200deg,rgba(214,178,94,0.05) 210deg,transparent 220deg,rgba(214,178,94,0.05) 230deg,transparent 240deg,rgba(214,178,94,0.05) 250deg,transparent 260deg,rgba(214,178,94,0.05) 270deg,transparent 280deg,rgba(214,178,94,0.05) 290deg,transparent 300deg,rgba(214,178,94,0.05) 310deg,transparent 320deg,rgba(214,178,94,0.05) 330deg,transparent 340deg,rgba(214,178,94,0.05) 350deg,transparent 360deg);}
    .deco-punch{background:radial-gradient(circle at 40% 35%,#F2D27A,#D6B25E 50%,#A67C2D 80%,#7A5A1A);box-shadow:0 0 0 4px rgba(214,178,94,0.40),0 0 40px rgba(214,178,94,0.30),0 8px 30px rgba(0,0,0,0.70);}
    .deco-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(214,178,94,0.50),transparent);}
    .deco-label{letter-spacing:0.15em;text-transform:uppercase;font-size:0.75rem;}
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
  xp: gamificationXP,
  aventure: aventureChantiers,
  deco: artDecoPrestige,
  zen: zenOrganique,
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
