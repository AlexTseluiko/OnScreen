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
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}
