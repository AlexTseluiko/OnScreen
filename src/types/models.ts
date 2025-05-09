export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'doctor';
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
}

export interface UserProfile extends User {
  birthDate?: string;
  gender?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

export interface Clinic {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  email: string;
  website?: string;
  specialties: string[];
  services: string[];
  rating: number;
  reviews: number;
  workingHours: {
    [key: string]: string;
  };
  images?: string[];
  description?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinicId: string;
  rating: number;
  reviews: number;
  photoUrl?: string;
  schedule?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  photoUrl?: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

export interface Schedule {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  patientId?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

export interface ScreeningProgram {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  frequency: string;
  riskFactors: string[];
  details: string;
  price?: number;
  duration?: string;
  requirements?: string[];
}
