import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserStorageProvider } from '../contexts/UserStorageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { UserRoleProvider } from '../contexts/UserRoleContext';
import { store } from '../store';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <Provider store={store}>
    <SafeAreaProvider>
      <ThemeProvider>
        <UserStorageProvider>
          <AuthProvider>
            <UserRoleProvider>{children}</UserRoleProvider>
          </AuthProvider>
        </UserStorageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </Provider>
);
