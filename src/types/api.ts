import { User } from './user';
import { Article } from './article';
import { Clinic, Review } from './clinic';

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
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

export interface ClinicResponse {
  clinic: Clinic;
  reviews: Review[];
  pagination?: PaginationData;
}

export interface ClinicsResponse {
  clinics: Clinic[];
  pagination?: PaginationData;
}

export interface CreateReviewParams {
  rating: number;
  comment: string;
} 