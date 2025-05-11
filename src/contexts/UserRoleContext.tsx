import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const USER_ROLE_KEY = 'user_role';
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>(null);

  // Загружаем роль пользователя при запуске
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem(USER_ROLE_KEY);
        if (savedRole) {
          setUserRoleState(savedRole as UserRole);
          console.log('Загружена сохранённая роль:', savedRole);
        }
      } catch (error) {
        console.error('Ошибка при загрузке роли пользователя:', error);
      }
    };

    loadUserRole();
  }, []);

  // Сохраняем роль в AsyncStorage при изменении
  const setUserRole = async (role: UserRole) => {
    try {
      setUserRoleState(role);
      if (role) {
        await AsyncStorage.setItem(USER_ROLE_KEY, role);
        console.log('Роль пользователя сохранена:', role);
      } else {
        await AsyncStorage.removeItem(USER_ROLE_KEY);
        console.log('Роль пользователя удалена');
      }
    } catch (error) {
      console.error('Ошибка при сохранении роли пользователя:', error);
    }
  };

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
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
