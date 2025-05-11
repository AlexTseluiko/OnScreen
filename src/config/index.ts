/**
 * Главный файл конфигурации
 *
 * Реэкспортирует все настройки приложения для единого доступа.
 */

// Реэкспорт API-конфигурации
export * from './api';

// Ключи для хранения данных
export const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  THEME: '@app_theme',
  LANGUAGE: '@app_language',
  NOTIFICATIONS: '@notifications_settings',
  SETTINGS: '@app_settings',
  CACHE_PREFIX: '@cache_',
};

// Настройки для работы с медиа
export const MEDIA_CONFIG = {
  IMAGE_QUALITY: 0.8,
  IMAGE_MAX_WIDTH: 1280,
  IMAGE_MAX_HEIGHT: 1280,
  UPLOAD_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DEFAULT_AVATAR: require('../assets/images/default-avatar.png'),
  DEFAULT_CLINIC_IMAGE: require('../assets/images/default-clinic.png'),
};

// Настройки пагинации
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  MAX_PAGE_SIZE: 50,
};

// Настройки для кэширования
export const CACHE_CONFIG = {
  DEFAULT_TTL: 1000 * 60 * 60, // 1 час
  FORCE_CACHE_UPDATE_AFTER: 1000 * 60 * 60 * 24, // 24 часа
  PROFILE_TTL: 1000 * 60 * 15, // 15 минут
  CLINICS_TTL: 1000 * 60 * 30, // 30 минут
  FACILITIES_TTL: 1000 * 60 * 60, // 1 час
  ARTICLES_TTL: 1000 * 60 * 60 * 6, // 6 часов
  MAX_CACHE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Настройки для логирования
export const LOGGING_CONFIG = {
  ENABLE_API_LOGGING: true,
  ENABLE_DEBUG_LOGGING: __DEV__,
  ENABLE_NETWORK_LOGGING: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
};

// Флаги для функций приложения
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_CRASH_REPORTING: !__DEV__,
  ENABLE_CHAT: true,
  ENABLE_DOCTOR_REQUESTS: true,
  ENABLE_MEDICAL_CARD: true,
};
