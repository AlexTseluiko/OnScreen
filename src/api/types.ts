import { User } from '../types/user';
import { Article } from '../types/article';
import { Clinic } from '../types/clinic';
import { ApiResponse, PaginationData } from '../types/api';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface GetClinicsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface CreateReviewParams {
  rating: number;
  comment: string;
}

export interface UpdateUserRoleParams {
  userId: string;
  role: string;
}

export interface ToggleUserStatusParams {
  userId: string;
  isBlocked: boolean;
}

export interface ApiClient {
  // Users
  getUsers: (params: GetUsersParams) => Promise<ApiResponse<{ users: User[]; pagination?: PaginationData }>>;
  updateUserRole: (params: UpdateUserRoleParams) => Promise<void>;
  toggleUserStatus: (params: ToggleUserStatusParams) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Articles
  getArticles: (params: GetArticlesParams) => Promise<ApiResponse<{ articles: Article[]; pagination?: PaginationData }>>;
  getArticleById: (id: string) => Promise<ApiResponse<{ article: Article }>>;
  createArticle: (article: Omit<Article, '_id' | 'createdAt' | 'updatedAt'>) => Promise<ApiResponse<{ article: Article }>>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<ApiResponse<{ article: Article }>>;
  deleteArticle: (id: string) => Promise<void>;

  // Clinics
  getClinics: (params: GetClinicsParams) => Promise<ApiResponse<{ clinics: Clinic[]; pagination?: PaginationData }>>;
  getClinicById: (id: string) => Promise<ApiResponse<{ clinic: Clinic }>>;
  createClinic: (clinic: Omit<Clinic, '_id' | 'createdAt' | 'updatedAt'>) => Promise<ApiResponse<{ clinic: Clinic }>>;
  updateClinic: (id: string, clinic: Partial<Clinic>) => Promise<ApiResponse<{ clinic: Clinic }>>;
  deleteClinic: (id: string) => Promise<void>;
  createReview: (clinicId: string, review: CreateReviewParams) => Promise<ApiResponse<{ review: any }>>;
} 