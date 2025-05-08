import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { userStorage } from '../utils/userStorage';
import { authApi } from '../api/authApi';

export interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const userData = await userStorage.getUserData();
        if (userData) {
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: newUser, token, refreshToken } = await authApi.login(email, password);
      await userStorage.saveUserData({ user: newUser, token, refreshToken });
      setUser(newUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    try {
      const { user: newUser, token, refreshToken } = await authApi.register(email, password, role);
      await userStorage.saveUserData({ user: newUser, token, refreshToken });
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      await userStorage.removeUserData();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const { user: newUser, token, refreshToken } = await authApi.refreshToken();
      await userStorage.saveUserData({ user: newUser, token, refreshToken });
      setUser(newUser);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      login,
      register,
      logout,
      refreshToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};