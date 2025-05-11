import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, ApiErrorResponse } from '../api/apiService';
import { useError } from '../contexts/ErrorContext';
import { networkManager } from '../utils/network';
import { cache } from '../utils/cache';

// Состояния запроса
export type ApiRequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Константа для времени хранения кэша по умолчанию (5 минут)
export const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// Ключ для хранения кэшированных URL
const CACHED_URLS_KEY = 'api_cache_urls';

// Интерфейс для опций запроса
export interface ApiOptions<TResponse = Record<string, never>, TParams = Record<string, never>> {
  // URL или функция, возвращающая URL запроса
  url: string | ((params?: TParams) => string);

  // Тип запроса (GET, POST, PUT, DELETE)
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  // Включить автоматическую загрузку при монтировании компонента
  autoLoad?: boolean;

  // Начальные данные
  initialData?: TResponse;

  // Ключ для кэширования
  cacheKey?: string;

  // Длительность кэширования (в мс)
  cacheDuration?: number;

  // Принудительное обновление кэша
  forceRefresh?: boolean;

  // Преобразование данных ответа
  transformResponse?: (data: TResponse) => TResponse;

  // Обработчик ошибок
  onError?: (error: ApiErrorResponse) => void;

  // Обработчик успешного запроса
  onSuccess?: (data: TResponse) => void;

  // Зависимости, при изменении которых запрос будет выполнен заново
  deps?: unknown[];

  // Нужно ли выполнять запрос, даже если он уже в состоянии загрузки
  skipLoadingCheck?: boolean;

  // Функция для определения, нужно ли выполнять запрос
  shouldExecute?: () => boolean;

  // Показывать ошибки в глобальном контексте
  showGlobalError?: boolean;

  // Показывать уведомление об ошибке
  showErrorToast?: boolean;

  // Сохранять запрос для выполнения офлайн
  saveForOffline?: boolean;

  // Стратегия кэширования: 'cache-first' | 'network-first' | 'cache-only' | 'network-only'
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

// Результат хука useApi
export interface ApiResult<TResponse, TParams = Record<string, never>> {
  // Данные ответа
  data: TResponse | undefined;

  // Статус запроса
  status: ApiRequestStatus;

  // Ошибка, если есть
  error: ApiErrorResponse | null;

  // Признак загрузки
  isLoading: boolean;

  // Признак успешного запроса
  isSuccess: boolean;

  // Признак ошибки
  isError: boolean;

  // Функция для выполнения запроса с параметрами
  execute: (
    params?: TParams,
    requestData?: Record<string, never>
  ) => Promise<TResponse | undefined>;

  // Функция для сброса состояния
  reset: () => void;

  // Функция для принудительного обновления
  refresh: () => Promise<TResponse | undefined>;

  // Дата последнего обновления
  updatedAt: Date | null;

  // Информация о кэше
  cacheInfo: {
    isCached: boolean;
    cacheDate: Date | null;
    cacheExpiry: Date | null;
  };

  // Функция для очистки кэша
  clearCache: () => Promise<void>;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
  originalError?: Error;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Управление списком кэшированных URL
 */
const CacheManager = {
  // Получить список всех кэшированных URL
  async getCachedUrls(): Promise<string[]> {
    try {
      const urls = await cache.get<string[]>(CACHED_URLS_KEY);
      return urls || [];
    } catch (error) {
      console.error('Error getting cached URLs:', error);
      return [];
    }
  },

  // Добавить URL в список кэшированных
  async addCachedUrl(cacheKey: string): Promise<void> {
    try {
      const urls = await this.getCachedUrls();
      if (!urls.includes(cacheKey)) {
        urls.push(cacheKey);
        await cache.set(CACHED_URLS_KEY, urls);
      }
    } catch (error) {
      console.error('Error adding cached URL:', error);
    }
  },

  // Удалить URL из списка кэшированных
  async removeCachedUrl(cacheKey: string): Promise<void> {
    try {
      const urls = await this.getCachedUrls();
      const filteredUrls = urls.filter(url => url !== cacheKey);
      await cache.set(CACHED_URLS_KEY, filteredUrls);
    } catch (error) {
      console.error('Error removing cached URL:', error);
    }
  },

  // Очистить все кэшированные URL
  async clearAllCachedUrls(): Promise<void> {
    try {
      await cache.set(CACHED_URLS_KEY, []);
    } catch (error) {
      console.error('Error clearing cached URLs:', error);
    }
  },
};

/**
 * Хук для выполнения запросов к API с автоматическим управлением состоянием
 */
export function useApi<TResponse = Record<string, never>, TParams = Record<string, never>>(
  options: ApiOptions<TResponse, TParams>
): ApiResult<TResponse, TParams> {
  // Деструктурируем опции с значениями по умолчанию
  const {
    url,
    method = 'GET',
    autoLoad = true,
    initialData,
    cacheKey,
    cacheDuration = DEFAULT_CACHE_DURATION,
    forceRefresh = false,
    transformResponse,
    onError,
    onSuccess,
    deps = [],
    skipLoadingCheck = false,
    shouldExecute = () => true,
    showGlobalError = false,
    showErrorToast = false,
    saveForOffline = false,
    cacheStrategy = 'network-first',
  } = options;

  // Доступ к контексту обработки ошибок
  const { handleApiError, addGlobalError } = useError();

  // Состояние
  const [data, setData] = useState<TResponse | undefined>(initialData);
  const [status, setStatus] = useState<ApiRequestStatus>('idle');
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    isCached: boolean;
    cacheDate: Date | null;
    cacheExpiry: Date | null;
  }>({
    isCached: false,
    cacheDate: null,
    cacheExpiry: null,
  });

  // Ref для отслеживания монтирования компонента
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  // Коды состояния для удобства
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Функция для очистки кэша
  const clearCache = useCallback(async () => {
    if (cacheKey) {
      const actualCacheKey = typeof url === 'string' ? `${method}_${url}` : cacheKey;
      await cache.remove(actualCacheKey);
      await CacheManager.removeCachedUrl(actualCacheKey);

      setCacheInfo({
        isCached: false,
        cacheDate: null,
        cacheExpiry: null,
      });
    }
  }, [cacheKey, method, url]);

  // Функция сброса состояния
  const reset = useCallback(() => {
    setData(initialData);
    setStatus('idle');
    setError(null);
    setUpdatedAt(null);
  }, [initialData]);

  /**
   * Получение данных из кэша
   */
  const fetchFromCache = useCallback(
    async (
      requestUrl: string
    ): Promise<{
      data: TResponse | null;
      meta: { timestamp?: number; expiry?: number } | null;
    }> => {
      if (!cacheKey && method !== 'GET') return { data: null, meta: null };

      try {
        const actualCacheKey = cacheKey || `${method}_${requestUrl}`;
        const cachedData = await cache.get<{
          data: TResponse;
          timestamp: number;
          expiry: number;
        }>(actualCacheKey);

        if (cachedData) {
          return {
            data: cachedData.data,
            meta: {
              timestamp: cachedData.timestamp,
              expiry: cachedData.expiry,
            },
          };
        }
      } catch (error) {
        console.error('Error getting data from cache:', error);
      }

      return { data: null, meta: null };
    },
    [cacheKey, method]
  );

  /**
   * Сохранение данных в кэш
   */
  const saveToCache = useCallback(
    async (requestUrl: string, data: TResponse): Promise<void> => {
      if (!cacheKey && method !== 'GET') return;

      try {
        const actualCacheKey = cacheKey || `${method}_${requestUrl}`;
        const timestamp = Date.now();
        const expiry = timestamp + cacheDuration;

        await cache.set(
          actualCacheKey,
          {
            data,
            timestamp,
            expiry,
          },
          { expiry: cacheDuration }
        );

        await CacheManager.addCachedUrl(actualCacheKey);

        setCacheInfo({
          isCached: true,
          cacheDate: new Date(timestamp),
          cacheExpiry: new Date(expiry),
        });
      } catch (error) {
        console.error('Error saving data to cache:', error);
      }
    },
    [cacheKey, cacheDuration, method]
  );

  // Основная функция выполнения запроса
  const execute = useCallback(
    async (
      params?: TParams,
      requestData?: Record<string, never>
    ): Promise<TResponse | undefined> => {
      // Проверяем, нужно ли выполнять запрос
      if (!shouldExecute()) {
        return data;
      }

      // Проверяем, не выполняется ли уже запрос
      if (isLoading && !skipLoadingCheck) {
        return data;
      }

      // Прерываем предыдущий запрос, если есть
      if (abortController.current) {
        abortController.current.abort();
      }

      // Создаем новый контроллер отмены
      abortController.current = new AbortController();

      // Формируем URL запроса
      const requestUrl = typeof url === 'function' ? url(params) : url;

      // Стратегия кэширования
      if (cacheStrategy === 'cache-only' || cacheStrategy === 'cache-first') {
        const { data: cachedData, meta } = await fetchFromCache(requestUrl);

        if (cachedData) {
          setData(cachedData);
          setStatus('success');
          setError(null);
          setUpdatedAt(meta?.timestamp ? new Date(meta.timestamp) : new Date());

          setCacheInfo({
            isCached: true,
            cacheDate: meta?.timestamp ? new Date(meta.timestamp) : null,
            cacheExpiry: meta?.expiry ? new Date(meta.expiry) : null,
          });

          if (onSuccess) onSuccess(cachedData);

          if (cacheStrategy === 'cache-only') {
            return cachedData;
          }
        } else if (cacheStrategy === 'cache-only') {
          const error = {
            message: 'Данные не найдены в кэше',
            code: 'CACHE_MISS',
            status: 404,
          } as ApiErrorResponse;

          setError(error);
          setStatus('error');

          if (onError) onError(error);
          if (showGlobalError) addGlobalError(error);

          return undefined;
        }
      }

      // Устанавливаем состояние загрузки
      setStatus('loading');
      setError(null);

      try {
        // Проверяем соединение с интернетом
        const isOnline = networkManager.isOnline();

        // Если нет соединения и запрос нужно сохранить для выполнения офлайн
        if (!isOnline) {
          if (cacheStrategy === 'cache-first' && data) {
            return data;
          }

          if (saveForOffline) {
            await networkManager.addPendingRequest({
              method,
              url: requestUrl,
              data: requestData,
            });

            throw {
              message:
                'Нет соединения с интернетом. Запрос будет выполнен автоматически при восстановлении соединения.',
              code: 'NETWORK_ERROR',
              status: 0,
            };
          } else {
            throw {
              message: 'Нет соединения с интернетом',
              code: 'NETWORK_ERROR',
              status: 0,
            };
          }
        }

        // Конфигурация запроса
        const config = {
          signal: abortController.current.signal,
          forceRefresh: forceRefresh || cacheStrategy === 'network-only',
        };

        // Выполнение запроса в зависимости от метода
        let response: TResponse;
        switch (method) {
          case 'GET':
            response = await apiService.get<TResponse>(requestUrl, config);
            break;
          case 'POST':
            response = await apiService.post<TResponse>(requestUrl, requestData, config);
            break;
          case 'PUT':
            response = await apiService.put<TResponse>(requestUrl, requestData, config);
            break;
          case 'DELETE':
            response = await apiService.delete<TResponse>(requestUrl, config);
            break;
        }

        // Преобразование данных, если нужно
        const transformedData = transformResponse ? transformResponse(response) : response;

        // Если компонент всё ещё примонтирован, обновляем состояние
        if (isMounted.current) {
          setData(transformedData);
          setStatus('success');
          setError(null);
          setUpdatedAt(new Date());

          setCacheInfo({
            isCached: false,
            cacheDate: null,
            cacheExpiry: null,
          });

          // Сохраняем в кэш, если это GET-запрос или указан cacheKey
          if ((method === 'GET' || cacheKey) && cacheStrategy !== 'network-only') {
            await saveToCache(requestUrl, transformedData);
          }

          // Вызываем колбэк при успехе
          if (onSuccess) {
            onSuccess(transformedData);
          }
        }

        return transformedData;
      } catch (error) {
        // Форматируем ошибку
        const formattedError = formatErrorResponse(
          error as Error | string | Record<string, unknown>
        );

        // Если компонент всё ещё примонтирован, обновляем состояние
        if (isMounted.current) {
          setStatus('error');
          setError(formattedError);

          // Вызываем колбэк при ошибке
          if (onError) {
            onError(formattedError);
          }

          // Показываем глобальную ошибку, если нужно
          if (showGlobalError) {
            addGlobalError(formattedError);
          }

          // Показываем ошибку в тосте, если нужно
          if (showErrorToast) {
            handleApiError(formattedError, true);
          } else {
            handleApiError(formattedError, false);
          }
        }

        throw formattedError;
      }
    },
    [
      url,
      method,
      cacheKey,
      cacheStrategy,
      forceRefresh,
      transformResponse,
      onError,
      onSuccess,
      shouldExecute,
      skipLoadingCheck,
      showGlobalError,
      showErrorToast,
      saveForOffline,
      handleApiError,
      addGlobalError,
      saveToCache,
      fetchFromCache,
    ]
  );

  /**
   * Форматирует ошибку в стандартный формат ApiErrorResponse
   */
  const formatErrorResponse = (
    error: Error | string | Record<string, unknown>
  ): ApiErrorResponse => {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      'code' in error &&
      'message' in error
    ) {
      const apiError = error as unknown as ApiErrorResponse;
      return {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status,
        details: apiError.details,
        originalError: apiError.originalError,
      };
    }

    let errorObj: ApiErrorResponse = {
      message: 'Неизвестная ошибка',
      code: 'UNKNOWN_ERROR',
      status: 500,
    };

    if (error instanceof Error) {
      errorObj = {
        message: error.message,
        code: error.name || 'ERROR',
        status: 500,
        originalError: error,
      };
    } else if (typeof error === 'string') {
      errorObj = {
        message: error,
        code: 'ERROR',
        status: 500,
      };
    } else if (error && typeof error === 'object') {
      const errObj = error as Record<string, unknown>;
      errorObj = {
        message: (errObj.message as string) || 'Ошибка запроса',
        code: (errObj.code as string) || 'API_ERROR',
        status: (errObj.status as number) || 500,
        details: errObj.details as Record<string, unknown> | undefined,
        originalError: error instanceof Error ? error : undefined,
      };
    }

    return errorObj;
  };

  // Функция принудительного обновления
  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Эффект для выполнения запроса при монтировании и при изменении зависимостей
  useEffect(() => {
    isMounted.current = true;

    if (autoLoad) {
      execute();
    }

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, ...deps]);

  return {
    data,
    status,
    error,
    isLoading,
    isSuccess,
    isError,
    execute,
    reset,
    refresh,
    updatedAt,
    cacheInfo,
    clearCache,
  };
}

/**
 * Хук для пакетного выполнения запросов к API
 */
export function useBatchApi<TResponse = unknown>(
  requests: Array<ApiOptions<unknown, unknown>>,
  options: {
    onSuccess?: (results: TResponse[]) => void;
    onError?: (errors: Array<ApiErrorResponse | null>) => void;
    autoLoad?: boolean;
    deps?: unknown[];
  } = {}
) {
  const { onSuccess, onError, autoLoad = true, deps = [] } = options;

  // Состояние
  const [data, setData] = useState<TResponse[]>([]);
  const [status, setStatus] = useState<ApiRequestStatus>('idle');
  const [errors, setErrors] = useState<Array<ApiErrorResponse | null>>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Коды состояния для удобства
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Основная функция выполнения пакетного запроса
  const execute = useCallback(async (): Promise<TResponse[]> => {
    setStatus('loading');
    setErrors([]);

    try {
      // Формируем список запросов для apiService.batchGet
      const requestsList = requests.map(request => ({
        url: typeof request.url === 'function' ? request.url() : request.url,
        config: {
          cacheKey: request.cacheKey,
          cacheDuration: request.cacheDuration,
          forceRefresh: request.forceRefresh,
        },
      }));

      // Выполняем пакетный запрос
      const results = await apiService.batchGet<TResponse>(requestsList);

      // Обрабатываем результаты
      setData(results);
      setStatus('success');
      setUpdatedAt(new Date());

      // Вызываем обработчик успеха, если есть
      if (onSuccess) {
        onSuccess(results);
      }

      return results;
    } catch (err) {
      // Устанавливаем ошибки для всех запросов
      const apiErrors = new Array(requests.length).fill(err);
      setErrors(apiErrors);
      setStatus('error');

      // Вызываем обработчик ошибки, если есть
      if (onError) {
        onError(apiErrors);
      }

      return [];
    }
  }, [requests, onSuccess, onError]);

  // Функция для принудительного обновления
  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Автоматическая загрузка при монтировании или изменении зависимостей
  useEffect(() => {
    if (autoLoad) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, ...deps]);

  return {
    data,
    status,
    errors,
    isLoading,
    isSuccess,
    isError,
    execute,
    refresh,
    updatedAt,
  };
}
