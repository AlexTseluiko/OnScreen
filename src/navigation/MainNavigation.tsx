import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';

const Stack = createStackNavigator();

const MainNavigation = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      {/* ... existing code ... */}

      {/* В блоке, где определены маршруты для админа (AdminStack) */}
      {user?.role === 'admin' && (
        <>
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{
              title: t('adminDashboard'),
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="AdminUsers"
            component={AdminUsersScreen}
            options={{
              title: t('adminUsers'),
              headerShown: true,
            }}
          />
          {/* Другие экраны админа */}
        </>
      )}

      {/* ... existing code ... */}
    </Stack.Navigator>
  );
};

export default MainNavigation; 