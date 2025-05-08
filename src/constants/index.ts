// Цвета
export const COLORS = {
  primary: '#3A7BFF',
  secondary: '#4CAF50',
  emergency: '#FF3B30',
  background: '#FFFFFF',
  text: '#000000',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  success: '#4CAF50',
  error: '#FF3B30',
  warning: '#FFC107',
  lightGray: '#E0E0E0',
};

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