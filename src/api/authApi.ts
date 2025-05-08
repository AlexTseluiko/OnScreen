import { apiClient } from './apiClient';
import { User, UserRole } from '../types/auth';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, role: UserRole): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', { email, password, role });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    return response.data;
  }
}; 