export interface User {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  titleRu: string;
  titleUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  category: string;
  categoryRu: string;
  categoryUk: string;
  details: string;
  detailsRu: string;
  detailsUk: string;
  riskFactors: string[];
  riskFactorsRu: string[];
  riskFactorsUk: string[];
  frequency: string;
  frequencyRu: string;
  frequencyUk: string;
  recommendedFor: string[];
  recommendedForRu: string[];
  recommendedForUk: string[];
  benefits: string[];
  benefitsRu: string[];
  benefitsUk: string[];
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  aftercare: string;
  aftercareRu: string;
  aftercareUk: string;
  tests: ScreeningTest[];
  nextScreening?: string;
}

export interface ScreeningTest {
  id: string;
  name: string;
  nameRu: string;
  nameUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  price: number;
  duration: number;
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  results: string;
  resultsRu: string;
  resultsUk: string;
}
