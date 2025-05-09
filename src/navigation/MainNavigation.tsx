import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FacilitiesMapScreen } from '../screens/FacilitiesMapScreen';
import { ArticlesScreen } from '../screens/ArticlesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ScreeningProgramsScreen } from '../screens/ScreeningProgramsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Facilities" component={FacilitiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      {user?.role === 'ADMIN' && (
        <>
          <Tab.Screen name="AdminDashboard" component={AdminDashboard} />
          <Tab.Screen name="AdminUsers" component={AdminUsersScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export const MainNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="FacilitiesMap" component={FacilitiesMapScreen} />
      <Stack.Screen name="Articles" component={ArticlesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ScreeningPrograms" component={ScreeningProgramsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
