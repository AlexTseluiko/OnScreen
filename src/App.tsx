import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { Navigation } from './navigation';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { UserRoleProvider } from './contexts/UserRoleContext';
import { AuthRoleBridge } from './contexts/AuthRoleBridge';
import GlobalErrorDisplay from './components/molecules/GlobalErrorDisplay';
import ErrorBoundary from './components/organisms/ErrorBoundary';
import './i18n';

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <ErrorProvider>
              <UserRoleProvider>
                <AuthProvider>
                  <AuthRoleBridge />
                  <ProfileProvider>
                    <Navigation />
                    <GlobalErrorDisplay />
                  </ProfileProvider>
                </AuthProvider>
              </UserRoleProvider>
            </ErrorProvider>
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
