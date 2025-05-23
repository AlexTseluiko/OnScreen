import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { Article } from '../types/article';
import { ArticlesResponse, GetArticlesParams } from '../types/api';
import { cacheService } from '../services/cacheService';

// API для работы со статьями
export const articlesApi = {
  // Получение списка статей
  async getArticles(
    params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      sortBy?: string;
    } = {}
  ) {
    try {
      const { page, limit, category, search, sortBy } = params;
      let url = '/articles';

      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', page.toString());
      if (limit) searchParams.append('limit', limit.toString());
      if (category) searchParams.append('category', category);
      if (search) searchParams.append('search', search);
      if (sortBy) searchParams.append('sortBy', sortBy);

      // Всегда запрашиваем только опубликованные статьи для фронта
      searchParams.append('status', 'published');

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }

      console.log('Запрос статей с фронта:', url); // Добавляем для отладки

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Получение отдельной статьи по ID
  async getArticleById(id: string) {
    const cacheKey = `cache_article_${id}`;
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    const response = await apiClient.get(API_ENDPOINTS.ARTICLES.DETAILS(id));
    if (response.data) {
      await cacheService.set(cacheKey, response.data);
    }
    return response;
  },

  // Получение категорий
  async getCategories() {
    const cacheKey = 'cache_article_categories';
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      return { data: cachedData };
    }

    const response = await apiClient.get(`${API_ENDPOINTS.ARTICLES.LIST}/categories`);
    if (response.data) {
      await cacheService.set(cacheKey, response.data);
    }
    return response;
  },

  // Добавление/удаление статьи в закладки
  async toggleBookmark(articleId: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.ARTICLES.DETAILS(articleId)}/bookmark`);
    await cacheService.remove(`cache_article_${articleId}`);
    return response;
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

  async createArticle(article: Partial<Article>) {
    const response = await apiClient.post(API_ENDPOINTS.ARTICLES.CREATE, article);
    await cacheService.clear(); // Очищаем кэш при создании новой статьи
    return response;
  },

  async updateArticle(id: string, article: Partial<Article>) {
    const response = await apiClient.put(API_ENDPOINTS.ARTICLES.UPDATE(id), article);
    await cacheService.remove(`cache_article_${id}`);
    await cacheService.clear(); // Очищаем кэш списка статей
    return response;
  },

  async deleteArticle(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.ARTICLES.DELETE(id));
    await cacheService.remove(`cache_article_${id}`);
    await cacheService.clear(); // Очищаем кэш списка статей
    return response;
  },
};
