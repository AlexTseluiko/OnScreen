import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';

interface FeedbackData {
  feedbackText: string;
  feedbackType: 'suggestion' | 'bug' | 'other';
  email?: string;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
  error?: string;
}

export const feedbackApi = {
  /**
   * Отправка обратной связи на сервер
   */
  async sendFeedback(data: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await apiClient.post<ApiResponse<FeedbackResponse>>('/feedback', data);

      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format');
      }

      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке обратной связи:', error);
      throw error;
    }
  },
};
