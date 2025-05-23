import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config/api';

// Интерфейсы для работы со скрининговыми программами
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

export interface ScreeningProgram {
  id: string;
  title: string;
  titleRu: string;
  titleUk: string;
  description: string;
  descriptionRu: string;
  descriptionUk: string;
  details: string;
  detailsRu: string;
  detailsUk: string;
  riskFactors: string[];
  riskFactorsRu: string[];
  riskFactorsUk: string[];
  frequency: string;
  frequencyRu: string;
  frequencyUk: string;
  nextScreening?: string;
  category: string;
  categoryRu: string;
  categoryUk: string;
  tests: ScreeningTest[];
  benefits: string[];
  benefitsRu: string[];
  benefitsUk: string[];
  preparation: string;
  preparationRu: string;
  preparationUk: string;
  aftercare: string;
  aftercareRu: string;
  aftercareUk: string;
  recommendedFor: string[];
  recommendedForRu: string[];
  recommendedForUk: string[];
}

// Интерфейс для скриннинговой записи
export interface ScreeningAppointment {
  id: string;
  programId: string;
  userId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API функции для работы со скрининговыми программами

/**
 * Получить список всех скрининговых программ
 */
export const getScreeningPrograms = async (): Promise<ScreeningProgram[]> => {
  try {
    const response = await axios.get(`${API_URL}${API_ENDPOINTS.SCREENING.PROGRAMS}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении скрининговых программ:', error);
    throw error;
  }
};

/**
 * Получить скрининговую программу по ID
 */
export const getScreeningProgramById = async (id: string): Promise<ScreeningProgram> => {
  try {
    const response = await axios.get(`${API_URL}${API_ENDPOINTS.SCREENING.PROGRAMS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении скрининговой программы с ID ${id}:`, error);
    throw error;
  }
};

/**
 * Создать новую скрининговую программу
 */
export const createScreeningProgram = async (
  program: Omit<ScreeningProgram, 'id'>
): Promise<ScreeningProgram> => {
  try {
    const response = await axios.post(`${API_URL}${API_ENDPOINTS.SCREENING.PROGRAMS}`, program);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании скрининговой программы:', error);
    throw error;
  }
};

/**
 * Обновить скрининговую программу
 */
export const updateScreeningProgram = async (
  id: string,
  program: Partial<ScreeningProgram>
): Promise<ScreeningProgram> => {
  try {
    const response = await axios.put(
      `${API_URL}${API_ENDPOINTS.SCREENING.PROGRAMS}/${id}`,
      program
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении скрининговой программы с ID ${id}:`, error);
    throw error;
  }
};

/**
 * Удалить скрининговую программу
 */
export const deleteScreeningProgram = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}${API_ENDPOINTS.SCREENING.PROGRAMS}/${id}`);
  } catch (error) {
    console.error(`Ошибка при удалении скрининговой программы с ID ${id}:`, error);
    throw error;
  }
};

/**
 * Запланировать скрининг
 */
export const scheduleScreening = async (
  programId: string,
  date: string,
  userId: string
): Promise<ScreeningAppointment> => {
  try {
    const response = await axios.post(`${API_URL}${API_ENDPOINTS.SCREENING.SCHEDULE}`, {
      programId,
      date,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при планировании скрининга:', error);
    throw error;
  }
};
