export const COLORS = {
  // Основные цвета
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E',

  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  gray2: '#AEAEB2',
  gray3: '#C7C7CC',
  gray4: '#D1D1D6',
  gray5: '#E5E5EA',
  gray6: '#F2F2F7',
  error: '#FF3B30',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',

  // Фоновые цвета
  background: {
    light: '#FFFFFF',
    dark: '#1C1C1E',
    card: {
      light: '#FFFFFF',
      dark: '#2C2C2E',
    },
  },
  // Текстовые цвета
  text: {
    primary: {
      light: '#000000',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#666666',
      dark: '#EBEBF5',
    },
  },
  // Границы
  border: {
    light: '#E0E0E0',
    dark: '#38383A',
  },
  // Тени
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.1)',
  // Состояния
  states: {
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.12)',
  },
  // Специальные цвета
  transparent: 'transparent',
} as const;
