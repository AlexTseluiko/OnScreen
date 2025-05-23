import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../contexts/UserRoleContext';

// Импорт типов
import {
  RootStackParamList,
  PatientTabParamList,
  DoctorTabParamList,
  AdminTabParamList,
} from './types';

// Экраны авторизации
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';

// Общие экраны
import ProfileScreen from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Экраны пациента
import { HomeScreen } from '../screens/HomeScreen';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import { FacilitiesMapScreen } from '../screens/FacilitiesMapScreen';
import { ClinicDetailsScreen } from '../screens/ClinicDetailsScreen';
import { EmergencyAIAssistantScreen } from '../screens/EmergencyAIAssistantScreen';
import { ArticlesScreen } from '../screens/ArticlesScreen';
import { ScreeningProgramsScreen } from '../screens/ScreeningProgramsScreen';
import { MedicalCardScreen } from '../screens/MedicalCardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MedicalRecordsScreen } from '../screens/MedicalRecordsScreen';
import { MedicalRecordDetailsScreen } from '../screens/MedicalRecordDetailsScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import DoctorDetailsScreen from '../screens/DoctorDetailsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import FavoriteDoctorsScreen from '../screens/FavoriteDoctorsScreen';
import DoctorReviewsScreen from '../screens/DoctorReviewsScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import UpcomingAppointmentsScreen from '../screens/UpcomingAppointmentsScreen';
import VisitHistoryScreen from '../screens/VisitHistoryScreen';

// Экраны врача
import { ChatScreen } from '../screens/ChatScreen';
import DoctorScheduleScreen from '../screens/DoctorScheduleScreen';
import VideoConsultationScreen from '../screens/VideoConsultationScreen';
import DoctorPatients from '../screens/DoctorPatients';
import { PatientDetailsScreen } from '../screens/PatientDetailsScreen';
import ConsultationHistoryScreen from '../screens/ConsultationHistoryScreen';
import DoctorDocumentsScreen from '../screens/DoctorDocumentsScreen';

// Экраны админа
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { DoctorRequestsScreen } from '../screens/DoctorRequestsScreen';
import { DoctorRequestDetailsScreen } from '../screens/DoctorRequestDetailsScreen';
import StaffManagementScreen from '../screens/StaffManagementScreen';
import ClinicScheduleScreen from '../screens/ClinicScheduleScreen';
import ClinicAnalyticsScreen from '../screens/ClinicAnalyticsScreen';
import ClinicManagementScreen from '../screens/ClinicManagementScreen';
import SystemSettingsScreen from '../screens/SystemSettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ActionLogsScreen from '../screens/ActionLogsScreen';

// Импорт для экранов лекарств
import MedicationDetailsScreen from '../screens/MedicationDetailsScreen';
import MedicationRemindersScreen from '../screens/MedicationRemindersScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import EditMedicationScreen from '../screens/EditMedicationScreen';

// Импортируем новый экран администратора
import AdminScreeningScreen from '../screens/AdminScreeningScreen';

const Stack = createStackNavigator<RootStackParamList>();
const PatientTab = createBottomTabNavigator<PatientTabParamList>();
const DoctorTab = createBottomTabNavigator<DoctorTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

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
          title: 'Запросы врачей',
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

// Добавляем тип для параметров навигатора
export type AppNavigatorParamList = {
  Home: undefined;
  DoctorDetails: {
    doctorId: string;
    doctorName: string;
  };
  VideoConsultation: {
    appointmentId: string;
  };
  DoctorSchedule: undefined;
  // Добавьте другие экраны здесь при необходимости
};

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  // Добавляем эффект для отслеживания изменений роли
  useEffect(() => {
    console.log('AppNavigator: роль изменилась на', userRole);
  }, [userRole]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Определяем тип навигатора в зависимости от роли
  const getInitialRouteName = () => {
    if (!user) return 'Login' as keyof RootStackParamList;

    switch (userRole) {
      case 'doctor':
        return 'DoctorTabs' as keyof RootStackParamList;
      case 'admin':
        return 'AdminTabs' as keyof RootStackParamList;
      case 'patient':
      default:
        return 'PatientTabs' as keyof RootStackParamList;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={`navigator-${userRole || 'guest'}`}
        initialRouteName={getInitialRouteName()}
      >
        {!user ? (
          // Стек для неавторизованных пользователей
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: t('register') }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: t('forgotPassword') }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ title: t('resetPassword') }}
            />
          </>
        ) : (
          // Стек для авторизованных пользователей
          <>
            {/* Табы для разных типов пользователей */}
            <Stack.Screen
              name="PatientTabs"
              component={PatientTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DoctorTabs"
              component={DoctorTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminTabs"
              component={AdminTabNavigator}
              options={{ headerShown: false }}
            />

            {/* Общие экраны для всех типов пользователей */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: t('profile') }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: t('editProfile') }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: t('settings') }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ title: t('changePassword') }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: t('notifications') }}
            />
            <Stack.Screen
              name="FeedbackScreen"
              component={FeedbackScreen}
              options={{ title: t('feedback') }}
            />

            {/* Экраны медицинских учреждений */}
            <Stack.Screen
              name="FacilitiesMap"
              component={FacilitiesMapScreen}
              options={{ title: t('facilitiesMap') }}
            />
            <Stack.Screen
              name="ClinicDetails"
              component={ClinicDetailsScreen}
              options={{ title: t('clinicDetails') }}
            />
            <Stack.Screen
              name="Doctors"
              component={DoctorsScreen}
              options={{ title: t('doctors') }}
            />
            <Stack.Screen
              name="DoctorDetails"
              component={DoctorDetailsScreen}
              options={({ route }) => ({
                title: route.params.doctorName || t('doctorDetails'),
              })}
            />
            <Stack.Screen
              name="DoctorReviews"
              component={DoctorReviewsScreen}
              options={{ title: t('doctorReviews') }}
            />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
              options={{ title: t('bookAppointment') }}
            />

            {/* Экраны для пациентов */}
            <Stack.Screen
              name="MedicalCard"
              component={MedicalCardScreen}
              options={{ title: t('medicalCard') }}
            />
            <Stack.Screen
              name="MedicalRecords"
              component={MedicalRecordsScreen}
              options={{ title: t('medicalRecords') }}
            />
            <Stack.Screen
              name="MedicalRecordDetails"
              component={MedicalRecordDetailsScreen}
              options={({ route }) => ({
                title: route.params.patientName || t('medicalRecordDetails'),
              })}
            />
            <Stack.Screen
              name="UpcomingAppointments"
              component={UpcomingAppointmentsScreen}
              options={{ title: t('upcomingAppointments') }}
            />
            <Stack.Screen
              name="VisitHistory"
              component={VisitHistoryScreen}
              options={{ title: t('visitHistory') }}
            />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: t('search') }} />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: t('favorites') }}
            />
            <Stack.Screen
              name="FavoriteDoctors"
              component={FavoriteDoctorsScreen}
              options={{ title: t('favoriteDoctors') }}
            />

            {/* Информационные экраны */}
            <Stack.Screen
              name="Articles"
              component={ArticlesScreen}
              options={{ title: t('articles') }}
            />
            <Stack.Screen
              name="ScreeningPrograms"
              component={ScreeningProgramsScreen}
              options={{ title: t('screeningPrograms') }}
            />
            <Stack.Screen
              name="EmergencyAIAssistant"
              component={EmergencyAIAssistantScreen}
              options={{ title: t('emergencyAssistant') }}
            />

            {/* Экраны для управления лекарствами */}
            <Stack.Screen
              name="Medications"
              component={MedicationsScreen}
              options={{ title: t('medications') }}
            />
            <Stack.Screen
              name="MedicationReminders"
              component={MedicationRemindersScreen}
              options={{ title: t('medicationReminders') }}
            />
            <Stack.Screen
              name="MedicationDetails"
              component={MedicationDetailsScreen}
              options={{ title: t('medicationDetails') }}
            />
            <Stack.Screen
              name="AddMedication"
              component={AddMedicationScreen}
              options={{ title: t('addMedication') }}
            />
            <Stack.Screen
              name="EditMedication"
              component={EditMedicationScreen}
              options={{ title: t('editMedication') }}
            />

            {/* Экраны для врачей */}
            {userRole === 'doctor' && (
              <>
                <Stack.Screen
                  name="DoctorSchedule"
                  component={DoctorScheduleScreen}
                  options={{ title: t('doctorSchedule') }}
                />
                <Stack.Screen
                  name="VideoConsultation"
                  component={VideoConsultationScreen}
                  options={{ title: t('videoConsultation') }}
                />
                <Stack.Screen
                  name="DoctorPatients"
                  component={DoctorPatients}
                  options={{ title: t('myPatients') }}
                />
                <Stack.Screen
                  name="PatientDetails"
                  component={PatientDetailsScreen}
                  options={{ title: t('patientDetails') }}
                />
                <Stack.Screen
                  name="ConsultationHistory"
                  component={ConsultationHistoryScreen}
                  options={{ title: t('consultationHistory') }}
                />
                <Stack.Screen
                  name="DoctorDocuments"
                  component={DoctorDocumentsScreen}
                  options={{ title: t('myDocuments') }}
                />
              </>
            )}

            {/* Экраны для администраторов */}
            {userRole === 'admin' && (
              <>
                <Stack.Screen
                  name="StaffManagement"
                  component={StaffManagementScreen}
                  options={{ title: t('staffManagement') }}
                />
                <Stack.Screen
                  name="ClinicSchedule"
                  component={ClinicScheduleScreen}
                  options={{ title: t('clinicSchedule') }}
                />
                <Stack.Screen
                  name="ClinicAnalytics"
                  component={ClinicAnalyticsScreen}
                  options={{ title: t('clinicAnalytics') }}
                />
                <Stack.Screen
                  name="ClinicManagement"
                  component={ClinicManagementScreen}
                  options={{ title: t('clinicManagement') }}
                />
                <Stack.Screen
                  name="SystemSettings"
                  component={SystemSettingsScreen}
                  options={{ title: t('systemSettings') }}
                />
                <Stack.Screen
                  name="Reports"
                  component={ReportsScreen}
                  options={{ title: t('reports') }}
                />
                <Stack.Screen
                  name="ActionLogs"
                  component={ActionLogsScreen}
                  options={{ title: t('actionLogs') }}
                />
                <Stack.Screen
                  name="DoctorRequestDetails"
                  component={DoctorRequestDetailsScreen}
                  options={{ title: t('requestDetails') }}
                />
                <Stack.Screen
                  name="AdminScreening"
                  component={AdminScreeningScreen}
                  options={{
                    title: 'Управление скринингами',
                    headerShown: true,
                  }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export type { RootStackParamList };
