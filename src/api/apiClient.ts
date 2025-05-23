import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_URL, API_CONFIG } from '../config/api';
import {
  ApiClient,
  GetUsersParams,
  GetArticlesParams,
  GetClinicsParams,
  CreateReviewParams,
  UpdateUserRoleParams,
  ToggleUserStatusParams,
} from './types';
import { LoginCredentials, RegisterData, User } from '../types/user';
import { ApiResponse, PaginationData } from '../types/api';
import { Article } from '../types/article';
import { Clinic } from '../types/clinic';
import { performanceMonitor } from '../utils/performance';
import { logger } from '../utils/logger';
import { networkManager } from '../utils/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Используем API_URL из импортированного конфига вместо повторного определения
// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL;
console.log('apiClient использует BASE_URL:', BASE_URL);

// Токен для AsyncStorage
const TOKEN_KEY = '@token';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для добавления токена к запросам
apiClient.interceptors.request.use(
  async config => {
    try {
      // Получаем токен из AsyncStorage
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      // Если токен существует, добавляем его в заголовок Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Токен добавлен к запросу:', config.url);
      } else {
        console.log('Токен не найден для запроса:', config.url);
      }
    } catch (error) {
      console.error('Ошибка при получении токена из AsyncStorage:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Константы для настройки повторных попыток
const RETRY_DELAY = 1000; // Задержка между повторными попытками (1 секунда)
const MAX_RETRY_ATTEMPTS = 3; // Максимальное количество повторных попыток
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Коды HTTP для повторных попыток

// Тип для ответов API с данными ошибок
interface ErrorResponseData {
  message?: string;
  error?: string | object;
  code?: string;
  details?: Record<string, unknown>;
}

// Добавляем перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & {
      _retry?: number; // Счетчик повторных попыток
    };

    // Не повторяем запросы для 4xx ошибок (кроме тех, что указаны в RETRY_STATUS_CODES)
    const status = error.response?.status;

    // Логируем все ошибки API
    logger.error('API Error:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      status: status || 'No Response',
      message: error.message,
    });

    // Проверяем, можем ли мы повторить запрос
    if (
      config &&
      (!config._retry || config._retry < MAX_RETRY_ATTEMPTS) &&
      ((status && RETRY_STATUS_CODES.includes(status)) || !error.response)
    ) {
      // Увеличиваем счетчик попыток
      config._retry = (config._retry || 0) + 1;

      // Логируем повторную попытку
      logger.info(`Retrying API request (attempt ${config._retry}/${MAX_RETRY_ATTEMPTS})`, {
        url: config.url,
        method: config.method?.toUpperCase(),
      });

      // Добавляем экспоненциальную задержку перед повторной попыткой
      const delay = RETRY_DELAY * Math.pow(2, config._retry - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Повторяем запрос
      return apiClient(config);
    }

    // Формируем понятное сообщение об ошибке
    let errorMessage: string;
    let errorCode: string;
    let errorDetails: Record<string, unknown> | undefined;

    if (error.response) {
      // Ошибка от сервера с ответом
      const responseData = error.response.data as ErrorResponseData;

      if (typeof responseData === 'object' && responseData !== null) {
        errorMessage =
          responseData.message ||
          (responseData.error && typeof responseData.error === 'string'
            ? responseData.error
            : '') ||
          'Ошибка сервера';
        errorCode = responseData.code || `HTTP_${error.response.status}`;
        errorDetails = responseData.details;
      } else {
        errorMessage = 'Ошибка сервера';
        errorCode = `HTTP_${error.response.status}`;
      }
    } else if (error.request) {
      // Запрос был сделан, но ответа не получено
      errorMessage = 'Нет ответа от сервера';
      errorCode = 'NO_RESPONSE';

      // Проверяем соединение с интернетом
      if (!networkManager.isOnline()) {
        errorMessage = 'Отсутствует соединение с интернетом';
        errorCode = 'NETWORK_ERROR';
      }
    } else {
      // Ошибка при настройке запроса
      errorMessage = error.message || 'Неизвестная ошибка';
      errorCode = 'REQUEST_SETUP_ERROR';
    }

    // Создаем расширенный объект ошибки
    const apiError = {
      message: errorMessage,
      code: errorCode,
      status: error.response?.status || 0,
      details: errorDetails,
      originalError: error,
    };

    return Promise.reject(apiError);
  }
);

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  isConnectionError: boolean;
  code: string;

  constructor(
    message: string,
    status: number,
    code: string = 'UNKNOWN_ERROR',
    data?: Record<string, unknown>,
    isConnectionError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data || {};
    this.isConnectionError = isConnectionError;
  }
}

export class ApiClientImpl implements ApiClient {
  private client: AxiosInstance;
  private retryQueue: Map<string, { timestamp: number; retryCount: number }> = new Map();

  constructor(config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_CONFIG.TIMEOUT,
      ...config,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Обработка истечения срока действия токена
          // Здесь можно добавить логику обновления токена перед удалением
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            try {
              // Пытаемся обновить токен
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              if (response.data.token) {
                // Сохраняем новые токены
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);

                // Повторяем исходный запрос с новым токеном
                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              // Если не удалось обновить токен, выходим из системы
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
              return Promise.reject(error);
            }
          } else {
            // Если нет refreshToken, выходим сразу
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await this.client.get<T>(url, config);
      performanceMonitor.recordApiCall(url, 'GET', performance.now() - startTime);
      return response.data;
    } catch (error) {
      performanceMonitor.recordApiError(url, 'GET', error);
      throw this.processError(error, url);
    }
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await this.client.post<T>(url, data, config);
      performanceMonitor.recordApiCall(url, 'POST', performance.now() - startTime);
      return response.data;
    } catch (error) {
      performanceMonitor.recordApiError(url, 'POST', error);
      throw this.processError(error, url);
    }
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await this.client.put<T>(url, data, config);
      performanceMonitor.recordApiCall(url, 'PUT', performance.now() - startTime);
      return response.data;
    } catch (error) {
      performanceMonitor.recordApiError(url, 'PUT', error);
      throw this.processError(error, url);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const startTime = performance.now();
    try {
      const response = await this.client.delete<T>(url, config);
      performanceMonitor.recordApiCall(url, 'DELETE', performance.now() - startTime);
      return response.data;
    } catch (error) {
      performanceMonitor.recordApiError(url, 'DELETE', error);
      throw this.processError(error, url);
    }
  }

  /**
   * Обрабатывает ошибку и форматирует ее в стандартный формат ApiError
   */
  private processError(error: unknown, url: string): ApiError {
    // Если это уже наш ApiError, возвращаем его
    if (error instanceof ApiError) {
      return error;
    }

    let message = 'Неизвестная ошибка';
    let status = 0;
    let code = 'UNKNOWN_ERROR';
    let data: Record<string, unknown> = {};
    let isConnectionError = false;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<unknown>;

      if (axiosError.response) {
        // Ошибка с ответом от сервера
        status = axiosError.response.status;

        // Пытаемся получить сообщение из ответа
        if (axiosError.response.data) {
          const responseData = axiosError.response.data as ErrorResponseData;
          message =
            responseData.message ||
            (responseData.error && typeof responseData.error === 'string'
              ? responseData.error
              : '') ||
            `HTTP Error ${status}`;
          code = responseData.code || `HTTP_${status}`;
          data = responseData.details || {};
        } else {
          message = `HTTP Error ${status}`;
          code = `HTTP_${status}`;
        }
      } else if (axiosError.request) {
        // Запрос был сделан, но ответа не получено
        status = 0;
        message = 'No response from server';
        code = 'NO_RESPONSE';
        isConnectionError = true;

        // Проверяем соединение с интернетом
        if (!networkManager.isOnline()) {
          message = 'No internet connection';
          code = 'NETWORK_ERROR';
        }
      } else {
        // Что-то случилось при настройке запроса
        status = 0;
        message = axiosError.message || 'Request configuration error';
        code = 'REQUEST_SETUP_ERROR';
      }
    } else if (error instanceof Error) {
      // Общая ошибка JavaScript
      status = 0;
      message = error.message;
      code = 'JS_ERROR';
    }

    logger.error(`API Error [${url}]: ${message}`, {
      status,
      code,
      data,
    });

    return new ApiError(message, status, code, data, isConnectionError);
  }

  // Users
  async getUsers(
    params: GetUsersParams
  ): Promise<ApiResponse<{ users: User[]; pagination?: PaginationData }>> {
    return this.get('/users', { params });
  }

  async updateUserRole({ userId, role }: UpdateUserRoleParams): Promise<void> {
    await this.put(`/users/${userId}/role`, { role });
  }

  async toggleUserStatus({ userId, isBlocked }: ToggleUserStatusParams): Promise<void> {
    await this.put(`/users/${userId}/status`, { isBlocked });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.delete(`/users/${userId}`);
  }

  // Articles
  async getArticles(
    params: GetArticlesParams
  ): Promise<ApiResponse<{ articles: Article[]; pagination?: PaginationData }>> {
    return this.get('/articles', { params });
  }

  async getArticleById(id: string): Promise<ApiResponse<{ article: Article }>> {
    return this.get(`/articles/${id}`);
  }

  async createArticle(
    article: Omit<Article, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ article: Article }>> {
    return this.post('/articles', article);
  }

  async updateArticle(
    id: string,
    article: Partial<Article>
  ): Promise<ApiResponse<{ article: Article }>> {
    return this.put(`/articles/${id}`, article);
  }

  async deleteArticle(id: string): Promise<void> {
    await this.delete(`/articles/${id}`);
  }

  // Clinics
  async getClinics(
    params: GetClinicsParams
  ): Promise<ApiResponse<{ clinics: Clinic[]; pagination?: PaginationData }>> {
    return this.get('/clinics', { params });
  }

  async getClinicById(id: string): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.get(`/clinics/${id}`);
  }

  async createClinic(
    clinic: Omit<Clinic, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.post('/clinics', clinic);
  }

  async updateClinic(
    id: string,
    clinic: Partial<Clinic>
  ): Promise<ApiResponse<{ clinic: Clinic }>> {
    return this.put(`/clinics/${id}`, clinic);
  }

  async deleteClinic(id: string): Promise<void> {
    await this.delete(`/clinics/${id}`);
  }

  async createReview(
    clinicId: string,
    review: CreateReviewParams
  ): Promise<ApiResponse<{ review: unknown }>> {
    return this.post(`/clinics/${clinicId}/reviews`, review);
  }

  // Аутентификация
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    return this.post('/auth/login', credentials);
  }

  async register(
    data: RegisterData
  ): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    return this.post('/auth/register', data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post('/auth/logout');
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return this.post('/auth/refresh', { refreshToken });
  }
}
