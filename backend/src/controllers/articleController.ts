import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { handleError } from '../utils/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const articleController = {
  // Получение всех статей с пагинацией
  async getArticles(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      console.log('Запрос статей с параметрами:', req.query); // Лог для отладки

      const query: Record<string, unknown> = {};

      // Фильтрация по статусу - работаем с обоими вариантами параметров для совместимости
      if (req.query.status) {
        query.status = req.query.status;
      } else if (req.query.published === 'true') {
        query.status = 'published';
      } else if (req.query.published === 'false') {
        query.status = 'draft';
      } else if (!req.query.status && !req.query.published) {
        // По умолчанию показываем только опубликованные на фронте
        if (req.headers['x-admin'] !== 'true') {
          query.status = 'published';
        }
      }

      // Фильтрация по категории
      if (req.query.category) {
        query.category = req.query.category;
      }

      // Поиск по заголовку
      if (req.query.search) {
        query.title = { $regex: req.query.search, $options: 'i' };
      }

      console.log('Итоговый запрос к MongoDB:', query); // Лог для отладки

      const [articles, total] = await Promise.all([
        Article.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'firstName lastName')
          .lean(),
        Article.countDocuments(query),
      ]);

      console.log(`Найдено ${articles.length} статей из ${total}`); // Лог для отладки

      res.json({
        articles,
        currentPage: page,
        pages: Math.ceil(total / limit),
        total,
      });
    } catch (error) {
      handleError(res, 'Error fetching articles', error);
    }
  },

  // Получение статьи по ID
  async getArticleById(req: Request, res: Response) {
    try {
      const article = await Article.findById(req.params.id)
        .populate('author', 'firstName lastName')
        .lean();

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      handleError(res, 'Error fetching article', error);
    }
  },

  // Создание новой статьи
  async createArticle(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Проверяем обязательные поля
      const { title, content, category } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Title, content and category are required',
        });
      }

      const article = new Article({
        title,
        content,
        category,
        tags: req.body.tags || [],
        author: req.user.id,
        status: 'published',
      });

      const savedArticle = await article.save();
      console.log('Saved article:', savedArticle); // Добавляем лог для отладки

      // Возвращаем статью с данными автора
      const populatedArticle = await Article.findById(savedArticle._id)
        .populate('author', 'firstName lastName')
        .lean();

      res.status(201).json(populatedArticle);
    } catch (error) {
      console.error('Error creating article:', error); // Добавляем лог для отладки
      handleError(res, 'Error creating article', error);
    }
  },

  // Обновление статьи
  async updateArticle(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Проверка прав доступа
      if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Обновляем только разрешенные поля
      const { title, content, category, tags, status } = req.body;
      if (title) article.title = title;
      if (content) article.content = content;
      if (category) article.category = category;
      if (tags) article.tags = tags;
      if (status) article.status = status;

      const updatedArticle = await article.save();
      console.log('Updated article:', updatedArticle); // Добавляем лог для отладки

      // Возвращаем обновленную статью с данными автора
      const populatedArticle = await Article.findById(updatedArticle._id)
        .populate('author', 'firstName lastName')
        .lean();

      res.json(populatedArticle);
    } catch (error) {
      console.error('Error updating article:', error); // Добавляем лог для отладки
      handleError(res, 'Error updating article', error);
    }
  },

  // Удаление статьи
  async deleteArticle(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Проверка прав доступа
      if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await article.deleteOne();
      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      handleError(res, 'Error deleting article', error);
    }
  },

  // Получение категорий статей
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await Article.distinct('category');
      res.json(categories);
    } catch (error) {
      handleError(res, 'Error fetching categories', error);
    }
  },
};
