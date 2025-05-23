import { Router } from 'express';
import { auth, isAdmin } from '../middleware/auth';
import { Article } from '../models/Article';
import { Feedback } from '../models/Feedback';
import ScreeningProgram from '../models/ScreeningProgram';
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getClinics,
  updateClinic,
  deleteClinic,
  getArticles,
  updateArticle,
  deleteArticle,
  getReviews,
  updateReview,
  deleteReview,
} from '../controllers/adminController';

const router = Router();

// Статистика
router.get('/stats', auth, isAdmin, getStats);

// Управление пользователями
router.get('/users', auth, isAdmin, getUsers);
router.put('/users/:id', auth, isAdmin, updateUser);
router.delete('/users/:id', auth, isAdmin, deleteUser);

// Управление клиниками
router.get('/clinics', auth, isAdmin, getClinics);
router.put('/clinics/:id', auth, isAdmin, updateClinic);
router.delete('/clinics/:id', auth, isAdmin, deleteClinic);

// Управление статьями
router.get('/articles', auth, isAdmin, getArticles);
router.put('/articles/:id', auth, isAdmin, updateArticle);
router.delete('/articles/:id', auth, isAdmin, deleteArticle);

// Управление отзывами
router.get('/reviews', auth, isAdmin, getReviews);
router.put('/reviews/:id', auth, isAdmin, updateReview);
router.delete('/reviews/:id', auth, isAdmin, deleteReview);

// Тестовые маршруты для дебага
router.get('/test-articles', auth, isAdmin, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error('Ошибка при получении тестовых статей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/test-screening', auth, isAdmin, async (req, res) => {
  try {
    const programs = await ScreeningProgram.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    console.error('Ошибка при получении тестовых программ скрининга:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/test-feedback', auth, isAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ date: -1 }).limit(10);
    res.json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error('Ошибка при получении тестовой обратной связи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Тестовый маршрут для проверки вариантов формата статей
router.get('/test-articles-format', auth, isAdmin, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      // Формат 1: как в оригинальном контроллере
      format1: {
        data: articles,
        pagination: {
          total: articles.length,
          page: 1,
          limit: 10,
          pages: 1,
        },
      },
      // Формат 2: простой массив
      format2: articles,
      // Формат 3: как в контроллере screeningController
      format3: {
        articles: articles,
        total: articles.length,
        pages: 1,
        currentPage: 1,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении тестовых статей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Тестовый маршрут для проверки вариантов формата программ скрининга
router.get('/test-screening-format', auth, isAdmin, async (req, res) => {
  try {
    const programs = await ScreeningProgram.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      // Формат 1: как в оригинальном контроллере
      format1: {
        programs: programs,
        total: programs.length,
        pages: 1,
        currentPage: 1,
      },
      // Формат 2: простой массив
      format2: programs,
      // Формат 3: как в контроллере статей
      format3: {
        data: programs,
        pagination: {
          total: programs.length,
          page: 1,
          limit: 10,
          pages: 1,
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при получении тестовых программ скрининга:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
