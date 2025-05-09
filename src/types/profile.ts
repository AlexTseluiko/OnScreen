import { User } from './user';

export interface Profile extends User {
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
