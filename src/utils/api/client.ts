import { ApiClient, ApiRequestConfig, ApiResponse } from './types';
import { ApiErrorHandler } from './errorHandler';
import { API_STATUS } from '../../constants/api';

export class BaseApiClient implements ApiClient {
  private baseUrl: string;
  private defaultConfig: ApiRequestConfig;

  constructor(baseUrl: string, defaultConfig: ApiRequestConfig = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      retry: true,
      maxRetries: 3,
      delay: 1000,
      timeout: 30000,
      ...defaultConfig,
    };
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const fullUrl = `${this.baseUrl}${url}`;

    const operation = async () => {
      try {
        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return {
          data: responseData,
          status: API_STATUS.SUCCESS,
        };
      } catch (error) {
        // Перехватываем ошибки fetch внутри operation
        throw error;
      }
    };

    try {
      if (finalConfig.retry) {
        return await ApiErrorHandler.retry(operation, finalConfig.maxRetries, finalConfig.delay);
      }
      return await operation();
    } catch (error) {
      const handledError = ApiErrorHandler.handle(error);
      return {
        data: null as unknown as T,
        status: API_STATUS.ERROR,
        error: handledError.message,
      };
    }
  }

  async get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}
