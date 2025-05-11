import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUserRole } from './UserRoleContext';

// Компонент для обновления роли пользователя при изменении пользователя в auth
export const AuthRoleBridge: React.FC = () => {
  const { user } = useAuth();
  const { setUserRole } = useUserRole();

  useEffect(() => {
    if (user && user.role) {
      // Когда пользователь меняется и есть роль, обновляем контекст ролей
      setUserRole(user.role);
      console.log('AuthRoleBridge: обновлена роль пользователя -', user.role);
    } else if (!user) {
      // Когда пользователь выходит, сбрасываем роль
      setUserRole(null);
      console.log('AuthRoleBridge: роль пользователя сброшена');
    }
  }, [user, setUserRole]);

  // Это рендер-меньше компонент, ничего не возвращает в DOM
  return null;
};
