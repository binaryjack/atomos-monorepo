import { colors } from './colors';

export const darkTheme = {
  colors: {
    // Background colors
    background: {
      primary: colors.secondary[900],
      secondary: colors.secondary[800],
      tertiary: colors.secondary[700]
    },
    // Text colors  
    text: {
      primary: colors.secondary[50],
      secondary: colors.secondary[300], 
      tertiary: colors.secondary[400],
      inverse: colors.secondary[900]
    },
    // Border colors
    border: {
      primary: colors.secondary[700],
      secondary: colors.secondary[600],
      focus: colors.primary[500]
    },
    // Component specific
    button: {
      primary: {
        bg: colors.primary[600],
        hover: colors.primary[700],
        text: colors.primary[50]
      },
      secondary: {
        bg: colors.secondary[700],
        hover: colors.secondary[600], 
        text: colors.secondary[100]
      }
    },
    input: {
      bg: colors.secondary[800],
      border: colors.secondary[600],
      focus: colors.primary[500],
      text: colors.secondary[100],
      placeholder: colors.secondary[400]
    },
    card: {
      bg: colors.secondary[800],
      border: colors.secondary[700]
    }
  }
} as const;

export const lightTheme = {
  colors: {
    // Background colors
    background: {
      primary: colors.secondary[50],
      secondary: colors.secondary[100],
      tertiary: colors.secondary[200]
    },
    // Text colors
    text: {
      primary: colors.secondary[900],
      secondary: colors.secondary[600],
      tertiary: colors.secondary[500], 
      inverse: colors.secondary[50]
    },
    // Border colors
    border: {
      primary: colors.secondary[200],
      secondary: colors.secondary[300],
      focus: colors.primary[500]
    },
    // Component specific
    button: {
      primary: {
        bg: colors.primary[600],
        hover: colors.primary[700],
        text: colors.primary[50]
      },
      secondary: {
        bg: colors.secondary[600],
        hover: colors.secondary[700],
        text: colors.secondary[50]
      }
    },
    input: {
      bg: colors.secondary[50],
      border: colors.secondary[300],
      focus: colors.primary[500],
      text: colors.secondary[900],
      placeholder: colors.secondary[400]
    },
    card: {
      bg: colors.secondary[50],
      border: colors.secondary[200]
    }
  }
} as const;