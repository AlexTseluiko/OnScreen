import { apiClient } from './apiClient';
import { User, UserRole } from '../types/auth';
import { userStorage } from '../utils/userStorage';
import { API_BASE_URL, ENABLE_API_LOGGING } from '../config';

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
      console.log('Attempting login with email:', email);
      
      if (!email || !password) {
        throw new AuthError('Пожалуйста, заполните все обязательные поля', 400, 'missing_fields');
      }

      const response = await apiClient.post<{ user: User; token: string; refreshToken: string }>('/auth/login', {
        email: email.trim(),
        password
      });

      if (!response.data || !response.data.user || !response.data.token) {
        throw new AuthError('Неверный формат ответа от сервера', 500, 'invalid_response');
      }

      console.log('Login successful, saving user data');
      await userStorage.saveUserData({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken
      });

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        console.log('Server response:', { status, data });
        
        if (status === 500) {
          throw new AuthError(
            'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.',
            status,
            'server_error'
          );
        }
        
        throw new AuthError(
          data.message || 'Ошибка авторизации',
          status,
          data.code || 'unknown'
        );
      }
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      if (error.message?.includes('Network Error')) {
        throw new AuthError(
          'Проблема с подключением к серверу. Проверьте ваше интернет-соединение.',
          0,
          'network_error'
        );
      }
      
      throw new AuthError(
        'Произошла ошибка при попытке входа',
        500,
        'unknown'
      );
    }
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
      console.log('Attempting registration with email:', data.email);
      
      if (!data.email || !data.password || !data.name || !data.role) {
        throw new AuthError('Пожалуйста, заполните все обязательные поля', 400, 'missing_fields');
      }

      const response = await apiClient.post<{ user: User; token: string; refreshToken: string }>('/auth/register', data);
      
      console.log('Registration successful, saving user data');
      await userStorage.saveUserData({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken
      });

      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        console.log('Server response:', { status, data });
        
        throw new AuthError(
          data.message || 'Ошибка регистрации',
          status,
          data.code || 'unknown'
        );
      }
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError(
        'Произошла ошибка при попытке регистрации',
        500,
        'unknown'
      );
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('Attempting logout');
      await apiClient.post('/auth/logout');
      console.log('Logout successful, removing user data');
      await userStorage.removeUserData();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Даже если запрос не удался, удаляем данные пользователя
      await userStorage.removeUserData();
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      console.log('Getting current user');
      const response = await apiClient.get<AuthResponse['user']>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async verifyToken(): Promise<boolean> {
    try {
      console.log('Verifying auth token...');
      const response = await apiClient.get<{valid: boolean}>('/auth/verify');
      console.log('Token verification result:', response.data.valid);
      return response.data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      console.log('Attempting to refresh token');
      
      if (!refreshToken) {
        throw new AuthError('Отсутствует токен обновления', 400, 'missing_refresh_token');
      }

      const response = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
        refreshToken
      });

      console.log('Token refresh successful');
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        console.log('Server response:', { status, data });
        
        throw new AuthError(
          data.message || 'Ошибка обновления токена',
          status,
          data.code || 'unknown'
        );
      }
      
      if (error instanceof AuthError) {
        throw error;
      }
      
      throw new AuthError(
        'Произошла ошибка при обновлении токена',
        500,
        'unknown'
      );
    }
  },

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{exists: boolean}>(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<{message: string}> {
    try {
      console.log('Отправка запроса на сброс пароля для:', email);
      const response = await apiClient.post<{message: string}>('/auth/forgot-password', { email });
      console.log('Запрос на сброс пароля отправлен успешно:', response.data.message);
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке запроса на сброс пароля:', error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string): Promise<{message: string}> {
    try {
      console.log('Запрос на установку нового пароля');
      const response = await apiClient.post<{message: string}>('/auth/reset-password', { 
        token,
        password
      });
      console.log('Пароль успешно сброшен:', response.data.message);
      return response.data;
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      throw error;
    }
  }
}; 