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

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000, // 10 секунд
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Заголовки для CORS
    'X-Requested-With': 'XMLHttpRequest',
  },
  CREDENTIALS: 'include' as RequestCredentials,
}; 