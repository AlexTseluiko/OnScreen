import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

const USER_KEY = '@user';
const TOKEN_KEY = '@token';
const REFRESH_TOKEN_KEY = '@refreshToken';

export const userStorage = {
  async saveUserData(user: User, token: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [USER_KEY, JSON.stringify(user)],
        [TOKEN_KEY, token],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Ошибка при сохранении данных пользователя:', error);
      throw error;
    }
  },

  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
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
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      return false;
    }
  },
};
