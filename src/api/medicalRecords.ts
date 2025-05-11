import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

// Типы для медицинских записей
export interface MedicalRecord {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clinic: {
    _id: string;
    name: string;
  };
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  notes: string;
  attachments: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordRequest {
  patientId: string;
  doctorId: string;
  clinicId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medications?: string[];
  notes?: string;
  isPrivate?: boolean;
}

export const medicalRecordsApi = {
  /**
   * Получение списка медицинских записей пациента
   */
  async getPatientRecords(patientId: string): Promise<MedicalRecord[]> {
    try {
      const response = await apiClient.get<MedicalRecord[]>(
        `/medical-records/patient/${patientId}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      throw error;
    }
  },

  /**
   * Получение деталей медицинской записи по ID
   */
  async getRecordById(recordId: string): Promise<MedicalRecord> {
    try {
      const response = await apiClient.get<MedicalRecord>(`/medical-records/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record details:', error);
      throw error;
    }
  },

  /**
   * Создание новой медицинской записи
   */
  async createRecord(recordData: MedicalRecordRequest): Promise<MedicalRecord> {
    try {
      const response = await apiClient.post<MedicalRecord>('/medical-records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  /**
   * Обновление существующей медицинской записи
   */
  async updateRecord(
    recordId: string,
    recordData: Partial<MedicalRecordRequest>
  ): Promise<MedicalRecord> {
    try {
      const response = await apiClient.put<MedicalRecord>(
        `/medical-records/${recordId}`,
        recordData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },

  /**
   * Удаление медицинской записи
   */
  async deleteRecord(recordId: string): Promise<void> {
    try {
      await apiClient.delete(`/medical-records/${recordId}`);
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  },
};
