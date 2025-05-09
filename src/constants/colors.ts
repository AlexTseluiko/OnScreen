export const COLORS = {
  // Основные цвета
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',

  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
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
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  // Состояния
  states: {
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.12)',
  },
  // Специальные цвета
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
} as const;
