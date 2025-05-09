import { Router, Request, Response } from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { auth, checkRole, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = Router();

// GET /api/articles - получение списка статей
router.get('/', (req: Request, res: Response) => getArticles(req, res));

// GET /api/articles/:id - получение статьи по ID
router.get('/:id', (req: Request<{ id: string }>, res: Response) => getArticleById(req, res));

// POST /api/articles - создание статьи (только для админа/доктора)
router.post(
  '/',
  auth,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  (req: AuthRequest, res: Response) => createArticle(req, res)
);

// PUT /api/articles/:id - обновление статьи
router.put(
  '/:id',
  auth,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  (req: AuthRequest & { params: { id: string } }, res: Response) => updateArticle(req, res)
);

// DELETE /api/articles/:id - удаление статьи
router.delete(
  '/:id',
  auth,
  checkRole([UserRole.ADMIN, UserRole.DOCTOR]),
  (req: AuthRequest & { params: { id: string } }, res: Response) => deleteArticle(req, res)
);

export default router;
