import { darkTheme, ThemeColors } from './colors';

export const theme = {
  colors: darkTheme,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 18,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
};

export type Theme = typeof theme;
export type AppColors = ThemeColors;

export default theme;
