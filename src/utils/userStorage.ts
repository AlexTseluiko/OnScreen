import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

// Определяем тип ApiUser, если он используется в функции saveUserData
interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
}

const USER_KEY = '@user';
const TOKEN_KEY = '@token';
const REFRESH_TOKEN_KEY = '@refreshToken';

export const userStorage = {
  async saveUserData(user: User | ApiUser, token: string, refreshToken: string): Promise<void> {
    try {
      console.log('Сохранение данных пользователя в AsyncStorage:', { user, token, refreshToken });
      await AsyncStorage.multiSet([
        [USER_KEY, JSON.stringify(user)],
        [TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
      console.log('Данные пользователя успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении данных пользователя:', error);
      throw error;
    }
  },

  async getUserData(): Promise<User | null> {
    try {
      console.log('Получение данных пользователя из AsyncStorage');
      const userData = await AsyncStorage.getItem(USER_KEY);
      console.log('Полученные данные пользователя:', userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      console.log('Получение токена из AsyncStorage');
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('Полученный токен:', token);
      return token;
    } catch (error) {
      console.error('Ошибка при получении токена:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Ошибка при получении refresh токена:', error);
      return null;
    }
  },

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Ошибка при очистке данных пользователя:', error);
      throw error;
    }
  },

  async isUserLoggedIn(): Promise<boolean> {
    try {
      const token = await userStorage.getToken();
      return !!token;
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      return false;
    }
  },
};
