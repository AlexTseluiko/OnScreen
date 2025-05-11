import { User } from './user';

export interface Profile extends User {
  _id?: string; // Для совместимости с MongoDB ID
  birthDate?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}
