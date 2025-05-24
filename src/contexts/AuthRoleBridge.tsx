import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUserRole } from './UserRoleContext';

interface AuthRoleBridgeProps {
  children: React.ReactNode;
}

// Компонент для обновления роли пользователя при изменении пользователя в auth
export const AuthRoleBridge: React.FC<AuthRoleBridgeProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { setRole } = useUserRole();

  // Обрабатываем изменения пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      setRole(null);
    }
  }, [isAuthenticated, setRole]);

  return <>{children}</>;
};
