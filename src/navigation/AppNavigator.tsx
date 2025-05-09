import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { FacilitiesMapScreen } from '../screens/FacilitiesMapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ArticlesScreen } from '../screens/ArticlesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ScreeningProgramsScreen } from '../screens/ScreeningProgramsScreen';
import { ClinicDetailsScreen } from '../screens/ClinicDetailsScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyAIAssistantScreen } from '../screens/EmergencyAIAssistantScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { DoctorRequestsScreen } from '../screens/DoctorRequestsScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Facilities: undefined;
  FacilityDetails: { facilityId: string };
  ClinicDetails: { clinicId: string } | { clinic: Record<string, unknown> };
  Register: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Profile: undefined;
  Settings: undefined;
  FacilitiesMap: undefined;
  Articles: undefined;
  Chat: undefined;
  ScreeningPrograms: undefined;
  Feedback: undefined;
  EmergencyAIAssistant: undefined;
  AdminUsers: undefined;
  DoctorRequests: undefined;
  ChangePassword: undefined;
  Favorites: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      console.log(
        'Состояние авторизации загружено. Пользователь:',
        user ? 'авторизован' : 'не авторизован'
      );
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading) {
      console.log(
        'Статус авторизации изменился. Пользователь:',
        user ? 'авторизован' : 'не авторизован'
      );

      if (!user && !isLoading) {
        console.log('Пользователь не авторизован, перенаправление на экран входа');
      }
    }
  }, [user, authLoading, isLoading]);

  const checkAdminAccess = (navigation: StackNavigationProp<RootStackParamList>) => {
    if (!user || user.role !== 'ADMIN') {
      Alert.alert('Доступ запрещен', 'У вас нет прав для доступа к этому разделу');
      navigation.goBack();
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          headerBackImage: () => <Ionicons name="chevron-back" size={24} color="white" />,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: t('auth.login'),
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: t('auth.register'),
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: t('auth.forgotPasswordTitle'),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            title: t('auth.resetPasswordTitle'),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Facilities"
          component={FacilitiesScreen}
          options={{
            title: t('facilities'),
          }}
        />
        <Stack.Screen
          name="FacilitiesMap"
          component={FacilitiesMapScreen}
          options={{
            title: t('facilitiesMap'),
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t('profile.title'),
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('settings.title'),
          }}
        />
        <Stack.Screen
          name="Articles"
          component={ArticlesScreen}
          options={{
            title: t('articles'),
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: t('chat'),
          }}
        />
        <Stack.Screen
          name="ScreeningPrograms"
          component={ScreeningProgramsScreen}
          options={{
            title: t('screeningPrograms'),
          }}
        />
        <Stack.Screen
          name="ClinicDetails"
          component={ClinicDetailsScreen}
          options={{
            title: t('clinic.details'),
          }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{
            title: t('feedback.title'),
          }}
        />
        <Stack.Screen
          name="EmergencyAIAssistant"
          component={EmergencyAIAssistantScreen}
          options={{
            title: t('emergency'),
          }}
        />
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{
            title: t('admin.users'),
          }}
          listeners={({ navigation }) => ({
            beforeRemove: e => {
              if (!checkAdminAccess(navigation)) {
                e.preventDefault();
              }
            },
            focus: () => {
              checkAdminAccess(navigation);
            },
          })}
        />
        <Stack.Screen
          name="DoctorRequests"
          component={DoctorRequestsScreen}
          options={{
            title: t('admin.doctorRequests'),
          }}
          listeners={({ navigation }) => ({
            beforeRemove: e => {
              if (!checkAdminAccess(navigation)) {
                e.preventDefault();
              }
            },
            focus: () => {
              checkAdminAccess(navigation);
            },
          })}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            title: t('changePassword.title'),
          }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: t('favorites.title'),
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: t('notifications.title'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
