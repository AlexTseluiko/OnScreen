import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';
import { User } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

// Определение ошибки для аутентификации
export class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

// Типы ответов API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  code?: string;
}

// Формат ответа при авторизации
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Методы работы с аутентификацией
export const authApi = {
  /**
   * Аутентификация пользователя
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Logging in user:', email);

      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });

      if (!response.data?.data || !response.data.data.token) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      // Сохраняем токены в локальное хранилище
      await AsyncStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.data.token);

      if (response.data.data.refreshToken) {
        await AsyncStorage.setItem(
          API_CONFIG.AUTH.REFRESH_TOKEN_KEY,
          response.data.data.refreshToken
        );
      }

      console.log('Login successful, token stored');
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        console.log('Server response:', { status, data });

        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка авторизации',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при авторизации', 500, 'unknown');
    }
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      console.log('Logging out user');

      // Удаляем токены из локального хранилища
      await AsyncStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
      await AsyncStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);

      console.log('Logout successful, tokens removed');
    } catch (error) {
      console.error('Logout error:', error);
      throw new AuthError('Произошла ошибка при выходе из системы', 500, 'unknown');
    }
  },

  /**
   * Регистрация нового пользователя
   */
  async register(userData: Partial<User>): Promise<AuthResponse> {
    try {
      console.log('Registering new user');

      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);

      if (!response.data?.data || !response.data.data.token) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      // Сохраняем токены в локальное хранилище
      await AsyncStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.data.token);

      if (response.data.data.refreshToken) {
        await AsyncStorage.setItem(
          API_CONFIG.AUTH.REFRESH_TOKEN_KEY,
          response.data.data.refreshToken
        );
      }

      console.log('Registration successful');
      return response.data.data;
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка регистрации',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при регистрации', 500, 'unknown');
    }
  },

  /**
   * Проверка валидности токена
   */
  async verifyToken(): Promise<boolean> {
    try {
      console.log('Verifying auth token...');
      const response = await apiClient.get<ApiResponse<{ valid: boolean }>>('/auth/verify');
      console.log('Token verification result:', response.data.success);
      return response.data.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  /**
   * Обновление токена
   */
  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    try {
      console.log('Attempting to refresh token');

      // Получаем текущий refresh token
      const refreshToken = await AsyncStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new AuthError('Отсутствует токен обновления', 400, 'missing_refresh_token');
      }

      const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
        '/auth/refresh',
        { refreshToken }
      );

      if (!response.data?.data || !response.data.data.token) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      // Сохраняем новые токены в хранилище
      await AsyncStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, response.data.data.token);

      if (response.data.data.refreshToken) {
        await AsyncStorage.setItem(
          API_CONFIG.AUTH.REFRESH_TOKEN_KEY,
          response.data.data.refreshToken
        );
      }

      console.log('Token refresh successful');
      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken || refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        console.log('Server response:', { status, data });

        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка обновления токена',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при обновлении токена', 500, 'unknown');
    }
  },

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(): Promise<User> {
    try {
      console.log('Getting current user');
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');

      if (!response.data || !response.data.success) {
        throw new AuthError('Не удалось получить данные пользователя', 500, 'invalid_response');
      }

      if (!response.data.data) {
        throw new AuthError('Данные пользователя отсутствуют', 500, 'invalid_response');
      }

      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка получения данных пользователя',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при получении данных пользователя', 500, 'unknown');
    }
  },

  /**
   * Проверка существования email
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      console.log('Checking if email exists:', email);
      const response = await apiClient.post<ApiResponse<{ exists: boolean }>>('/auth/check-email', {
        email,
      });

      if (!response.data?.data) {
        return false;
      }

      return response.data.data.exists;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  },

  /**
   * Запрос на восстановление пароля
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      console.log('Requesting password reset for:', email);
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        '/auth/forgot-password',
        {
          email,
        }
      );

      if (!response.data?.data) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      return response.data.data;
    } catch (error) {
      console.error('Forgot password error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка запроса сброса пароля',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при запросе сброса пароля', 500, 'unknown');
    }
  },

  /**
   * Сброс пароля
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      console.log('Resetting password');
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        '/auth/reset-password',
        {
          token,
          password,
        }
      );

      if (!response.data?.data) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      return response.data.data;
    } catch (error) {
      console.error('Reset password error:', error);

      if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;
        const errorData = data as ErrorResponse;
        throw new AuthError(
          errorData.message || 'Ошибка сброса пароля',
          status,
          errorData.code || 'unknown'
        );
      }

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('Произошла ошибка при сбросе пароля', 500, 'unknown');
    }
  },
};
