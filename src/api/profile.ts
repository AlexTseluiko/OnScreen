import { apiClient } from './apiClient';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  medicalHistory: string;
  allergies: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  medications: string[];
  chronicConditions: string[];
  lastCheckup: string;
  preferredLanguage: string;
  height?: string;
  weight?: string;
  avatarUrl?: string;
}

// Интерфейс для профиля пациента
export interface PatientProfileData {
  userId: string;
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  medicalHistory: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  preferredLanguage: string;
  lastCheckup: Date | string | null;
  familyDoctor?: string;
  avatarUrl?: string;
}

// Интерфейс для профиля доктора
export interface DoctorProfileData {
  userId: string;
  specialization: string;
  education: string[];
  experience: string;
  certificates: string[];
  languages: string[];
  biography: string;
  consultationFee?: number;
  availability?: {
    days: string[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  workplaces?: {
    clinicName: string;
    address: string;
    position: string;
    startDate: string;
    endDate?: string;
  }[];
  avatarUrl?: string;
  verified: boolean;
}

export const profileApi = {
  // Базовые методы для профиля
  getProfile: async (): Promise<ProfileData> => {
    return apiClient.get('/profile');
  },

  updateProfile: async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
    return apiClient.put('/profile', profileData);
  },

  uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
    return apiClient.post('/profile/avatar', formData);
  },

  // Методы для профиля пациента
  getPatientProfile: async (userId?: string): Promise<PatientProfileData> => {
    const endpoint = userId ? `/patient-profiles/${userId}` : '/patient-profiles/me';
    return apiClient.get(endpoint);
  },

  createOrUpdatePatientProfile: async (
    profileData: Partial<PatientProfileData>,
    userId?: string
  ): Promise<PatientProfileData> => {
    const endpoint = userId ? `/patient-profiles/${userId}` : '/patient-profiles';
    return apiClient.post(endpoint, profileData);
  },

  deletePatientProfile: async (userId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/patient-profiles/${userId}`);
  },

  // Методы для профиля доктора
  getDoctorProfile: async (userId?: string): Promise<DoctorProfileData> => {
    const endpoint = userId ? `/doctor-profiles/${userId}` : '/doctor-profiles/me';
    return apiClient.get(endpoint);
  },

  getAllDoctorProfiles: async (params?: {
    specialization?: string;
    verified?: boolean;
  }): Promise<DoctorProfileData[]> => {
    const queryParams = new URLSearchParams();

    if (params?.specialization) queryParams.append('specialization', params.specialization);
    if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());

    const queryString = queryParams.toString();
    const endpoint = `/doctor-profiles${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(endpoint);
  },

  createOrUpdateDoctorProfile: async (
    profileData: Partial<DoctorProfileData>,
    userId?: string
  ): Promise<DoctorProfileData> => {
    const endpoint = userId ? `/doctor-profiles/${userId}` : '/doctor-profiles';
    return apiClient.post(endpoint, profileData);
  },

  verifyDoctorProfile: async (userId: string, verified: boolean): Promise<{ message: string }> => {
    return apiClient.put(`/doctor-profiles/${userId}/verify`, { verified });
  },

  deleteDoctorProfile: async (userId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/doctor-profiles/${userId}`);
  },
};
