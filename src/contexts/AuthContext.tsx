import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useUserStorage } from './UserStorageContext';
import { User } from '../types/models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        await saveUserData({ user, token, refreshToken });
        setUser(user);
      } else {
        setError(response.message || 'Ошибка при входе');
      }
    } catch (err) {
      setError('Ошибка при входе');
      console.error('Ошибка при входе:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(email, password, firstName, lastName);
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        await saveUserData({ user, token, refreshToken });
        setUser(user);
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

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
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
