export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'user' | 'admin';
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  specialties: string[];
  services: string[];
  rating: number;
  reviews: number;
  workingHours: {
    [key: string]: string;
  };
  phone: string;
  email: string;
  website: string;
  description?: string;
  images?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean | null;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Базовые типы для API ответов
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Типы для ошибок
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Типы для пагинации
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Типы для фильтрации
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Типы для метаданных
export interface MetaData {
  createdAt: string;
  updatedAt: string;
  version: number;
}
