import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserStorageProvider } from './src/contexts/UserStorageContext';
import { UserRoleProvider } from './src/contexts/UserRoleContext';
import { AuthRoleBridge } from './src/contexts/AuthRoleBridge';
import { AppNavigator } from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserStorageProvider>
            <AuthProvider>
              <UserRoleProvider>
                <AuthRoleBridge />
                <AppNavigator />
              </UserRoleProvider>
            </AuthProvider>
          </UserStorageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
