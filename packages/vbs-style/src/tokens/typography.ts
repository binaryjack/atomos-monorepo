export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'monospace']
  },
  fontSize: {
    xs: ['0.75rem', '1rem'],     // 12px, 16px line-height
    sm: ['0.875rem', '1.25rem'], // 14px, 20px line-height
    base: ['1rem', '1.5rem'],    // 16px, 24px line-height
    lg: ['1.125rem', '1.75rem'], // 18px, 28px line-height
    xl: ['1.25rem', '1.875rem'], // 20px, 30px line-height
    '2xl': ['1.5rem', '2rem'],   // 24px, 32px line-height
    '3xl': ['1.875rem', '2.25rem'], // 30px, 36px line-height
    '4xl': ['2.25rem', '2.5rem'], // 36px, 40px line-height
    '5xl': ['3rem', '3rem'],      // 48px, 48px line-height
    '6xl': ['3.75rem', '3.75rem'], // 60px, 60px line-height
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;