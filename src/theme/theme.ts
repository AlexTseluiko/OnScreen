import { COLORS } from '../constants/colors';
import { spacing } from '../constants/styles';

export const lightTheme = {
  colors: {
    ...COLORS,
    background: COLORS.background.light,
    text: COLORS.text.primary.light,
    textSecondary: COLORS.text.secondary.light,
    border: COLORS.border.light,
    card: COLORS.background.card.light,
    shadow: COLORS.shadow.light,
    error: COLORS.danger,
    placeholder: COLORS.gray[400],
    inputBackground: COLORS.white,
    cardBackground: COLORS.white,
    disabled: COLORS.gray[300],
  },
  spacing,
} as const;

export const darkTheme = {
  colors: {
    ...COLORS,
    background: COLORS.background.dark,
    text: COLORS.text.primary.dark,
    textSecondary: COLORS.text.secondary.dark,
    border: COLORS.border.dark,
    card: COLORS.background.card.dark,
    shadow: COLORS.shadow.dark,
    error: COLORS.danger,
    placeholder: COLORS.gray[600],
    inputBackground: COLORS.background.card.dark,
    cardBackground: COLORS.background.card.dark,
    disabled: COLORS.gray[700],
  },
  spacing,
} as const;

export type Theme = typeof lightTheme | typeof darkTheme;
