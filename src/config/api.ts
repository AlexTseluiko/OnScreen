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

// URL API-сервера - устанавливаем localhost:5000
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Сообщаем о текущем API URL в консоль для диагностики
console.log('API URL установлен на:', API_URL);

// Базовый URL API
export const BASE_URL = 'https://api.onscreen.com/v1';
export const API_BASE_URL = 'https://api.onscreen.com';

// Общие настройки API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
  },
} as const;

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
    UPDATE: '/user/update',
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
    CREATE: '/articles',
    UPDATE: (id: string) => `/articles/${id}`,
    DELETE: (id: string) => `/articles/${id}`,
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
