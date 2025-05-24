/**
 * Конфигурация API
 *
 * Содержит настройки для работы с API сервера.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Получаем текущий хост
const getCurrentHost = () => {
  if (Platform.OS === 'web') {
    return window.location.hostname;
  }
  return null;
};

const currentHost = getCurrentHost();

// Определяем базовый URL API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://api.onscreen.com';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.onscreen.com/v1';

// Сообщаем о текущем API URL в консоль для диагностики
console.log('API URL установлен на:', API_URL);

// Общие настройки API
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Конфигурация OpenAI
export const OPENAI_CONFIG = {
  apiUrl: process.env.REACT_APP_OPENAI_API_URL,
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
};

// Конфигурация Google Maps
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
};

// Конфигурация изображений по умолчанию
export const DEFAULT_IMAGES = {
  avatar: process.env.REACT_APP_DEFAULT_AVATAR_URL,
  clinic: process.env.REACT_APP_DEFAULT_CLINIC_IMAGE,
  article: process.env.REACT_APP_DEFAULT_ARTICLE_IMAGE,
};

// Эндпоинты API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY: '/auth/verify',
  },
  USER: {
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    PASSWORD: '/users/password',
  },
  SCREENING: {
    PROGRAMS: '/screening/programs',
    SCHEDULE: '/screening/schedule',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: '/notifications/read',
    READ_ALL: '/notifications/read-all',
  },
};

// Экспортируем API_TIMEOUT для удобства доступа
export const API_TIMEOUT = API_CONFIG.timeout;

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
