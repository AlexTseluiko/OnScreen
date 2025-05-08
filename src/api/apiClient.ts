import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, MAX_RETRY_ATTEMPTS, RETRY_DELAY, ENABLE_API_LOGGING } from '../config';
import { userStorage } from '../utils/userStorage';
import { API_BASE_URL as oldAPI_BASE_URL, getAuthToken, setAuthToken } from './config';
import NetInfo from '@react-native-community/netinfo';
import { authApi } from './auth';
import { ApiClient, GetUsersParams, GetArticlesParams, GetClinicsParams, CreateReviewParams, UpdateUserRoleParams, ToggleUserStatusParams } from './types';
import { LoginCredentials, RegisterData, User } from '../types/user';
import { ApiResponse } from '../types/api';

// Флаг, чтобы избежать множественных попыток обновления токена одновременно
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
const failedQueue: any[] = [];

// Функция для обработки запросов в очереди
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue.length = 0;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  _retry?: boolean; // Флаг повторного запроса
}

export class ApiError extends Error {
  status: number;
  data: any;
  isConnectionError: boolean;

  constructor(message: string, status: number, data?: any, isConnectionError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isConnectionError = isConnectionError;
  }
}

// Функция для диагностики проблем сетевого соединения
const diagnoseProblem = async (error: Error): Promise<string> => {
  try {
    console.log('Диагностика соединения...');
    const netInfo = await NetInfo.fetch();
    
    // Первая проверка - подключение к сети
    const networkState = netInfo.isConnected 
      ? 'подключен к сети' 
      : 'нет соединения с сетью';
    
    console.log(`Состояние сети: ${networkState}`);
    console.log(`Тип соединения: ${netInfo.type}`);
    console.log(`Детали: ${JSON.stringify(netInfo.details)}`);
    console.log(`Используемый URL API: ${oldAPI_BASE_URL}`);
    
    // Проверяем доступность сервера напрямую через fetch с явным localhost
    try {
      console.log('Пробуем доступ к localhost:5000...');
      const localResponse = await fetch('http://localhost:5000/api/health', { 
        method: 'GET', 
        signal: AbortSignal.timeout(2000) 
      });
      console.log(`Localhost доступен, статус: ${localResponse.status}`);
    } catch (e) {
      console.log(`Localhost недоступен: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    // Проверяем с IP-адресом
    try {
      console.log('Пробуем доступ с IP...');
      const ipResponse = await fetch('http://192.168.31.250:5000/api/health', { 
        method: 'GET', 
        signal: AbortSignal.timeout(2000) 
      });
      console.log(`IP доступен, статус: ${ipResponse.status}`);
    } catch (e) {
      console.log(`IP недоступен: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'Возможно, сервер не запущен или не доступен по указанному адресу. Проверьте, что бэкенд запущен и слушает на нужном порту.';
    }
    
    return 'Не удалось точно определить причину проблемы. Проверьте логи и сетевые настройки.';
  } catch (diagError) {
    console.log('Ошибка диагностики:', diagError);
    return 'Ошибка при выполнении диагностики';
  }
};

// Функция для проверки доступности сервера
const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      console.log('Нет подключения к сети');
      return false;
    }
    
    // Проверяем доступность сервера через ping-запрос
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      const response = await fetch(`${oldAPI_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('Сервер недоступен:', error);
      return false;
    }
  } catch (error) {
    console.log('Ошибка при проверке доступности сервера:', error);
    return false;
  }
};

class ApiClientImpl implements ApiClient {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private retryCount: number = 0;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await userStorage.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          if (ENABLE_API_LOGGING) {
            console.log('API Request:', {
              method: config.method,
              url: config.url,
              headers: config.headers,
              data: config.data,
            });
          }

          return config;
        } catch (error) {
          console.error('Request interceptor error:', error);
          return Promise.reject(error);
        }
      },
      (error) => {
        if (ENABLE_API_LOGGING) {
          console.error('API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        if (ENABLE_API_LOGGING) {
          console.log('API Response:', {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        if (ENABLE_API_LOGGING) {
          console.error('API Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Проверяем доступность сервера
        const isServerAvailable = await checkServerAvailability();
        if (!isServerAvailable) {
          const diagnosis = await diagnoseProblem(error);
          throw new ApiError(
            'Сервер недоступен. ' + diagnosis,
            503,
            null,
            true
          );
        }

        if (error.response?.status === 401 && !error.config._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                error.config.headers.Authorization = `Bearer ${token}`;
                return this.api(error.config);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          error.config._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = await userStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const { token } = await authApi.refreshToken(refreshToken);
            await userStorage.saveToken(token);
            
            error.config.headers.Authorization = `Bearer ${token}`;
            processQueue(null, token);
            
            return this.api(error.config);
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  // Users
  async getUsers(params: GetUsersParams) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async updateUserRole({ userId, role }: UpdateUserRoleParams) {
    await this.api.put(`/users/${userId}/role`, { role });
  }

  async toggleUserStatus({ userId, isBlocked }: ToggleUserStatusParams) {
    await this.api.put(`/users/${userId}/status`, { isBlocked });
  }

  async deleteUser(userId: string) {
    await this.api.delete(`/users/${userId}`);
  }

  // Articles
  async getArticles(params: GetArticlesParams) {
    const response = await this.api.get('/articles', { params });
    return response.data;
  }

  async getArticleById(id: string) {
    const response = await this.api.get(`/articles/${id}`);
    return response.data;
  }

  async createArticle(article: any) {
    const response = await this.api.post('/articles', article);
    return response.data;
  }

  async updateArticle(id: string, article: any) {
    const response = await this.api.put(`/articles/${id}`, article);
    return response.data;
  }

  async deleteArticle(id: string) {
    await this.api.delete(`/articles/${id}`);
  }

  // Clinics
  async getClinics(params: GetClinicsParams) {
    const response = await this.api.get('/clinics', { params });
    return response.data;
  }

  async getClinicById(id: string) {
    const response = await this.api.get(`/clinics/${id}`);
    return response.data;
  }

  async createClinic(clinic: any) {
    const response = await this.api.post('/clinics', clinic);
    return response.data;
  }

  async updateClinic(id: string, clinic: any) {
    const response = await this.api.put(`/clinics/${id}`, clinic);
    return response.data;
  }

  async deleteClinic(id: string) {
    await this.api.delete(`/clinics/${id}`);
  }

  async createReview(clinicId: string, review: CreateReviewParams) {
    const response = await this.api.post(`/clinics/${clinicId}/reviews`, review);
    return response.data;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  }

  // Аутентификация
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClientImpl();

// Модуль API для работы со статьями
export const articlesApi = {
  // Получение списка статей с фильтрацией и пагинацией
  getArticles: async (params: { 
    page?: number, 
    limit?: number, 
    category?: string, 
    tag?: string, 
    search?: string,
    published?: boolean 
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.search) queryParams.append('search', params.search);
    if (params.published !== undefined) queryParams.append('published', params.published.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },
  
  // Получение статьи по ID
  getArticleById: async (articleId: string) => {
    return apiClient.get(`/articles/${articleId}`);
  },
  
  // Создание новой статьи (для админа/доктора)
  createArticle: async (articleData: {
    title: string,
    content: string,
    category: string,
    tags?: string[],
    imageUrl?: string,
    published?: boolean
  }) => {
    return apiClient.post('/articles', articleData);
  },
  
  // Обновление статьи (для админа/доктора)
  updateArticle: async (
    articleId: string, 
    articleData: {
      title?: string,
      content?: string,
      category?: string,
      tags?: string[],
      imageUrl?: string,
      published?: boolean
    }
  ) => {
    return apiClient.put(`/articles/${articleId}`, articleData);
  },
  
  // Удаление статьи (для админа/доктора)
  deleteArticle: async (articleId: string) => {
    return apiClient.delete(`/articles/${articleId}`);
  }
}; 