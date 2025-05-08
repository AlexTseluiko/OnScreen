import express from 'express';
import { 
  getArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../controllers/articleController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types/user';

const router = express.Router();

// GET /api/articles - получение списка статей
router.get('/', getArticles);

// GET /api/articles/:id - получение статьи по ID
router.get('/:id', getArticleById);

// POST /api/articles - создание статьи (только для админа/доктора)
router.post(
  '/',
  authenticate,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  createArticle
);

// PUT /api/articles/:id - обновление статьи
router.put(
  '/:id',
  authenticate,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  updateArticle
);

// DELETE /api/articles/:id - удаление статьи
router.delete(
  '/:id',
  authenticate,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  deleteArticle
);

export default router; 