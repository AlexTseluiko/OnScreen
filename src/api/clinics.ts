import { apiClient } from './apiClient';
import { MedicalFacility } from '../types/medical';

export interface Clinic {
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

export interface ClinicSearchParams {
  search?: string;
  type?: MedicalFacility['type'];
  rating?: number;
  page?: number;
  limit?: number;
}

export const clinicsApi = {
  async getAll(params: ClinicSearchParams = {}): Promise<Clinic[]> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/clinics?${queryString}` : '/clinics';
    
    try {
      const response = await apiClient.get<{ clinics: Clinic[], total: number }>(endpoint);
      return response.data.clinics || [];
    } catch (error) {
      console.error('Error fetching clinics:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Clinic> {
    const response = await apiClient.get<Clinic>(`/clinics/${id}`);
    return response.data;
  },

  async createReview(clinicId: string, data: {
    rating: number;
    text: string;
  }): Promise<void> {
    await apiClient.post(`/reviews`, {
      clinic: clinicId,
      ...data
    });
  },

  async uploadImage(clinicId: string, imageUri: string): Promise<void> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    await apiClient.post(`/clinics/${clinicId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}; 