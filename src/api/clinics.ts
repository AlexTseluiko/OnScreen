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
      const response = await apiClient.get<ApiResponse<GetClinicsResponse> | { clinics: Clinic[] }>(
        endpoint
      );

      // Логируем структуру ответа для отладки
      console.log('Клиники API ответ:', JSON.stringify(response.data, null, 2));

      // Проверяем различные возможные структуры ответа
      if (response.data && 'data' in response.data && response.data.data) {
        // Если структура { success: true, data: { clinics: [...], total: number } }
        if ('clinics' in response.data.data) {
          return response.data.data.clinics || [];
        }
        // Если структура { success: true, data: [...клиники] }
        else if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      // Если структура { clinics: [...] }
      else if (response.data && 'clinics' in response.data) {
        return response.data.clinics;
      }

      console.error('Неожиданная структура ответа API:', response.data);
      return [];
    } catch (error) {
      console.error('Ошибка при получении клиник:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Clinic | null> {
    try {
      // Проверяем валидность ID
      if (!id || id.trim() === '') {
        console.error('Invalid clinic ID');
        return null;
      }

      // Получаем данные клиники без добавления X-API-Key, так как это вызывает ошибку CORS
      const response = await apiClient.get<ApiResponse<{ clinic: Clinic }> | { clinic: Clinic }>(
        `/clinics/${id}`
      );

      // Логируем структуру ответа для отладки
      console.log('Ответ API для клиники:', JSON.stringify(response.data, null, 2));

      // Проверяем различные возможные структуры ответа
      if (response.data) {
        // Если структура { success: true, data: { clinic: {...} } }
        if ('data' in response.data && response.data.data && 'clinic' in response.data.data) {
          console.log('Клиника получена (структура 1):', response.data.data.clinic._id);
          return response.data.data.clinic;
        }
        // Если структура { clinic: {...} }
        else if ('clinic' in response.data) {
          console.log('Клиника получена (структура 2):', response.data.clinic._id);
          return response.data.clinic;
        }
      }

      console.error('Нет данных клиники в ответе');
      return null;
    } catch (error) {
      console.error(`Ошибка при получении клиники с ID ${id}:`, error);
      return null;
    }
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
