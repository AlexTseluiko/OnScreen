import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export const API_BASE_URL = API_CONFIG.BASE_URL;
const AUTH_TOKEN_KEY = 'authToken';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    console.log('Получен токен авторизации:', token ? 'Да (длина: ' + token.length + ')' : 'Нет');
    
    if (!token) {
      console.log('Токен не найден в хранилище, возможно пользователь не авторизован');
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    if (!token) {
      console.error('Попытка установить пустой токен');
      return;
    }
    
    console.log('Установка нового токена авторизации, длина:', token.length);
    
    // Сохраняем токен в основном хранилище
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // Проверяем, есть ли сохраненные данные пользователя
    const userDataStr = await AsyncStorage.getItem('@user_data');
    if (userDataStr) {
      try {
        // Если есть, обновляем токен и в них тоже
        const userData = JSON.parse(userDataStr);
        userData.token = token;
        await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
        console.log('Токен обновлен в данных пользователя');
      } catch (parseError) {
        console.error('Ошибка парсинга данных пользователя:', parseError);
        // Игнорируем ошибку парсинга, но логируем ее
      }
    } else {
      console.log('Данные пользователя не найдены, обновлен только токен');
    }
    
    console.log('Токен авторизации успешно обновлен');
  } catch (error) {
    console.error('Ошибка при установке токена авторизации:', error);
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    
    // Проверяем, есть ли сохраненные данные пользователя
    const userDataStr = await AsyncStorage.getItem('@user_data');
    if (userDataStr) {
      // Если есть, удаляем токен из них
      const userData = JSON.parse(userDataStr);
      userData.token = '';
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
}; 