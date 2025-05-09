import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import {
  Facility,
  FacilitySearchParams,
  GetFacilitiesResponse,
  FacilityReview,
} from '../types/facility';

export const getFacilities = async (params: FacilitySearchParams = {}): Promise<Facility[]> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.type) queryParams.append('type', params.type);
  if (params.rating) queryParams.append('rating', params.rating.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.services) {
    params.services.forEach(service => queryParams.append('services', service));
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/facilities?${queryString}` : '/facilities';

  try {
    const response = await apiClient.get<ApiResponse<GetFacilitiesResponse>>(endpoint);
    return response.data.facilities || [];
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
};

export const getFacilityById = async (id: string): Promise<Facility> => {
  const response = await apiClient.get<ApiResponse<{ facility: Facility }>>(`/facilities/${id}`);

  if (!response.data || !response.data.facility) {
    throw new Error('Invalid response format');
  }

  return response.data.facility;
};

export const getFacilityReviews = async (
  facilityId: string,
  params: { page?: number; limit?: number } = {}
): Promise<FacilityReview[]> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/facilities/${facilityId}/reviews?${queryString}`
    : `/facilities/${facilityId}/reviews`;

  try {
    const response = await apiClient.get<ApiResponse<{ reviews: FacilityReview[] }>>(endpoint);
    return response.data.reviews || [];
  } catch (error) {
    console.error('Error fetching facility reviews:', error);
    return [];
  }
};

export const createFacilityReview = async (
  facilityId: string,
  data: { rating: number; text: string }
): Promise<FacilityReview> => {
  const response = await apiClient.post<ApiResponse<{ review: FacilityReview }>>(
    `/facilities/${facilityId}/reviews`,
    data
  );

  if (!response.data || !response.data.review) {
    throw new Error('Invalid response format');
  }

  return response.data.review;
};

export const uploadFacilityImage = async (facilityId: string, imageUri: string): Promise<void> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as unknown as Blob);

  await apiClient.post(`/facilities/${facilityId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const facilitiesApi = {
  getFacilities,
  getFacilityById,
  getFacilityReviews,
  createFacilityReview,
  uploadFacilityImage,
  getAll: () => getFacilities(),
};
