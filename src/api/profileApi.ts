import { apiClient } from './apiClient';
import { Profile } from '../types/profile';
import { ApiResponse } from '../types/api';

export const getProfile = async (): Promise<Profile> => {
  const response = await apiClient.get<ApiResponse<{ profile: Profile }>>('/profile');

  if (!response.data || !response.data.profile) {
    throw new Error('Invalid response format');
  }

  return response.data.profile;
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const response = await apiClient.put<ApiResponse<{ profile: Profile }>>('/profile', profile);

  if (!response.data || !response.data.profile) {
    throw new Error('Invalid response format');
  }

  return response.data.profile;
};

export const uploadProfilePhoto = async (photo: FormData): Promise<{ photoUrl: string }> => {
  const response = await apiClient.post<ApiResponse<{ photoUrl: string }>>(
    '/profile/photo',
    photo,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data || !response.data.photoUrl) {
    throw new Error('Invalid response format');
  }

  return response.data;
};

export const deletePhoto = async (): Promise<void> => {
  await apiClient.delete('/profile/photo');
};
