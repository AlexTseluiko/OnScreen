import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  isConnectionError: boolean;

  constructor(
    message: string,
    status: number,
    data?: Record<string, unknown>,
    isConnectionError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data || {};
    this.isConnectionError = isConnectionError;
  }
}

export class ApiClientImpl implements ApiClient {
  private client: AxiosInstance;

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
          localStorage.removeItem('token');
          window.location.href = '/login';
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
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
}

export const apiClient = new ApiClientImpl();
