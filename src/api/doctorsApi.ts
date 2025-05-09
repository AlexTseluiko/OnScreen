import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import {
  Doctor,
  DoctorSearchParams,
  DoctorSearchResponse,
  DoctorPatientsResponse,
} from '../types/doctor';

export const searchDoctors = async (params: DoctorSearchParams): Promise<Doctor[]> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.specialization) queryParams.append('specialization', params.specialization);
  if (params.rating) queryParams.append('rating', params.rating.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';

  try {
    const response = await apiClient.get<ApiResponse<DoctorSearchResponse>>(endpoint);
    return response.data.doctors || [];
  } catch (error) {
    console.error('Error searching doctors:', error);
    return [];
  }
};

export const getDoctorById = async (id: string): Promise<Doctor> => {
  const response = await apiClient.get<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`);

  if (!response.data || !response.data.doctor) {
    throw new Error('Invalid response format');
  }

  return response.data.doctor;
};

export const getDoctorPatients = async (doctorId: string): Promise<DoctorPatientsResponse> => {
  const response = await apiClient.get<ApiResponse<DoctorPatientsResponse>>(
    `/doctors/${doctorId}/patients`
  );

  if (!response.data || !response.data.patients) {
    throw new Error('Invalid response format');
  }

  return response.data;
};

export const doctorsApi = {
  // Добавление пациента к доктору
  async addPatient(doctorId: string, patientId: string): Promise<void> {
    await apiClient.post(`/doctors/${doctorId}/patients`, { patientId });
  },

  // Удаление пациента у доктора
  async removePatient(doctorId: string, patientId: string): Promise<void> {
    await apiClient.delete(`/doctors/${doctorId}/patients/${patientId}`);
  },

  // Получение списка пациентов доктора
  async getDoctorPatients(doctorId: string): Promise<DoctorPatientsResponse> {
    const response = await apiClient.get<ApiResponse<DoctorPatientsResponse>>(
      `/doctors/${doctorId}/patients`
    );

    if (!response.data || !response.data.patients) {
      throw new Error('Invalid response format');
    }

    return response.data;
  },

  // Поиск врачей
  async searchDoctors(params: DoctorSearchParams): Promise<Doctor[]> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';

    try {
      const response = await apiClient.get<ApiResponse<DoctorSearchResponse>>(endpoint);
      return response.data.doctors || [];
    } catch (error) {
      console.error('Error searching doctors:', error);
      return [];
    }
  },
};
