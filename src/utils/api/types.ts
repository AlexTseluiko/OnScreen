import { API_STATUS } from '../../constants/api';

export interface ApiResponse<T> {
  data: T;
  status: (typeof API_STATUS)[keyof typeof API_STATUS];
  error?: string;
}

export interface ApiRequestConfig {
  retry?: boolean;
  maxRetries?: number;
  delay?: number;
  timeout?: number;
}

export interface ApiClient {
  get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data: unknown, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
}
