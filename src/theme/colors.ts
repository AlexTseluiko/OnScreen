/**
 * Основная палитра цветов приложения
 * Единый источник истины для всех цветов и тем
 */

// Основная палитра (цвета, не привязанные к темам)
export const palette = {
  // Основные цвета бренда
  primary: '#007AFF',
  primaryDark: '#0A84FF',
  secondary: '#5856D6',
  success: '#34C759',
  successDark: '#30D158',
  danger: '#FF3B30',
  dangerDark: '#FF453A',
  warning: '#FF9500',
  warningDark: '#FF9F0A',
  info: '#5AC8FA',

  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',

  // Оттенки серого
  gray: {
    50: '#F9FAFB',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#1C1C1E',
  },

  // Специальные цвета
  emergency: '#f67e7d',
  transparent: 'transparent',
} as const;

// Типы для цветовых схем
export interface ColorTheme {
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    hint: string;
    disabled: string;
    inverse: string;
  };
  border: string;
  divider: string;
  shadow: string;
  overlay: string;
  inputBackground: string;
  darkInputBackground: string;
  white: string;

  // Функциональные цвета
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  error: string;
  gray: string;
}

// Цветовая схема для светлой темы
export const lightTheme: ColorTheme = {
  background: palette.white,
  surface: palette.white,
  text: {
    primary: palette.black,
    secondary: palette.gray[600],
    hint: palette.gray[500],
    disabled: palette.gray[400],
    inverse: palette.white,
  },
  border: palette.gray[200],
  divider: palette.gray[200],
  shadow: palette.black,
  overlay: 'rgba(0, 0, 0, 0.1)',
  inputBackground: '#F9F9F9',
  darkInputBackground: '#333333',
  white: palette.white,

  primary: palette.primary,
  secondary: palette.secondary,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
  info: palette.info,
  error: palette.danger,
  gray: '#888888',
} as const;

// Цветовая схема для темной темы
export const darkTheme: ColorTheme = {
  background: palette.gray[900],
  surface: palette.gray[800],
  text: {
    primary: palette.white,
    secondary: palette.gray[300],
    hint: palette.gray[400],
    disabled: palette.gray[600],
    inverse: palette.black,
  },
  border: palette.gray[700],
  divider: palette.gray[700],
  shadow: palette.black,
  overlay: 'rgba(0, 0, 0, 0.4)',
  inputBackground: '#333333',
  darkInputBackground: '#1C1C1E',
  white: palette.white,

  primary: palette.primaryDark,
  secondary: palette.secondary,
  success: palette.successDark,
  danger: palette.dangerDark,
  warning: palette.warningDark,
  info: palette.info,
  error: palette.dangerDark,
  gray: '#888888',
} as const;

// Семантические цвета для экранов и модулей
export const semanticColors = {
  appointment: {
    light: '#fffde6',
    dark: '#3a3a2a',
  },
  clinic: {
    light: '#e6fff2',
    dark: '#302a3a',
  },
  doctor: {
    light: '#e6ffff',
    dark: '#2a3a3a',
  },
  patient: {
    light: '#ffe6e6',
    dark: '#3a2a2a',
  },
  review: {
    light: '#f2e6ff',
    dark: '#352a3a',
  },
} as const;

// Типизация для экспорта COLORS
export interface Colors {
  palette: typeof palette;
  light: ColorTheme;
  dark: ColorTheme;
  semantic: typeof semanticColors;
  primary: string;
  background: string;
  border: string;
  white: string;
  shadow: string;
  text: string;
  textSecondary: string;
  error: string;
  overlay: string;
}

// Экспортируем всё для использования в приложении
export const COLORS: Colors = {
  palette,
  light: lightTheme,
  dark: darkTheme,
  semantic: semanticColors,
  primary: '#007AFF',
  background: '#FFFFFF',
  border: '#E5E5E5',
  white: '#FFFFFF',
  shadow: '#000000',
  text: '#000000',
  textSecondary: '#666666',
  error: '#FF3B30',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;
