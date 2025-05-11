/**
 * API для работы с лекарствами и напоминаниями
 */
import { apiClient } from './apiClient';

// Типы для лекарств
export enum MedicationFrequency {
  ONCE = 'once', // Один раз
  DAILY = 'daily', // Ежедневно
  TWICE_DAILY = 'twice_daily', // Дважды в день
  THREE_TIMES_DAILY = 'three_times_daily', // Трижды в день
  FOUR_TIMES_DAILY = 'four_times_daily', // Четыре раза в день
  WEEKLY = 'weekly', // Еженедельно
  MONTHLY = 'monthly', // Ежемесячно
  AS_NEEDED = 'as_needed', // По необходимости
  CUSTOM = 'custom', // Пользовательский график
}

export enum MedicationStatus {
  ACTIVE = 'active', // Активный прием
  COMPLETED = 'completed', // Завершен
  CANCELLED = 'cancelled', // Отменен
  PAUSED = 'paused', // Приостановлен
}

export enum MedicationFormType {
  TABLET = 'tablet', // Таблетки
  CAPSULE = 'capsule', // Капсулы
  LIQUID = 'liquid', // Жидкость
  INJECTION = 'injection', // Инъекции
  CREAM = 'cream', // Крем/мазь
  DROPS = 'drops', // Капли
  INHALER = 'inhaler', // Ингалятор
  PATCH = 'patch', // Пластырь
  POWDER = 'powder', // Порошок
  OTHER = 'other', // Другое
}

// Интерфейс для напоминания
export interface MedicationReminder {
  _id: string;
  medicationId: string;
  time: string; // Время в формате HH:MM
  taken: boolean;
  skipped: boolean;
  date: string; // Дата в формате YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для лекарства
export interface Medication {
  _id: string;
  userId: string;
  name: string;
  dosage: string; // Например, "10mg"
  form: MedicationFormType;
  frequency: MedicationFrequency;
  times: string[]; // Массив времени в формате HH:MM
  startDate: string; // Дата начала приема в формате YYYY-MM-DD
  endDate?: string; // Дата окончания приема в формате YYYY-MM-DD
  instructions?: string; // Дополнительные инструкции
  notes?: string; // Заметки пользователя
  status: MedicationStatus;
  prescribedBy?: string; // Кто назначил (имя врача или ID)
  reminderEnabled: boolean; // Включены ли напоминания
  createdAt: string;
  updatedAt: string;
  daysOfWeek?: number[]; // Для еженедельного приема: 0 = воскресенье, 6 = суббота
  customSchedule?: string; // JSON строка для пользовательского расписания
}

// Интерфейс для создания лекарства
export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  form: MedicationFormType;
  frequency: MedicationFrequency;
  times: string[]; // Массив времени в формате HH:MM
  startDate: string; // Дата начала приема в формате YYYY-MM-DD
  endDate?: string; // Дата окончания приема в формате YYYY-MM-DD
  instructions?: string; // Дополнительные инструкции
  notes?: string; // Заметки пользователя
  status?: MedicationStatus;
  prescribedBy?: string; // Кто назначил (имя врача или ID)
  reminderEnabled?: boolean; // Включены ли напоминания
  daysOfWeek?: number[]; // Для еженедельного приема: 0 = воскресенье, 6 = суббота
  customSchedule?: string; // JSON строка для пользовательского расписания
}

// API для работы с лекарствами
export const medicationsApi = {
  /**
   * Получение всех лекарств пользователя
   */
  async getUserMedications(): Promise<Medication[]> {
    try {
      const response = await apiClient.get<Medication[]>('/medications');
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  /**
   * Получение лекарства по ID
   */
  async getMedicationById(id: string): Promise<Medication> {
    try {
      const response = await apiClient.get<Medication>(`/medications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication by ID:', error);
      throw error;
    }
  },

  /**
   * Создание нового лекарства
   */
  async createMedication(data: CreateMedicationRequest): Promise<Medication> {
    try {
      const response = await apiClient.post<Medication>('/medications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },

  /**
   * Обновление лекарства
   */
  async updateMedication(id: string, data: Partial<Medication>): Promise<Medication> {
    try {
      const response = await apiClient.put<Medication>(`/medications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  /**
   * Удаление лекарства
   */
  async deleteMedication(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/medications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },

  /**
   * Получение напоминаний для лекарства
   */
  async getMedicationReminders(medicationId: string): Promise<MedicationReminder[]> {
    try {
      const response = await apiClient.get<MedicationReminder[]>(
        `/medications/${medicationId}/reminders`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
      throw error;
    }
  },

  /**
   * Получение напоминаний на сегодня
   */
  async getTodayReminders(): Promise<MedicationReminder[]> {
    try {
      const response = await apiClient.get<MedicationReminder[]>('/medications/reminders/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today reminders:', error);
      throw error;
    }
  },

  /**
   * Получение напоминаний за определенный день
   */
  async getRemindersForDate(date: string): Promise<MedicationReminder[]> {
    try {
      const response = await apiClient.get<MedicationReminder[]>('/medications/reminders', {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders for date:', error);
      throw error;
    }
  },

  /**
   * Отметить лекарство как принятое
   */
  async markReminderAsTaken(reminderId: string): Promise<MedicationReminder> {
    try {
      const response = await apiClient.put<MedicationReminder>(
        `/medications/reminders/${reminderId}/take`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking reminder as taken:', error);
      throw error;
    }
  },

  /**
   * Отметить лекарство как пропущенное
   */
  async markReminderAsSkipped(reminderId: string): Promise<MedicationReminder> {
    try {
      const response = await apiClient.put<MedicationReminder>(
        `/medications/reminders/${reminderId}/skip`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking reminder as skipped:', error);
      throw error;
    }
  },
};
