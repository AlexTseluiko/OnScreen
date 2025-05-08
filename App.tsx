import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
} 