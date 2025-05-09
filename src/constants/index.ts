interface ColorTheme {
  primary: string;
  background: string;
  whiteBackground: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  disabled: string;
}

interface Colors {
  light: ColorTheme;
  dark: ColorTheme;
  secondary: string;
  emergency: string;
  text: string;
  textSecondary: string;
  white: string;
  black: string;
  gray: string;
  success: string;
  error: string;
  warning: string;
  lightGray: string;
  whiteTransparent: string;
}

export const COLORS: Colors = {
  light: {
    primary: '#4285F4',
    background: '#f1f1f1',
    whiteBackground: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    error: '#FF0000',
    success: '#4CAF50',
    warning: '#FFC107',
    disabled: '#CCCCCC',
  },
  dark: {
    primary: '#4285F4',
    background: '#121212',
    whiteBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    error: '#FF5252',
    success: '#69F0AE',
    warning: '#FFD740',
    disabled: '#666666',
  },
  secondary: '#4CAF50',
  emergency: '#FF3B30',
  text: '#000000',
  textSecondary: '#8E8E93',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  success: '#4CAF50',
  error: '#FF3B30',
  warning: '#FFC107',
  lightGray: '#E0E0E0',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
} as const;

// Начальные координаты карты
export const INITIAL_REGION = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Поддерживаемые языки
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
];

// API ключи
export const API_KEYS = {
  GOOGLE_MAPS: 'AIzaSyBOy6uPJSI-pFCbjTJUqAUsb2eKJBi_sAw', // Замените на действительный ключ API Google Maps
};

// Настройки приложения
export const APP_CONFIG = {
  MAP_ZOOM_LEVEL: 12,
  REFRESH_INTERVAL: 30000, // 30 секунд
  MAX_REVIEWS_PER_PAGE: 10,
  MAX_FACILITIES_PER_PAGE: 20,
};
