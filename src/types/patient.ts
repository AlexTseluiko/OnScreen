export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodType: string;
  allergies?: string[];
  medicalHistory?: string[];
  createdAt: string;
  updatedAt: string;
}
