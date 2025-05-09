import { StackNavigationProp } from '@react-navigation/stack';
import { Clinic } from '../types/clinic';
import { Article } from '../types/article';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Facilities: undefined;
  FacilityDetails: { facilityId: string };
  ClinicDetails: { clinicId: string } | { clinic: Clinic };
  Profile: undefined;
  Settings: undefined;
  FacilitiesMap: undefined;
  Articles: undefined;
  ArticleDetails: { article: Article };
  Chat: undefined;
  ScreeningPrograms: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
  Notifications: undefined;
  DoctorRequestDetails: { requestId: string };
  PatientDetails: { patientId: string };
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
