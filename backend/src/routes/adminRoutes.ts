import { Router } from 'express';
import { isAdmin } from '../middleware/auth';
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
router.get('/stats', isAdmin, getStats);

// Управление пользователями
router.get('/users', isAdmin, getUsers);
router.put('/users/:id', isAdmin, updateUser);
router.delete('/users/:id', isAdmin, deleteUser);

// Управление клиниками
router.get('/clinics', isAdmin, getClinics);
router.put('/clinics/:id', isAdmin, updateClinic);
router.delete('/clinics/:id', isAdmin, deleteClinic);

// Управление статьями
router.get('/articles', isAdmin, getArticles);
router.put('/articles/:id', isAdmin, updateArticle);
router.delete('/articles/:id', isAdmin, deleteArticle);

// Управление отзывами
router.get('/reviews', isAdmin, getReviews);
router.put('/reviews/:id', isAdmin, updateReview);
router.delete('/reviews/:id', isAdmin, deleteReview);

export default router;
