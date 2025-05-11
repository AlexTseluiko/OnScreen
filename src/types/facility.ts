export interface Facility {
  id: string;
  name: string;
  description?: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'sports' | 'entertainment' | 'education' | 'other';
  rating?: number;
  images?: string[];
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
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
