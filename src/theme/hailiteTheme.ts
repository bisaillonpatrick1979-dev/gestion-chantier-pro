export const hailiteTheme = {
  colors: {
    primary: '#FF5722',
    secondary: '#00D084',
    cyan: '#00D9FF',
    violet: '#D946EF',
    yellow: '#FFA500',
    background: '#0F1117',
    surface: '#1A1A1A',
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
    },
    status: {
      success: '#10B981',
      warning: '#FFA500',
      error: '#EF4444',
      pending: '#8B5A3C',
    },
  },
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
} as const

export type HailiteTheme = typeof hailiteTheme
