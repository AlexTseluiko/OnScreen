import axios from 'axios';
import { API_URL } from '../constants';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string;
  lastVisit?: string;
  nextAppointment?: string;
}

export const doctorApi = {
  getPatients: async (): Promise<{ patients: Patient[] }> => {
    try {
      const response = await axios.get(`${API_URL}/doctor/patients`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },
};
