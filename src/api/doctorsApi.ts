import { apiClient } from './apiClient';
import { AxiosResponse } from 'axios';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  photoUrl?: string;
  clinic: string;
  address: string;
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  languages: string[];
  education: string[];
  certifications: string[];
  patients: string[];
}

export interface DoctorSearchParams {
  specialization?: string;
  rating?: number;
  experience?: number;
  language?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorSearchResponse {
  data: {
    doctors: Doctor[];
    total: number;
  };
}

export interface DoctorPatientsResponse {
  data: {
    patients: Array<{
      id: string;
      name: string;
      photoUrl?: string;
      lastVisit?: string;
      nextAppointment?: string;
      status: 'active' | 'inactive';
    }>;
  };
}

export const doctorsApi = {
  // Поиск докторов
  async searchDoctors(params: DoctorSearchParams = {}): Promise<DoctorSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.experience) queryParams.append('experience', params.experience.toString());
    if (params.language) queryParams.append('language', params.language);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';
    return apiClient.get<DoctorSearchResponse['data']>(endpoint);
  },

  // Получение доктора по ID
  async getDoctorById(id: string): Promise<Doctor> {
    const response = await apiClient.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },

  // Получение списка пациентов доктора
  async getDoctorPatients(doctorId: string): Promise<DoctorPatientsResponse> {
    return apiClient.get<DoctorPatientsResponse['data']>(`/doctors/${doctorId}/patients`);
  },

  // Добавление пациента к доктору
  async addPatient(doctorId: string, patientId: string): Promise<void> {
    await apiClient.post(`/doctors/${doctorId}/patients`, { patientId });
  },

  // Удаление пациента у доктора
  async removePatient(doctorId: string, patientId: string): Promise<void> {
    await apiClient.delete(`/doctors/${doctorId}/patients/${patientId}`);
  }
}; 