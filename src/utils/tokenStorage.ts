import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const AUTH_TOKEN_KEY = 'token'; // Ключ, используемый в AuthContext

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  metadata?: Record<string, unknown>;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: unknown;
}

// Функция для сохранения токена авторизации
export const storeToken = async (tokenData: TokenData): Promise<void> => {
  try {
    console.log(
      `storeToken: Сохраняем токен в ${TOKEN_KEY}:`,
      tokenData ? `${tokenData.accessToken.substring(0, 10)}...` : 'отсутствует'
    );
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));

    // Также сохраняем токен в AUTH_TOKEN_KEY для совместимости с AuthContext
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenData.accessToken);
    console.log('storeToken: Токен также сохранен в', AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при сохранении токена:', error);
  }
};

// Функция для получения токена авторизации
export const getToken = async (): Promise<TokenData | null> => {
  try {
    const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
    console.log(
      `getToken: Получен токен из ${TOKEN_KEY}:`,
      tokenData ? `${tokenData.substring(0, 10)}...` : 'отсутствует'
    );
    return tokenData ? JSON.parse(tokenData) : null;
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
};

// Функция для удаления токена авторизации (при выходе из системы)
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
  }
};

// Функция для сохранения данных пользователя
export const storeUserData = async (userData: UserData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(USER_KEY, jsonValue);
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователя:', error);
  }
};

// Функция для получения данных пользователя
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};

// Функция для удаления данных пользователя
export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Ошибка при удалении данных пользователя:', error);
  }
};

// Функция для полной очистки данных авторизации
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Ошибка при очистке данных авторизации:', error);
  }
};

// Функция для синхронизации токенов между хранилищами
export const syncTokens = async (): Promise<string | null> => {
  try {
    // Сначала пробуем получить токен из основного хранилища
    let token = await AsyncStorage.getItem(TOKEN_KEY);

    // Если токен не найден, проверяем в AuthContext
    if (!token) {
      token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      // Если нашли токен в AuthContext, сохраняем его и в основное хранилище
      if (token) {
        console.log('Синхронизация: токен найден в AuthContext, копируем в основное хранилище');
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      // Если токен есть в основном хранилище, проверяем есть ли он в AuthContext
      const authToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      // Если в AuthContext нет токена или он отличается, обновляем его
      if (!authToken || authToken !== token) {
        console.log('Синхронизация: обновляем токен в AuthContext');
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      }
    }

    return token;
  } catch (error) {
    console.error('Ошибка при синхронизации токенов:', error);
    return null;
  }
};
