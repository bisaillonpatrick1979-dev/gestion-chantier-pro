import type { Theme } from './themes'

export const hailiteGlassTheme: Theme = {
  id: 'hailite-glass',
  name: 'Hailite Glass',
  nameFr: 'Hailite Glass',
  emoji: '💎',
  colors: {
    background: '#070914',
    surface: 'rgba(11,16,32,0.82)',
    card: 'rgba(16,22,41,0.74)',
    cardAlt: 'rgba(20,31,65,0.62)',
    border: 'rgba(103,183,255,0.22)',
    borderStrong: 'rgba(115,198,255,0.62)',
    text: '#EEF4FF',
    textMuted: '#AEBBD4',
    textWeak: '#6B7C9B',
    primary: '#168BFF',
    primaryLight: '#73C6FF',
    secondary: '#7B2CFF',
    secondaryLight: '#A78BFF',
    glow1: 'rgba(22,139,255,0.46)',
    glow2: 'rgba(123,44,255,0.30)',
    success: '#00D97E',
    warning: '#FFD166',
    danger: '#FF4D4D',
    info: '#67B7FF',
    navBackground: 'rgba(7,9,20,0.92)',
    navBorder: 'rgba(103,183,255,0.18)',
    navActive: '#168BFF',
    navInactive: '#7E91B2',
  },
  globalCSS: `
    body[data-theme='hailite-glass'] {
      background:
        radial-gradient(circle at 18% 0%, rgba(27,45,114,0.95) 0%, transparent 34%),
        radial-gradient(circle at 82% 12%, rgba(123,44,255,0.30) 0%, transparent 32%),
        radial-gradient(circle at 48% 105%, rgba(22,139,255,0.20) 0%, transparent 44%),
        linear-gradient(180deg, #070914 0%, #050711 100%) !important;
      background-attachment: fixed !important;
      color: #EEF4FF !important;
    }
    body[data-theme='hailite-glass']::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -1;
      background:
        linear-gradient(115deg, transparent 0%, rgba(115,198,255,0.07) 18%, transparent 36%, rgba(123,44,255,0.08) 68%, transparent 88%),
        radial-gradient(circle at 15% 28%, rgba(103,183,255,0.16), transparent 26%),
        radial-gradient(circle at 88% 66%, rgba(123,44,255,0.16), transparent 28%);
      opacity: .95;
    }
    body[data-theme='hailite-glass'] header,
    body[data-theme='hailite-glass'] nav {
      background: rgba(7,9,20,0.72) !important;
      border-color: rgba(103,183,255,0.18) !important;
      backdrop-filter: blur(14px) saturate(1.18);
      -webkit-backdrop-filter: blur(14px) saturate(1.18);
    }
    body[data-theme='hailite-glass'] .quantum-card-glow,
    body[data-theme='hailite-glass'] .deco-card-sweep,
    body[data-theme='hailite-glass'] .inferno-card-glow,
    body[data-theme='hailite-glass'] .arctic-card-glow,
    body[data-theme='hailite-glass'] .carbon-card-glow,
    body[data-theme='hailite-glass'] section,
    body[data-theme='hailite-glass'] article {
      background: rgba(16,22,41,0.68) !important;
      border-color: rgba(103,183,255,0.22) !important;
      box-shadow: 0 18px 55px rgba(0,0,0,0.32), 0 0 0 1px rgba(115,198,255,0.06) inset !important;
      backdrop-filter: blur(14px) saturate(1.18);
      -webkit-backdrop-filter: blur(14px) saturate(1.18);
    }
    body[data-theme='hailite-glass'] button {
      border-color: rgba(103,183,255,0.28) !important;
    }
    body[data-theme='hailite-glass'] input,
    body[data-theme='hailite-glass'] textarea,
    body[data-theme='hailite-glass'] select {
      background: rgba(7,11,22,0.72) !important;
      border-color: rgba(103,183,255,0.25) !important;
      color: #EEF4FF !important;
    }
    body[data-theme='hailite-glass'] .metal-text {
      background: linear-gradient(90deg, #168BFF, #73C6FF, #A78BFF, #73C6FF, #168BFF) !important;
      background-size: 220% auto !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
    }
  `,
}
