import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useUserStorage } from './UserStorageContext';
import { User } from '../types/user';
import { AuthResponse } from '../types/auth';

// Типы ролей пользователя в системе
type UserRoleType = 'patient' | 'doctor' | 'admin';

// Определяем тип для пользователя из API
interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  [key: string]: unknown; // Для других возможных полей
}

// Тип данных, хранящихся в AsyncStorage
interface StoredUserData {
  user: User;
  token: string;
  refreshToken: string;
}

// Функция для конвертации строковой роли в тип UserRoleType
const mapRole = (role?: string): UserRoleType => {
  if (!role) return 'patient';

  // Приводим к нижнему регистру для соответствия UserRoleContext
  const lowerRole = role.toLowerCase();

  // Проверяем, что роль соответствует одному из допустимых значений
  if (lowerRole === 'patient' || lowerRole === 'doctor' || lowerRole === 'admin') {
    return lowerRole as UserRoleType;
  }

  // Если роль не соответствует формату, возвращаем patient по умолчанию
  return 'patient';
};

// Адаптер для конвертации типов User
const adaptUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    phone: apiUser.phone || '',
    role: mapRole(apiUser.role),
    password: '', // Пустой пароль, так как API не возвращает пароль
  };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { saveUserData, getUserData, clearUserData } = useUserStorage();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = (await getUserData()) as unknown as StoredUserData;
        if (userData && userData.user) {
          setUser(userData.user);
        }
      } catch (err) {
        console.error('Ошибка при загрузке пользователя:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [getUserData]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Отправка запроса на вход...');
      const response = await authApi.login(email, password);
      console.log('Получен ответ от сервера:', response);

      if (response.success && response.token && response.user) {
        const adaptedUser = adaptUser(response.user as unknown as ApiUser);
        console.log('Сохранение данных пользователя...');
        await saveUserData({
          user: adaptedUser as unknown as ApiUser,
          token: response.token,
          refreshToken: response.token,
        });
        console.log('Установка состояния пользователя...');
        setUser(adaptedUser);
        console.log('Пользователь успешно авторизован:', adaptedUser);

        // Возвращаем ответ
        return response;
      } else {
        console.error('Ошибка в ответе сервера:', response);
        setError(response.message || 'Ошибка при входе');
        throw new Error(response.message || 'Ошибка при входе');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError('Ошибка при входе');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await clearUserData();
      setUser(null);
      // Роль пользователя сбрасывается в AuthRoleBridge
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(
        userData.email || '',
        userData.password || '',
        userData.firstName || '',
        userData.lastName || ''
      );
      if (response.success && response.token && response.user) {
        const adaptedUser = adaptUser(response.user as unknown as ApiUser);
        await saveUserData({
          user: adaptedUser as unknown as ApiUser,
          token: response.token,
          refreshToken: response.token,
        });
        setUser(adaptedUser);
      } else {
        setError(response.message || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Ошибка при регистрации');
      console.error('Ошибка при регистрации:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем наличие пользователя и токена
      if (!user || !user.id) {
        throw new Error('Пользователь не авторизован');
      }

      // Получаем данные из хранилища, включая токен
      const storedData = (await getUserData()) as unknown as StoredUserData;
      const token = storedData?.token || '';

      // Загружаем аватар, если он был изменен и имеет URI формат
      let updatedAvatar = userData.avatar;
      if (
        userData.avatar &&
        userData.avatar !== user.avatar &&
        userData.avatar.startsWith('file://')
      ) {
        const avatarResponse = await authApi.uploadAvatar(user.id, userData.avatar, token);
        if (avatarResponse.success && avatarResponse.avatarUrl) {
          updatedAvatar = avatarResponse.avatarUrl;
        }
      }

      // Обновляем данные пользователя через API
      const response = await authApi.updateProfile(
        user.id,
        { ...userData, avatar: updatedAvatar },
        token
      );

      if (response.success && response.user) {
        // Создаем обновленный объект пользователя
        const updatedUser = { ...user, ...userData, avatar: updatedAvatar };

        // Обновляем локальные данные пользователя
        await saveUserData({
          user: updatedUser as unknown as ApiUser,
          token: token,
          refreshToken: storedData?.refreshToken || token,
        });

        // Обновляем состояние пользователя
        setUser(updatedUser);
        console.log('Профиль пользователя обновлен:', updatedUser);
      } else {
        throw new Error(response.message || 'Ошибка при обновлении профиля');
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
