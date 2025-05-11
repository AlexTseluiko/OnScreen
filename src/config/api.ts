/**
 * Конфигурация API
 *
 * Содержит настройки для работы с API сервера.
 */

// Определяем базовый URL API в зависимости от окружения и платформы
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Жестко заданный IP для отладки
const DEV_SERVER_IP = '192.168.0.234';

// Функция для получения IP хост-машины в dev-режиме
const getDevServerHost = () => {
  // Для веб-версии используем текущий хост
  if (Platform.OS === 'web') {
    // Получаем текущий хост из window.location
    try {
      const currentHost = window.location.hostname;
      console.log('Web host detected:', currentHost);

      // Если это не localhost, используем его напрямую
      if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        return currentHost;
      }

      // Иначе для локальной разработки используем заданный IP
      return DEV_SERVER_IP;
    } catch (e) {
      console.log('Error detecting web host:', e);
      return DEV_SERVER_IP;
    }
  }

  // Для Expo можно получить IP через Constants.expoConfig
  if (Constants.expoConfig?.hostUri) {
    const hostUri = Constants.expoConfig.hostUri;
    const host = hostUri.split(':')[0];
    // Проверяем, является ли это локальным IP
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  // Если IP не получен через Expo, используем явно указанный IP
  return DEV_SERVER_IP;
};

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development' || __DEV__) {
    const host = getDevServerHost();
    console.log('API хост:', host);
    return `http://${host}:5000/api`;
  }
  // В продакшене используем реальный URL
  return 'https://api.onscreen.com/api';
};

// URL API-сервера
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Базовый URL API
export const BASE_URL = 'https://api.onscreen.com/v1';
export const API_BASE_URL = 'https://api.onscreen.com';

// Общие настройки API
export const API_CONFIG = {
  // Таймаут для запросов в миллисекундах
  TIMEOUT: 30000, // 30 секунд

  // Настройки повторных попыток
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000, // 1 секунда
    MAX_DELAY: 10000, // 10 секунд
  },

  // Настройки кэширования
  CACHE: {
    DEFAULT_DURATION: 5 * 60 * 1000, // 5 минут
    LONG_DURATION: 60 * 60 * 1000, // 1 час
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    PREFIX: 'api_cache_',
  },

  // Заголовки по умолчанию
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'ru-RU',
  },

  // Настройки авторизации
  AUTH: {
    TOKEN_KEY: '@authToken',
    REFRESH_TOKEN_KEY: '@refreshToken',
    TOKEN_EXPIRY_BUFFER: 5 * 60, // 5 минут до истечения токена
  },

  // Коды ошибок
  ERROR_CODES: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    SERVER_ERROR: 'SERVER_ERROR',
    INVALID_REQUEST: 'INVALID_REQUEST',
  },
};

// Экспортируем API_TIMEOUT для удобства доступа
export const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Максимальное количество попыток повторного запроса
export const MAX_RETRY_ATTEMPTS = 3;

// Задержка между попытками повторного запроса (в миллисекундах)
export const RETRY_DELAY = 1000;

// HTTP Методы
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Заголовки запросов
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  ACCEPT_LANGUAGE: 'Accept-Language',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    FAVORITES: '/user/favorites',
  },
  CLINICS: {
    LIST: '/clinics',
    DETAILS: (id: string) => `/clinics/${id}`,
    REVIEWS: (id: string) => `/clinics/${id}/reviews`,
    SERVICES: (id: string) => `/clinics/${id}/services`,
  },
  ARTICLES: {
    LIST: '/articles',
    DETAILS: (id: string) => `/articles/${id}`,
  },
  SCREENING: {
    PROGRAMS: '/screening/programs',
    SCHEDULE: '/screening/schedule',
    RESULTS: '/screening/results',
  },
  CHAT: {
    MESSAGES: '/chat/messages',
    SEND: '/chat/send',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
};
