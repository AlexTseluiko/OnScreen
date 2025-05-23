import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUserRole } from './UserRoleContext';

// Компонент для обновления роли пользователя при изменении пользователя в auth
export const AuthRoleBridge: React.FC = () => {
  const { user } = useAuth();
  const { userRole, setUserRole } = useUserRole();
  const [lastChange, setLastChange] = useState<string>('');

  // Обрабатываем изменения пользователя
  useEffect(() => {
    if (user && user.role) {
      // Когда пользователь меняется и есть роль, обновляем контекст ролей
      setUserRole(user.role);
      setLastChange(`Роль пользователя установлена из auth: ${user.role}`);
      console.log('AuthRoleBridge: обновлена роль пользователя -', user.role);
    } else if (!user) {
      // Когда пользователь выходит, сбрасываем роль
      setUserRole(null);
      setLastChange('Роль пользователя сброшена');
      console.log('AuthRoleBridge: роль пользователя сброшена');
    }
  }, [user, setUserRole]);

  // В production и в development ничего не отображаем
  return null;
};
