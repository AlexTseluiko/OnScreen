import { apiClient } from './apiClient';

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
      const response = await apiClient.post<FeedbackResponse>('/feedback', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке обратной связи:', error);
      throw error;
    }
  },
}; 