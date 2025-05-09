import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useUserStorage } from './UserStorageContext';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
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
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке пользователя:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [getUserData]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Отправка запроса на вход...');
      const response = await authApi.login(email, password);
      console.log('Получен ответ от сервера:', response);

      if (response.success && response.token && response.user) {
        const { user, token } = response;
        console.log('Сохранение данных пользователя...');
        await saveUserData({ user, token, refreshToken: token });
        console.log('Установка состояния пользователя...');
        setUser(user as User);
        console.log('Пользователь успешно авторизован:', user);
      } else {
        console.error('Ошибка в ответе сервера:', response);
        setError(response.message || 'Ошибка при входе');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError('Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await clearUserData();
      setUser(null);
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
        const { user, token } = response;
        await saveUserData({ user, token, refreshToken: token });
        setUser(user as User);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
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
