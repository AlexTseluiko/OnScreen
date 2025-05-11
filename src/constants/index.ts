/**
 * Основные константы приложения
 *
 * Этот файл собирает и реэкспортирует все константы приложения.
 */

// Реэкспорт констант из отдельных файлов
export * from './api';
export * from './user';
export * from './content';
export * from './map';

// API статусы
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CLINIC_ADMIN: 'clinic_admin',
  GUEST: 'guest',
} as const;

// Типы контента
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  NEWS: 'news',
  VIDEO: 'video',
  PODCAST: 'podcast',
} as const;

// Статусы запросов
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

// Типы уведомлений
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  MESSAGE: 'message',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  ALERT: 'alert',
} as const;

// Категории медицинских услуг
export const MEDICAL_CATEGORIES = {
  GENERAL: 'general',
  CARDIOLOGY: 'cardiology',
  DERMATOLOGY: 'dermatology',
  NEUROLOGY: 'neurology',
  PEDIATRICS: 'pediatrics',
  GYNECOLOGY: 'gynecology',
  OPHTHALMOLOGY: 'ophthalmology',
  ORTHOPEDICS: 'orthopedics',
  DENTISTRY: 'dentistry',
  PSYCHIATRY: 'psychiatry',
  ENDOCRINOLOGY: 'endocrinology',
  UROLOGY: 'urology',
  ONCOLOGY: 'oncology',
} as const;

// Приоритеты срочности
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  EMERGENCY: 'emergency',
} as const;

// Экранные размеры для адаптивного дизайна
export const SCREEN_SIZES = {
  XS: 320,
  SM: 375,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

// Константы для анимаций
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
    LINEAR: 'linear',
  },
} as const;

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
