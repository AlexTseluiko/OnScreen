import { Patient } from '../types/patient';
import { api } from './api';

export const getPatientDetails = async (patientId: string): Promise<Patient> => {
  try {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await api.get('/patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const updatePatient = async (
  patientId: string,
  data: Partial<Patient>
): Promise<Patient> => {
  try {
    const response = await api.put(`/patients/${patientId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};
