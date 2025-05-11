import React, { createContext, useContext } from 'react';
import { userStorage } from '../utils/userStorage';
import { User } from '../types/user';

// Импорт интерфейса ApiUser из AuthContext (или добавление его здесь)
interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  [key: string]: unknown; // Для других возможных полей
}

interface UserData {
  user: User | ApiUser;
  token: string;
  refreshToken: string;
}

interface UserStorageContextType {
  saveUserData: (data: UserData) => Promise<void>;
  getUserData: () => Promise<User | null>;
  getToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  clearUserData: () => Promise<void>;
  isUserLoggedIn: () => Promise<boolean>;
}

const UserStorageContext = createContext<UserStorageContextType | undefined>(undefined);

export const UserStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const contextValue: UserStorageContextType = {
    saveUserData: async (data: UserData) => {
      await userStorage.saveUserData(data.user, data.token, data.refreshToken);
    },
    getUserData: userStorage.getUserData,
    getToken: userStorage.getToken,
    getRefreshToken: userStorage.getRefreshToken,
    clearUserData: userStorage.clearUserData,
    isUserLoggedIn: userStorage.isUserLoggedIn,
  };

  return <UserStorageContext.Provider value={contextValue}>{children}</UserStorageContext.Provider>;
};

export const useUserStorage = () => {
  const context = useContext(UserStorageContext);
  if (!context) {
    throw new Error('useUserStorage must be used within a UserStorageProvider');
  }
  return context;
};
