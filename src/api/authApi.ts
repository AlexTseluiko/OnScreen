import { AuthResponse } from '../types/auth';
import { User } from '../types/user';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config/api';

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при входе');
    }

    return response.json();
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при регистрации');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async updateProfile(
    userId: string,
    userData: Partial<User>,
    token: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.USER.PROFILE}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении профиля');
    }

    return response.json();
  },

  async uploadAvatar(userId: string, avatarUri: string, token: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: avatarUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await fetch(`${API_URL}${API_ENDPOINTS.USER.AVATAR}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Ошибка при загрузке аватара');
    }

    return response.json();
  },

  async resetPassword(email: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при сбросе пароля');
    }

    return response.json();
  },
};

// Интерфейс для ответа на обновление профиля
export interface UpdateProfileResponse extends AuthResponse {
  avatarUrl?: string;
}

/**
 * Обновляет профиль пользователя
 */
export const updateProfile = async (
  userId: string,
  userData: Partial<User>,
  token: string
): Promise<UpdateProfileResponse> => {
  try {
    const response = await axios.put<UpdateProfileResponse>(
      `${API_URL}${API_ENDPOINTS.USER.PROFILE}`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // @ts-expect-error - axios error handling
    const errorMessage = error.response?.data?.message || 'Ошибка обновления профиля';
    console.error('Ошибка при обновлении профиля:', errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Загружает аватар пользователя
 */
export const uploadAvatar = async (
  userId: string,
  avatarUri: string,
  token: string
): Promise<UpdateProfileResponse> => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: avatarUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await axios.post<UpdateProfileResponse>(
      `${API_URL}${API_ENDPOINTS.USER.AVATAR}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // @ts-expect-error - axios error handling
    const errorMessage = error.response?.data?.message || 'Ошибка загрузки аватара';
    console.error('Ошибка при загрузке аватара:', errorMessage);
    return { success: false, message: errorMessage };
  }
};
