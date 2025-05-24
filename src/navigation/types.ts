import { StackNavigationProp } from '@react-navigation/stack';
import { Clinic } from '../types/clinic';
import { Article } from '../types/article';
import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Общий список параметров для всех навигационных стеков
 * Поддерживает все экраны приложения с их параметрами
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Patient: NavigatorScreenParams<PatientTabParamList>;
  Doctor: NavigatorScreenParams<DoctorTabParamList>;
  Admin: NavigatorScreenParams<AdminTabParamList>;

  // Основные экраны
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;

  // Экраны клиник и докторов
  Facilities: undefined;
  FacilitiesMap: { filter?: 'all' | 'hospital' | 'clinic' | 'pharmacy' };
  FacilityDetails: { facilityId: string };
  ClinicDetails: { clinicId: string } | { clinic: Clinic };
  DoctorDetails: { doctorId: string; doctorName: string };
  DoctorReviews: { doctorId: string };
  DoctorDocuments: { doctorId: string };
  FavoriteDoctors: undefined;
  Doctors: undefined;

  // Экраны медицинских данных
  MedicalCard: undefined;
  MedicalRecords: undefined;
  MedicalRecordDetails: { recordId: string; patientName: string };

  // Экраны записей и консультаций
  BookAppointment: {
    doctorId: string;
    doctorName: string;
    specialty: string;
    clinicId: string;
    clinicName: string;
    clinicAddress: string;
  };
  UpcomingAppointments: undefined;
  VisitHistory: undefined;
  ConsultationHistory: undefined;
  VideoConsultation: { appointmentId: string };

  // Экраны лекарств
  Medications: undefined;
  MedicationReminders: undefined;
  MedicationDetails: { medicationId: string };
  AddMedication: undefined;
  EditMedication: { medicationId: string };

  // Экраны для врачей
  DoctorPatients: undefined;
  DoctorSchedule: undefined;
  DoctorRequestDetails: { requestId: string };
  PatientDetails: { patientId: string };

  // Экраны для администраторов
  AdminDashboard: undefined;
  AdminUsers: undefined;
  StaffManagement: undefined;
  ClinicSchedule: undefined;
  ClinicAnalytics: undefined;
  ClinicManagement: undefined;
  SystemSettings: undefined;
  Reports: undefined;
  ActionLogs: undefined;
  DoctorRequests: undefined;
  AdminScreening: undefined;

  // Дополнительные экраны
  Articles: undefined;
  ArticleDetails: { article: Article };
  Chat: undefined;
  Notifications: undefined;
  ScreeningPrograms: undefined;
  EmergencyAIAssistant: undefined;
  FeedbackScreen: undefined;
  Favorites: undefined;
  Search: undefined;

  // Навигация по вкладкам
  PatientTabs: undefined;
  DoctorTabs: undefined;
  AdminTabs: undefined;

  ScreeningDetails: { programId: string };
  ScreeningSchedule: { programId: string };
};

// Типы для навигации (для useNavigation)
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Типизация для вкладок пациента
export type PatientTabParamList = {
  Home: undefined;
  FacilitiesMap: undefined;
  EmergencyAIAssistant: undefined;
  ScreeningPrograms: undefined;
  Settings: undefined;
};

// Типизация для вкладок врача
export type DoctorTabParamList = {
  Home: undefined;
  Facilities: undefined;
  Chat: undefined;
  Profile: undefined;
};

// Типизация для вкладок администратора
export type AdminTabParamList = {
  Home: undefined;
  AdminUsers: undefined;
  DoctorRequests: undefined;
  Profile: undefined;
};
