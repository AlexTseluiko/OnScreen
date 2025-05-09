import { User } from './user';
import { Article } from './article';
import { Clinic, Review } from './clinic';
import { UserProfile, Doctor, Patient, Schedule, ScreeningProgram } from './models';

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface ClinicResponse {
  clinic: Clinic;
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DoctorResponse {
  doctor: Doctor;
  patients: Patient[];
  schedule: Schedule[];
}

export interface ScreeningProgramResponse {
  program: ScreeningProgram;
  participants: number;
  nextScreening: string;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationData;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationData;
  categories?: string[];
}

export interface ClinicsResponse {
  clinics: Clinic[];
  pagination?: PaginationData;
}

export interface CreateReviewParams {
  rating: number;
  comment: string;
}
