import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CancelTokenSource,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL, API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';
import { cache } from '../utils/cache';
import { API_URL } from '../config/api';
import { networkManager } from '../utils/network';

// Определим класс для ошибок аутентификации
export class AuthenticationError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }
}

// Импортируем интерфейс CacheOptions, если бы он был экспортирован из cache
// Поскольку он не экспортирован, определяем совместимый интерфейс здесь
interface CacheOptions {
  expiry?: number; // время жизни в миллисекундах
  forceRefresh?: boolean; // принудительное обновление
}

// Типы для кэширования
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Интерфейсы для конфигурации
interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

interface RequestConfig extends AxiosRequestConfig {
  cacheKey?: string;
  cacheDuration?: number; // в миллисекундах
  forceRefresh?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Интерфейс для обработчика ошибок
export interface ApiErrorResponse {
  status: number;
  message: string;
  code: string;
  details?: Record<string, unknown>;
  originalError?: Error;
}

// Настройки запроса
interface RequestConfig extends AxiosRequestConfig {
  cacheKey?: string;
  cacheDuration?: number;
  forceRefresh?: boolean;
}

// Активные запросы для предотвращения дубликатов
const activeRequests: Map<string, Promise<unknown>> = new Map();
// Активные токены для отмены запросов
const cancelTokens: Map<string, CancelTokenSource> = new Map();

/**
 * Генерирует ключ для запроса на основе URL и параметров
 */
const generateRequestKey = (url: string, config?: RequestConfig): string => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${config?.method || 'GET'}_${url}_${params}`;
};

/**
 * Проверяет, нужно ли использовать кэш для запроса
 */
const shouldUseCache = (config?: RequestConfig): boolean => {
  return !!config?.cacheKey && !config?.forceRefresh;
};

/**
 * Сохраняет результат запроса в кэш
 */
const saveToCache = async (cacheKey: string, data: unknown, duration?: number): Promise<void> => {
  try {
    // Преобразуем длительность в формат CacheOptions
    const cacheOptions: CacheOptions | undefined = duration ? { expiry: duration } : undefined;
    await cache.set(cacheKey, data, cacheOptions);
  } catch (error) {
    logger.error('Error saving to cache:', { cacheKey, error });
  }
};

/**
 * Получает данные из кэша
 */
const getFromCache = async <T>(cacheKey: string): Promise<T | null> => {
  try {
    return await cache.get<T>(cacheKey);
  } catch (error) {
    logger.error('Error getting from cache:', { cacheKey, error });
    return null;
  }
};

/**
 * Форматирует ошибку в стандартный формат ApiErrorResponse
 */
const formatError = (error: unknown): ApiErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Ошибка с ответом от сервера
      const status = axiosError.response.status;
      const responseData = axiosError.response.data as Record<string, unknown>;

      return {
        message:
          (responseData?.message as string) ||
          (responseData?.error as string) ||
          `HTTP Error ${status}`,
        code: (responseData?.code as string) || `HTTP_${status}`,
        status,
        details: responseData?.details as Record<string, unknown>,
        originalError: error as Error,
      };
    } else if (axiosError.request) {
      // Запрос сделан, но нет ответа
      return {
        message: 'Нет ответа от сервера',
        code: 'NO_RESPONSE',
        status: 0,
        originalError: error as Error,
      };
    } else {
      // Ошибка при настройке запроса
      return {
        message: axiosError.message || 'Ошибка запроса',
        code: 'REQUEST_SETUP_ERROR',
        status: 0,
        originalError: error as Error,
      };
    }
  } else if (error instanceof Error) {
    // Обычная JavaScript ошибка
    return {
      message: error.message,
      code: 'JS_ERROR',
      status: 0,
      originalError: error,
    };
  }

  // Неизвестная ошибка
  return {
    message: 'Неизвестная ошибка',
    code: 'UNKNOWN_ERROR',
    status: 0,
    originalError: error instanceof Error ? error : new Error(String(error)),
  };
};

// Функция request объявлена, но не используется - удаляем её определение или можно закомментировать для будущего использования
// const request = async <T>(url: string, config?: RequestConfig): Promise<T> => {
//   // Содержимое функции...
// };

class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private tokenRefreshInProgress: boolean = false;
  private tokenRefreshPromise: Promise<string | null> | null = null;
  private pendingRequests: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    config: RequestConfig;
  }> = [];
  private readonly defaultCacheDuration = 1000 * 60 * 5; // 5 минут по умолчанию
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private offline = false;
  private offlineQueue: Array<{
    config: RequestConfig;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];
  private baseUrl: string;

  // Колбэк для обработки ошибок авторизации
  private onAuthenticationFailed?: () => void;

  private constructor(config: ApiServiceConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(config.headers || {}),
      },
    });

    this.baseUrl = config.baseURL;
    this.setupInterceptors();
    this.setupNetworkListener();
  }

  public static getInstance(config?: ApiServiceConfig): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(
        config || {
          baseURL: BASE_URL,
          timeout: API_CONFIG.TIMEOUT,
        }
      );
    }
    return ApiService.instance;
  }

  /**
   * Устанавливает токен авторизации для последующих запросов
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;

    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Выполнение GET запроса с поддержкой кэширования
   */
  public async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    // Проверяем возможность использования кэша
    if (config.cacheKey && !config.forceRefresh) {
      const cachedData = await this.getFromCache<T>(config.cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await this.executeRequest<T>({
        method: 'GET',
        url,
        ...config,
      });

      // Сохраняем результат в кэш, если указан ключ кэширования
      if (config.cacheKey) {
        this.saveToCache<T>(config.cacheKey, response.data, config.cacheDuration);
      }

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Выполнение POST запроса
   */
  public async post<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    try {
      const response = await this.executeRequest<T>({
        method: 'POST',
        url,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Выполнение PUT запроса
   */
  public async put<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    try {
      const response = await this.executeRequest<T>({
        method: 'PUT',
        url,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Выполнение DELETE запроса
   */
  public async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    try {
      const response = await this.executeRequest<T>({
        method: 'DELETE',
        url,
        ...config,
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Пакетное получение данных по нескольким запросам
   */
  public async batchGet<T = unknown>(
    requests: Array<{ url: string; config?: RequestConfig }>
  ): Promise<T[]> {
    const promises = requests.map(({ url, config }) => this.get<unknown>(url, config));
    try {
      const results = await Promise.all(promises);
      return results as T[];
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Очистка кэша
   */
  public async clearCache(cacheKey?: string): Promise<void> {
    try {
      if (cacheKey) {
        await AsyncStorage.removeItem(`api_cache_${cacheKey}`);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith('api_cache_'));
        if (cacheKeys.length > 0) {
          await AsyncStorage.multiRemove(cacheKeys);
        }
      }
    } catch (error) {
      logger.error('Failed to clear cache', { error });
    }
  }

  /**
   * Получение статистики кэширования
   */
  public async getCacheStats(): Promise<{ itemCount: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('api_cache_'));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      return {
        itemCount: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      return { itemCount: 0, totalSize: 0 };
    }
  }

  /**
   * Реализация логики обновления токенов авторизации
   * @returns Новый токен авторизации или null
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      logger.info('Начинаем процесс обновления токена');

      // Получаем refresh token из хранилища
      const refreshToken = await AsyncStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        logger.warn('Отсутствует refresh token, обновление невозможно');
        throw new AuthenticationError('Отсутствует токен обновления', 401);
      }

      // Запрос на обновление токена
      const response = await axios.post(
        `${this.baseUrl}/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // Увеличенный таймаут для критичной операции
        }
      );

      if (!response.data || !response.data.token) {
        logger.error('Некорректный ответ от сервера при обновлении токена', { response });
        throw new AuthenticationError('Некорректный ответ сервера', 500);
      }

      const { token, refreshToken: newRefreshToken } = response.data;

      // Сохраняем новые токены
      await AsyncStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token);
      if (newRefreshToken) {
        await AsyncStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, newRefreshToken);
      }

      // Устанавливаем новый токен для запросов
      this.setAuthToken(token);

      logger.info('Токен успешно обновлен');
      return token;
    } catch (error) {
      // Обрабатываем ошибки в зависимости от их типа
      logger.error('Ошибка при обновлении токена', { error });

      if (error instanceof AxiosError) {
        // Обрабатываем ошибку от сервера
        if (error.response) {
          const status = error.response.status;

          // Если ошибка авторизации или неверный refresh token
          if (status === 401 || status === 403) {
            // Токен недействителен - очищаем хранилище
            await AsyncStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
            await AsyncStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
            this.setAuthToken(null);

            // Вызываем колбэк для выхода из системы
            if (this.onAuthenticationFailed) {
              this.onAuthenticationFailed();
            }

            throw new AuthenticationError('Требуется повторная авторизация', status);
          }
        }
      }

      // Другие ошибки
      throw error;
    }
  }

  /**
   * Принудительное обновление токена с повторными попытками
   */
  public async refreshAuthToken(): Promise<string | null> {
    // Если обновление токена уже в процессе, возвращаем существующий Promise
    if (this.tokenRefreshInProgress) {
      logger.debug('Обновление токена уже выполняется, возвращаем существующий Promise');
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshInProgress = true;

    // Определяем стратегию повторных попыток
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelayMs = 1000;

    const performRetry = async (): Promise<string | null> => {
      try {
        return await this.performTokenRefresh();
      } catch (error) {
        // Если исчерпали все попытки, выходим с ошибкой
        if (retryCount >= maxRetries) {
          logger.error(`Исчерпаны все попытки (${maxRetries}) обновления токена`);
          throw error;
        }

        // Если ошибка связана с сетью или сервером, делаем повторную попытку
        if (
          error instanceof AxiosError &&
          (error.code === 'ECONNABORTED' ||
            error.code === 'ERR_NETWORK' ||
            (error.response && error.response.status >= 500))
        ) {
          retryCount++;
          const delay = retryDelayMs * retryCount;

          logger.info(`Повторная попытка ${retryCount} обновления токена через ${delay}мс`);

          // Пауза перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, delay));
          return performRetry();
        }

        // Если ошибка авторизации, не повторяем
        throw error;
      }
    };

    try {
      this.tokenRefreshPromise = performRetry();
      const newToken = await this.tokenRefreshPromise;
      return newToken;
    } finally {
      this.tokenRefreshInProgress = false;
      this.tokenRefreshPromise = null;
    }
  }

  // Приватные методы
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(`api_cache_${key}`);

      if (!cachedData) {
        return null;
      }

      const cacheEntry: CacheEntry<T> = JSON.parse(cachedData);
      const now = Date.now();

      // Проверяем срок годности кэша
      if (cacheEntry.expiresAt > now) {
        logger.debug(`Cache hit for ${key}`);
        return cacheEntry.data;
      } else {
        // Кэш устарел
        await AsyncStorage.removeItem(`api_cache_${key}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error reading from cache for key ${key}`, { error });
      return null;
    }
  }

  private async saveToCache<T>(key: string, data: T, duration?: number): Promise<void> {
    try {
      const now = Date.now();
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + (duration || this.defaultCacheDuration),
      };

      await AsyncStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      logger.error(`Error saving to cache for key ${key}`, { error });
    }
  }

  private setupInterceptors(): void {
    // Перехватчик запросов
    this.axiosInstance.interceptors.request.use(
      config => {
        // Добавляем токен авторизации, если есть
        if (this.authToken) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Перехватчик ответов
    this.axiosInstance.interceptors.response.use(
      response => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Если ошибка 401 (неавторизован) и не пытались обновить токен для этого запроса
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !(originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry
        ) {
          if (!this.tokenRefreshInProgress) {
            this.tokenRefreshInProgress = true;
            this.tokenRefreshPromise = this.performTokenRefresh();
          }

          try {
            // Ждем результат обновления токена
            const newToken = await this.tokenRefreshPromise;

            if (newToken && originalRequest) {
              // Помечаем запрос как повторную попытку
              (originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry = true;

              // Обновляем заголовок и повторяем запрос
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            logger.error('Token refresh failed:', { error: refreshError });
            // Здесь можно добавить логику выхода пользователя из системы
          } finally {
            this.tokenRefreshInProgress = false;
            this.tokenRefreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;

      // Если мы были оффлайн, а теперь подключились
      if (this.offline && isConnected) {
        this.offline = false;
        this.processOfflineQueue();
      }

      // Обновляем статус сети
      this.offline = !isConnected;
    });
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) {
      return;
    }

    logger.info(`Processing offline queue: ${this.offlineQueue.length} requests`);

    // Копируем очередь и очищаем оригинальную
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        const response = await this.executeRequest(item.config);
        item.resolve(response.data);
      } catch (error: unknown) {
        item.reject(this.handleApiError(error));
      }
    }
  }

  private async executeRequest<T>(config: RequestConfig): Promise<AxiosResponse<T>> {
    const { retries = this.maxRetries, retryDelay = this.retryDelay, ...axiosConfig } = config;

    // Если мы оффлайн, добавляем запрос в очередь (кроме GET запросов с доступным кэшем)
    if (this.offline && !(config.method === 'GET' && config.cacheKey)) {
      return new Promise<AxiosResponse<T>>((resolve, reject) => {
        this.offlineQueue.push({
          config,
          resolve: data =>
            resolve({
              data,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            } as AxiosResponse<T>),
          reject,
        });
        logger.info(`Added request to offline queue: ${config.method} ${config.url}`);
      });
    }

    try {
      return await this.axiosInstance.request<T>(axiosConfig);
    } catch (error) {
      // Если можно повторить и не исчерпали попытки
      if (retries > 0 && this.shouldRetryRequest(error)) {
        // Задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        // Выполняем повторный запрос с уменьшенным количеством повторов
        return this.executeRequest<T>({
          ...config,
          retries: retries - 1,
          retryDelay: retryDelay * 2, // Увеличиваем задержку для следующей попытки
        });
      }

      throw error;
    }
  }

  private shouldRetryRequest(error: unknown): boolean {
    // Повторяем запрос при сетевых ошибках или ошибках сервера (5xx)
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    return (
      !status || // Сетевая ошибка без статуса
      status >= 500 || // Ошибка сервера
      status === 429
    ); // Too Many Requests
  }

  private handleApiError(error: unknown): ApiErrorResponse {
    let errorResponse: ApiErrorResponse = {
      status: 500,
      message: 'Произошла неизвестная ошибка',
      code: 'UNKNOWN_ERROR',
      originalError: error instanceof Error ? error : new Error(String(error)),
    };

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Record<string, unknown>>;

      if (axiosError.response) {
        // Ответ получен, но с ошибкой
        const responseData = axiosError.response.data || {};
        errorResponse = {
          status: axiosError.response.status,
          message: (responseData.message as string) || 'Ошибка запроса',
          code: (responseData.code as string) || `ERROR_${axiosError.response.status}`,
          details: responseData,
          originalError: error,
        };
      } else if (axiosError.request) {
        // Запрос отправлен, но ответ не получен
        errorResponse = {
          status: 0,
          message: 'Сервер не отвечает или проблемы с сетью',
          code: 'NETWORK_ERROR',
          originalError: error,
        };
      }
    }

    // Логируем ошибку
    const axiosError = error as AxiosError;
    logger.error('API error:', {
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      status: errorResponse.status,
      message: errorResponse.message,
      code: errorResponse.code,
    });

    return errorResponse;
  }

  // Устанавливаем обработчик для ошибок авторизации
  public setAuthenticationFailedCallback(callback: () => void): void {
    this.onAuthenticationFailed = callback;
  }
}

// Экспортируем singleton экземпляр
export const apiService = ApiService.getInstance();

// Метод для тестирования
export const createApiService = (config: ApiServiceConfig) => ApiService.getInstance(config);
