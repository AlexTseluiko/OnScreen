import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';

// Типы для записей на прием
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Appointment {
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
    specialty: string;
  };
  clinic: {
    _id: string;
    name: string;
    address: string;
  };
  date: string;
  time: string;
  status: AppointmentStatus;
  type: 'online' | 'offline';
  notes?: string;
  symptoms?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  doctorId: string;
  clinicId: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  notes?: string;
  symptoms?: string[];
}

export const appointmentsApi = {
  /**
   * Получение списка записей пользователя
   */
  async getUserAppointments(status?: AppointmentStatus): Promise<Appointment[]> {
    try {
      const params: Record<string, string> = {};
      if (status) {
        params.status = status;
      }

      const response = await apiClient.get<Appointment[]>('/appointments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      throw error;
    }
  },

  /**
   * Создание новой записи на прием
   */
  async createAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    try {
      const response = await apiClient.post<Appointment>('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Обновление статуса записи
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<Appointment> {
    try {
      const response = await apiClient.put<Appointment>(`/appointments/${appointmentId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  /**
   * Отмена записи на прием
   */
  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error;
    }
  },

  /**
   * Получение доступного времени для приема у врача
   */
  async getDoctorAvailableSlots(
    doctorId: string,
    date: string
  ): Promise<{ time: string; available: boolean }[]> {
    try {
      const response = await apiClient.get<{ time: string; available: boolean }[]>(
        `/doctors/${doctorId}/available-slots`,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor available slots:', error);
      throw error;
    }
  },

  /**
   * Получение приемов врача
   */
  async getDoctorAppointments(doctorId: string, date: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/appointments`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  /**
   * Завершение приема с результатами консультации
   */
  async completeAppointment(
    appointmentId: string,
    data: { diagnosis: string; notes: string }
  ): Promise<any> {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },

  /**
   * Получение деталей приема
   */
  async getAppointmentDetails(appointmentId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      throw error;
    }
  },
};
