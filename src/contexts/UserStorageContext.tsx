import React, { createContext, useContext } from 'react';
import { userStorage } from '../utils/userStorage';

interface UserStorageContextType {
  saveUserData: typeof userStorage.saveUserData;
  getUserData: typeof userStorage.getUserData;
  removeUserData: typeof userStorage.removeUserData;
  isUserLoggedIn: typeof userStorage.isUserLoggedIn;
  getToken: typeof userStorage.getToken;
  getRefreshToken: typeof userStorage.getRefreshToken;
}

const UserStorageContext = createContext<UserStorageContextType | undefined>(undefined);

export const UserStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserStorageContext.Provider value={userStorage}>
      {children}
    </UserStorageContext.Provider>
  );
};

export const useUserStorage = () => {
  const context = useContext(UserStorageContext);
  if (!context) {
    throw new Error('useUserStorage must be used within a UserStorageProvider');
  }
  return context;
}; 