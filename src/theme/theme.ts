/**
 * Настройки тем приложения
 */
import { COLORS, lightTheme, darkTheme } from './colors';

// Отступы
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Радиусы для скругления
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

// Настройки теней
export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Полная светлая тема
export const lightThemeConfig = {
  colors: lightTheme,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    small: { ...shadows.small, shadowColor: COLORS.palette.black },
    medium: { ...shadows.medium, shadowColor: COLORS.palette.black },
    large: { ...shadows.large, shadowColor: COLORS.palette.black },
  },
} as const;

// Полная темная тема
export const darkThemeConfig = {
  colors: darkTheme,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    small: { ...shadows.small, shadowColor: COLORS.palette.black },
    medium: { ...shadows.medium, shadowColor: COLORS.palette.black },
    large: { ...shadows.large, shadowColor: COLORS.palette.black },
  },
} as const;

// Тип для темы
export type Theme = typeof lightThemeConfig;

// Экспорт обеих тем
export const themes = {
  light: lightThemeConfig,
  dark: darkThemeConfig,
} as const;
