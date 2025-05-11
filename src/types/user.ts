import { User as BaseUser } from './models';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: 'patient' | 'doctor' | 'admin';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  isVerified?: boolean;
  isBlocked?: boolean;
  password?: string;
}

export interface UserProfile extends User {
  // Дополнительные поля для профиля пользователя
  medicalHistory?: string[];
  // Удаляю дублирующиеся поля, так как они уже определены в User
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
}

export interface UserData {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
