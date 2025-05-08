import { apiClient } from './apiClient';
import { Profile } from '../types/profile';

export const profileApi = {
  async getProfile(): Promise<{ profile: Profile }> {
    const response = await apiClient.get<{ profile: Profile }>('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Profile>): Promise<{ profile: Profile }> {
    const response = await apiClient.put<{ profile: Profile }>('/profile', data);
    return response.data;
  },

  async uploadPhoto(file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.post<{ photoUrl: string }>('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePhoto(): Promise<void> {
    await apiClient.delete('/profile/photo');
  },
}; 