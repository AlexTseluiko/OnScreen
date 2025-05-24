import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../contexts/UserRoleContext';
import { AppLoader } from '../components/AppLoader';
import { AuthNavigator } from './AuthNavigator';

// Импорт типов
import {
  RootStackParamList,
  PatientTabParamList,
  DoctorTabParamList,
  AdminTabParamList,
} from './types';

// Общие экраны
import ProfileScreen from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Экраны пациента
import { HomeScreen } from '../screens/HomeScreen';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import { FacilitiesMapScreen } from '../screens/FacilitiesMapScreen';
import { EmergencyAIAssistantScreen } from '../screens/EmergencyAIAssistantScreen';
import { ScreeningProgramsScreen } from '../screens/ScreeningProgramsScreen';

// Экраны врача
import { ChatScreen } from '../screens/ChatScreen';

// Экраны админа
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { DoctorRequestsScreen } from '../screens/DoctorRequestsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const PatientTab = createBottomTabNavigator<PatientTabParamList>();
const DoctorTab = createBottomTabNavigator<DoctorTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

// Типы для иконок Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Навигация для пациента
const PatientTabNavigator = () => {
  return (
    <PatientTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconsName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FacilitiesMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'EmergencyAIAssistant') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'ScreeningPrograms') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <PatientTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          headerShown: false,
        }}
      />
      <PatientTab.Screen
        name="FacilitiesMap"
        component={FacilitiesMapScreen}
        options={{
          title: 'Карты',
          headerShown: true,
        }}
      />
      <PatientTab.Screen
        name="EmergencyAIAssistant"
        component={EmergencyAIAssistantScreen}
        options={{
          title: 'Экстренная помощь',
          headerShown: true,
        }}
      />
      <PatientTab.Screen
        name="ScreeningPrograms"
        component={ScreeningProgramsScreen}
        options={{
          title: 'Скрининг',
          headerShown: true,
        }}
      />
      <PatientTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Настройки',
          headerShown: true,
        }}
      />
    </PatientTab.Navigator>
  );
};

// Навигация для врача
const DoctorTabNavigator = () => {
  return (
    <DoctorTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconsName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Facilities') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <DoctorTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          headerShown: false,
        }}
      />
      <DoctorTab.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{
          title: 'Клиники',
          headerShown: true,
        }}
      />
      <DoctorTab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Чат',
          headerShown: true,
        }}
      />
      <DoctorTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          headerShown: true,
        }}
      />
    </DoctorTab.Navigator>
  );
};

// Навигация для админа
const AdminTabNavigator = () => {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconsName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AdminUsers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'DoctorRequests') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <AdminTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          headerShown: false,
        }}
      />
      <AdminTab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          title: 'Пользователи',
          headerShown: true,
        }}
      />
      <AdminTab.Screen
        name="DoctorRequests"
        component={DoctorRequestsScreen}
        options={{
          title: 'Заявки врачей',
          headerShown: true,
        }}
      />
      <AdminTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          headerShown: true,
        }}
      />
    </AdminTab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return <AppLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {role === 'patient' && <Stack.Screen name="Patient" component={PatientTabNavigator} />}
            {role === 'doctor' && <Stack.Screen name="Doctor" component={DoctorTabNavigator} />}
            {role === 'admin' && <Stack.Screen name="Admin" component={AdminTabNavigator} />}
            {!role && <Stack.Screen name="Auth" component={AuthNavigator} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export type { RootStackParamList };
