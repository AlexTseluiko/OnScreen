import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { Comment } from '../types/comment';
import { cacheService } from '../services/cacheService';

interface CreateCommentParams {
  content: string;
  parentCommentId?: string;
}

export const commentsApi = {
  async getArticleComments(articleId: string, page = 1) {
    const cacheKey = `cache_comments_${articleId}_${page}`;
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    const response = await apiClient.get(`${API_ENDPOINTS.ARTICLES.DETAILS(articleId)}/comments`, {
      params: { page },
    });

    if (response.data) {
      await cacheService.set(cacheKey, response.data);
    }
    return response;
  },

  async createComment(articleId: string, params: CreateCommentParams) {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ARTICLES.DETAILS(articleId)}/comments`,
      params
    );
    await cacheService.clear(); // Очищаем кэш комментариев
    return response;
  },

  async updateComment(commentId: string, content: string) {
    const response = await apiClient.put(`${API_ENDPOINTS.ARTICLES.LIST}/comments/${commentId}`, {
      content,
    });
    await cacheService.clear(); // Очищаем кэш комментариев
    return response;
  },

  async deleteComment(commentId: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ARTICLES.LIST}/comments/${commentId}`);
    await cacheService.clear(); // Очищаем кэш комментариев
    return response;
  },

  async likeComment(commentId: string) {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ARTICLES.LIST}/comments/${commentId}/like`
    );
    await cacheService.clear(); // Очищаем кэш комментариев
    return response;
  },
};
