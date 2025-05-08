export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
  } | string;
}

export interface Review {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface Clinic {
  _id: string;
  name: string;
  description?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  photos?: string[];
  rating: number;
  reviewsCount: number;
  services: string[];
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
} 