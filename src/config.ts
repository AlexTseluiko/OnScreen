/**
 * Конфигурация приложения
 */

// URL API-сервера
export const API_URL = 'http://localhost:19000/api';

// Базовый URL API
export const API_BASE_URL = 'https://api.onscreen.com';

// Таймауты для запросов (в миллисекундах)
export const API_TIMEOUT = 30000;

// Максимальное количество попыток повторного запроса
export const MAX_RETRY_ATTEMPTS = 3;

// Задержка между попытками повторного запроса (в миллисекундах)
export const RETRY_DELAY = 1000;

// Флаги для включения/отключения логирования
export const ENABLE_API_LOGGING = true;
export const ENABLE_DEBUG_LOGGING = __DEV__;

// Ключи для хранения данных
export const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  THEME: '@theme',
  LANGUAGE: '@language',
  NOTIFICATIONS: '@notifications',
  SETTINGS: '@settings',
};

// Другие настройки приложения
export const APP_CONFIG = {
  // Настройки для загрузки изображений
  defaultImage: 'https://picsum.photos/200/300',

  // Настройки пагинации
  defaultPageSize: 10,
};
