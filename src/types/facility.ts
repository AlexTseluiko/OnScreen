import { User } from './user';

export interface Facility {
  id: string;
  name: string;
  type: 'clinic' | 'hospital' | 'laboratory' | 'pharmacy';
  address: string;
  description: string;
  rating: number;
  reviews: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  images: string[];
  doctors?: User[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
}

export interface FacilitySearchParams {
  search?: string;
  type?: Facility['type'];
  rating?: number;
  page?: number;
  limit?: number;
  services?: string[];
}

export interface GetFacilitiesResponse {
  facilities: Facility[];
  total: number;
}

export interface FacilityReview {
  id: string;
  facilityId: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}
