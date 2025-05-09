import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { Clinic } from '../types/clinic';

export interface ClinicSearchParams {
  search?: string;
  type?: string;
  rating?: number;
  page?: number;
  limit?: number;
  specialties?: string[];
}

export interface GetClinicsResponse {
  clinics: Clinic[];
  total: number;
}

export const clinicsApi = {
  async getAll(params: ClinicSearchParams = {}): Promise<Clinic[]> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.specialties) {
      params.specialties.forEach(specialty => queryParams.append('specialties', specialty));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/clinics?${queryString}` : '/clinics';

    try {
      const response = await apiClient.get<ApiResponse<GetClinicsResponse>>(endpoint);
      return response.data.clinics || [];
    } catch (error) {
      console.error('Error fetching clinics:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Clinic> {
    const response = await apiClient.get<ApiResponse<{ clinic: Clinic }>>(`/clinics/${id}`);
    return response.data.clinic;
  },

  async createReview(
    clinicId: string,
    data: {
      rating: number;
      text: string;
    }
  ): Promise<void> {
    await apiClient.post(`/reviews`, {
      clinic: clinicId,
      ...data,
    });
  },

  async uploadImage(clinicId: string, imageUri: string): Promise<void> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as unknown as Blob);

    await apiClient.post(`/clinics/${clinicId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
