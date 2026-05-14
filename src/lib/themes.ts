export interface Theme {
  id: string
  name: string
  emoji: string
  colors: {
    background: string
    surface: string
    card: string
    primary: string
    primaryLight: string
    secondary: string
    secondaryLight: string
    text: string
    textMuted: string
    border: string
    glow1: string
    glow2: string
  }
}

export const themes: Theme[] = [
  {
    id: 'sunset',
    name: 'Coucher de soleil',
    emoji: '🌅',
    colors: {
      background: '#0a0500',
      surface: '#1a0a00',
      card: '#1f0e00',
      primary: '#ea580c',
      primaryLight: '#fb923c',
      secondary: '#f59e0b',
      secondaryLight: '#fcd34d',
      text: '#f5f0e8',
      textMuted: '#8a7060',
      border: '#3a1f0a',
      glow1: 'rgba(234,88,12,0.25)',
      glow2: 'rgba(245,158,11,0.15)',
    },
  },
  {
    id: 'electric',
    name: 'Électrique',
    emoji: '⚡',
    colors: {
      background: '#050508',
      surface: '#0a0a12',
      card: '#0f0f1a',
      primary: '#f97316',
      primaryLight: '#fdba74',
      secondary: '#e2e0dc',
      secondaryLight: '#ffffff',
      text: '#f0f0f5',
      textMuted: '#707080',
      border: '#1a1a2e',
      glow1: 'rgba(249,115,22,0.25)',
      glow2: 'rgba(226,224,220,0.15)',
    },
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    emoji: '🌌',
    colors: {
      background: '#050a18',
      surface: '#0d1b35',
      card: '#0f1e3d',
      primary: '#7c3aed',
      primaryLight: '#a855f7',
      secondary: '#1d4ed8',
      secondaryLight: '#06b6d4',
      text: '#e2e8f0',
      textMuted: '#64748b',
      border: '#1e3a5f',
      glow1: 'rgba(124,58,237,0.25)',
      glow2: 'rgba(29,78,216,0.15)',
    },
  },
  {
    id: 'ocean',
    name: 'Océan',
    emoji: '🌊',
    colors: {
      background: '#00080f',
      surface: '#001525',
      card: '#001e33',
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      secondary: '#06b6d4',
      secondaryLight: '#67e8f9',
      text: '#e0f2fe',
      textMuted: '#4a7a8a',
      border: '#003a5f',
      glow1: 'rgba(14,165,233,0.25)',
      glow2: 'rgba(6,182,212,0.15)',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌿',
    colors: {
      background: '#010a02',
      surface: '#051a07',
      card: '#071f09',
      primary: '#16a34a',
      primaryLight: '#4ade80',
      secondary: '#ca8a04',
      secondaryLight: '#fde047',
      text: '#f0fdf4',
      textMuted: '#4a7a50',
      border: '#14532d',
      glow1: 'rgba(22,163,74,0.25)',
      glow2: 'rgba(202,138,4,0.15)',
    },
  },
]

export const getTheme = (id: string): Theme =>
  themes.find(t => t.id === id) || themes[0]
