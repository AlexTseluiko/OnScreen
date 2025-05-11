import { AuthResponse } from '../types/auth';
import { User } from '../types/user';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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

  async updateProfile(
    userId: string,
    userData: Partial<User>,
    token: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      return {
        success: false,
        message: 'Ошибка при обновлении профиля',
      };
    }
  },

  async uploadAvatar(userId: string, imageUri: string, token: string): Promise<AuthResponse> {
    try {
      // Создаем FormData для загрузки файла
      const formData = new FormData();

      // Получаем расширение файла из URI
      const fileName = imageUri.split('/').pop();
      const fileType = imageUri.split('.').pop();

      // @ts-expect-error - Добавляем изображение в FormData
      formData.append('avatar', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      });

      const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      return {
        success: false,
        message: 'Ошибка при загрузке аватара',
      };
    }
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
      `${API_URL}/users/${userId}`,
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
    // Создаем FormData для загрузки файла
    const formData = new FormData();

    // Добавляем файл изображения
    const filenameParts = avatarUri.split('/');
    const filename = filenameParts[filenameParts.length - 1];

    // @ts-expect-error - React Native FormData is different from standard FormData
    formData.append('avatar', {
      uri: avatarUri,
      name: filename,
      type: 'image/jpeg', // Предположим, что это JPEG. В реальном приложении определите тип
    });

    const response = await axios.post<UpdateProfileResponse>(
      `${API_URL}/users/${userId}/avatar`,
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
