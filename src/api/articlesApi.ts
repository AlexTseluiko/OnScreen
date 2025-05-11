import { apiClient } from './apiClient';
import { Article } from '../types/article';
import { ArticlesResponse, GetArticlesParams } from '../types/api';

// API для работы со статьями
export const articlesApi = {
  // Получение списка статей
  getArticles: (params: GetArticlesParams = {}) => {
    return apiClient.get<ArticlesResponse>('/articles', { params });
  },

  // Получение отдельной статьи по ID
  getArticleById: (id: string) => {
    return apiClient.get<{ article: Article }>(`/articles/${id}`);
  },

  // Получение категорий
  getCategories: () => {
    return apiClient.get<{ categories: string[] }>('/articles/categories');
  },

  // Добавление/удаление статьи в закладки
  toggleBookmark: (articleId: string) => {
    return apiClient.post(`/articles/${articleId}/bookmark`);
  },

  // Получение закладок пользователя
  getBookmarks: () => {
    return apiClient.get<ArticlesResponse>('/articles/bookmarks');
  },

  // Поиск статей
  searchArticles: (query: string) => {
    return apiClient.get<ArticlesResponse>('/articles/search', {
      params: { query },
    });
  },
};
