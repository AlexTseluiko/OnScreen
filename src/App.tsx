import React, { useState, useEffect } from 'react';
import { AppProviders } from './providers/AppProviders';
import { AppNavigator } from './navigation/AppNavigator';
import { SplashScreen } from './screens/SplashScreen';
import { AuthRoleBridge } from './contexts/AuthRoleBridge';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Здесь можно добавить дополнительную инициализацию приложения
    const initializeApp = async () => {
      try {
        // Имитация загрузки ресурсов
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsInitialized(true);
      } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        setIsInitialized(true); // В случае ошибки все равно показываем приложение
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <AppProviders>
      <AuthRoleBridge>
        <AppNavigator />
      </AuthRoleBridge>
    </AppProviders>
  );
}
