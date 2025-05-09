import { AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api';

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return {
        success: false,
        message: 'Ошибка при входе',
      };
    }
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      return await response.json();
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return {
        success: false,
        message: 'Ошибка при регистрации',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw error;
    }
  },
};
