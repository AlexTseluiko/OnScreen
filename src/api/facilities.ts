import { apiClient } from './apiClient';
import { MedicalFacility } from '../types/medical';
import { AxiosResponse } from 'axios';

export interface Facility {
  id: string;
  name: string;
  address: string;
  description: string;
  rating: number;
  reviews: number;
  type: MedicalFacility['type'];
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
}

export interface FacilitySearchParams {
  search?: string;
  type?: MedicalFacility['type'];
  rating?: number;
  page?: number;
  limit?: number;
}

export interface FacilityFilters {
  search?: string;
  services?: string[];
  rating?: number;
  workingHours?: {
    day: string;
    time: string;
  };
  type?: MedicalFacility['type'];
  radius?: number;
  lat?: number;
  lng?: number;
}

export const facilitiesApi = {
  async getAll(params: FacilitySearchParams = {}): Promise<Facility[]> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/facilities?${queryString}` : '/facilities';
    const response = await apiClient.get<Facility[]>(endpoint);
    return response.data;
  },

  async getById(id: string): Promise<Facility> {
    const response = await apiClient.get<Facility>(`/facilities/${id}`);
    return response.data;
  },

  async getNearby(lat: number, lng: number, radius: number): Promise<Facility[]> {
    const response = await apiClient.get<Facility[]>(`/facilities/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },

  async createReview(facilityId: string, data: {
    rating: number;
    comment: string;
  }): Promise<void> {
    await apiClient.post(`/facilities/${facilityId}/reviews`, data);
  },

  async uploadImage(facilityId: string, imageUri: string): Promise<void> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    await apiClient.post(`/facilities/${facilityId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 