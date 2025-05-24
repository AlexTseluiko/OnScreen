import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'patient' | 'doctor' | 'admin' | null;

export type UserRoleContextType = {
  role: UserRole;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
};

const USER_ROLE_KEY = 'user_role';
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем роль пользователя при запуске
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        setIsLoading(true);
        const savedRole = await AsyncStorage.getItem(USER_ROLE_KEY);
        if (savedRole) {
          setRoleState(savedRole as UserRole);
          console.log('Загружена сохранённая роль:', savedRole);
        }
      } catch (error) {
        console.error('Ошибка при загрузке роли пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, []);

  // Сохраняем роль в AsyncStorage при изменении
  const setRole = async (newRole: UserRole) => {
    try {
      setIsLoading(true);
      setRoleState(newRole);
      if (newRole) {
        await AsyncStorage.setItem(USER_ROLE_KEY, newRole);
        console.log('Роль пользователя сохранена:', newRole);
      } else {
        await AsyncStorage.removeItem(USER_ROLE_KEY);
        console.log('Роль пользователя удалена');
      }
    } catch (error) {
      console.error('Ошибка при сохранении роли пользователя:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearRole = async () => {
    try {
      setIsLoading(true);
      setRoleState(null);
      await AsyncStorage.removeItem(USER_ROLE_KEY);
      console.log('Роль пользователя удалена');
    } catch (error) {
      console.error('Ошибка при удалении роли пользователя:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserRoleContext.Provider value={{ role, isLoading, setRole, clearRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
