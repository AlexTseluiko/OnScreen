import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ClinicDetails: { clinicId: string };
  ArticleDetails: { articleId: string };
  Map: undefined;
  ForgotPassword: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>; 