export interface MedicalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  phone: string;
  rating: number;
  services: string[];
  workingHours: {
    open: string;
    close: string;
  };
  isFavorite?: boolean;
  distance?: number;
  photos?: string[];
  reviews?: Review[];
  onlineBooking?: boolean;
  description?: string;
  specialties?: string[];
  insurance?: string[];
  parking?: boolean;
  wheelchairAccessible?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
}

export interface WorkingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}
