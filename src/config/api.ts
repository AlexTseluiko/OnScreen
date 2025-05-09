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

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
};

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
