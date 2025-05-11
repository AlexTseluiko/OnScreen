import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiErrorResponse, AuthenticationError } from '../api/apiService';
import { API_CONFIG, BASE_URL } from '../config/api';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';

// Типы и интерфейсы
interface ApiContextState {
  // Состояние авторизации
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Настройки API
  baseUrl: string;

  // Статистика
  offlineMode: boolean;
  requestsInProgress: number;
  cacheStats: { itemCount: number; totalSize: number };

  // Методы для работы с токенами
  setAuthToken: (token: string | null) => void;
  refreshToken: () => Promise<boolean>;

  // Методы для работы с кэшем
  clearCache: (cacheKey?: string) => Promise<void>;
  getCacheStats: () => Promise<{ itemCount: number; totalSize: number }>;

  // Управление соединением
  isOffline: () => boolean;
  waitForConnection: () => Promise<void>;
}

// Значения по умолчанию
const defaultContext: ApiContextState = {
  isAuthenticated: false,
  isInitialized: false,
  baseUrl: '',
  offlineMode: false,
  requestsInProgress: 0,
  cacheStats: { itemCount: 0, totalSize: 0 },
  setAuthToken: () => {},
  refreshToken: async () => false,
  clearCache: async () => {},
  getCacheStats: async () => ({ itemCount: 0, totalSize: 0 }),
  isOffline: () => false,
  waitForConnection: async () => {},
};

// Создаем контекст
const ApiContext = createContext<ApiContextState>(defaultContext);

// Хук для использования контекста
export const useApi = (): ApiContextState => useContext(ApiContext);

// Провайдер контекста
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Состояния контекста
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [requestsInProgress, setRequestsInProgress] = useState<number>(0);
  const [cacheStats, setCacheStats] = useState<{ itemCount: number; totalSize: number }>({
    itemCount: 0,
    totalSize: 0,
  });

  // Получаем методы из контекста аутентификации
  const { logout } = useAuth();

  // Инициализация API сервиса
  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Загружаем токен из хранилища
        const token = await AsyncStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
        if (token) {
          apiService.setAuthToken(token);
          setIsAuthenticated(true);
        }

        // Устанавливаем обработчик ошибок аутентификации
        apiService.setAuthenticationFailedCallback(() => {
          logger.warn('Аутентификация не удалась, выполняем выход из системы');
          // Вызываем метод logout из AuthContext
          logout();
        });

        // Получаем статистику кэша
        const stats = await apiService.getCacheStats();
        setCacheStats(stats);

        setIsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize API context', { error });
        setIsInitialized(true);
      }
    };

    initializeApi();
  }, [logout]);

  // Функция для установки токена авторизации
  const setAuthToken = useCallback(async (token: string | null) => {
    try {
      if (token) {
        // Сохраняем токен в хранилище
        await AsyncStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token);

        // Устанавливаем токен в apiService
        apiService.setAuthToken(token);

        setIsAuthenticated(true);
      } else {
        // Удаляем токен из хранилища
        await AsyncStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
        await AsyncStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);

        // Удаляем токен из apiService
        apiService.setAuthToken(null);

        setIsAuthenticated(false);
      }
    } catch (error) {
      logger.error('Failed to set auth token', { error });
    }
  }, []);

  // Функция для обновления токена
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // Вызываем метод apiService для обновления токена
      const newToken = await apiService.refreshAuthToken();

      if (newToken) {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      logger.error('Failed to refresh token', { error });
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Функция для очистки кэша
  const clearCache = useCallback(async (cacheKey?: string) => {
    try {
      await apiService.clearCache(cacheKey);

      // Обновляем статистику кэша
      const stats = await apiService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      logger.error('Failed to clear cache', { error });
    }
  }, []);

  // Функция для получения статистики кэша
  const getCacheStats = useCallback(async () => {
    try {
      const stats = await apiService.getCacheStats();
      setCacheStats(stats);
      return stats;
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      return { itemCount: 0, totalSize: 0 };
    }
  }, []);

  // Функция для проверки состояния сети
  const isOffline = useCallback(() => {
    return offlineMode;
  }, [offlineMode]);

  // Функция для ожидания подключения к сети
  const waitForConnection = useCallback(async (): Promise<void> => {
    if (!offlineMode) {
      return;
    }

    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!offlineMode) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }, [offlineMode]);

  // Значение контекста
  const value: ApiContextState = {
    isAuthenticated,
    isInitialized,
    baseUrl: BASE_URL || '',
    offlineMode,
    requestsInProgress,
    cacheStats,
    setAuthToken,
    refreshToken,
    clearCache,
    getCacheStats,
    isOffline,
    waitForConnection,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
