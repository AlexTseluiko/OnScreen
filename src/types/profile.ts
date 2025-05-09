export interface Profile {
  id: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
  clinic?: string;
  address?: string;
  workingHours?: string;
  languages?: string[];
  education?: string[];
  certifications?: string[];
  createdAt: string;
  updatedAt: string;
}
