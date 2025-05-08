import { MedicalFacility } from './medical';

export type RootStackParamList = {
  MapMain: undefined;
  ClinicDetails: { clinic: MedicalFacility };
};

export type RootTabParamList = {
  Map: undefined;
  Favorites: undefined;
  Settings: undefined;
}; 