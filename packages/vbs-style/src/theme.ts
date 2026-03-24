export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f8fafc',
      500: '#64748b',
      900: '#0f172a'
    }
  },
  spacing: {
    entity: '12rem',
    grid: '1rem'
  },
  borderWidth: {
    edge: {
      default: '3px',
      hover: '5px'
    }
  }
} as const;

export type Theme = typeof theme;