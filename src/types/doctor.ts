import { User } from './user';

export interface DoctorRequest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  specialization: string;
  experience: string;
  education: string;
  licenseNumber: string;
  about: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface Doctor {
  _id: string;
  id: string;
  userId: string;
  name: string;
  specialization: string;
  experience: string;
  education: string;
  licenseNumber: string;
  about: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  photoUrl?: string;
  clinic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSearchParams {
  search?: string;
  specialization?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export interface DoctorSearchResponse {
  doctors: Doctor[];
  total: number;
}

export interface DoctorPatientsResponse {
  patients: User[];
  total: number;
}
