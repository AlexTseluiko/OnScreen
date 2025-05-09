import express, { Response } from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  likeReview,
} from '../controllers/reviewController';
import { auth, AuthRequest } from '../middleware/auth';
import { FileRequest } from '../types/request';

const router = express.Router();

// Получение всех отзывов
router.get('/', (req: AuthRequest, res: Response) => getReviews(req, res));

// Получение отзыва по ID
router.get('/:id', (req: AuthRequest & { params: { id: string } }, res: Response) =>
  getReviewById(req, res)
);

// Создание нового отзыва
router.post('/', auth, (req: AuthRequest & FileRequest, res: Response) => createReview(req, res));

// Обновление отзыва
router.put(
  '/:reviewId',
  auth,
  (req: AuthRequest & FileRequest & { params: { reviewId: string } }, res: Response) =>
    updateReview(req, res)
);

// Удаление отзыва
router.delete(
  '/:reviewId',
  auth,
  (req: AuthRequest & { params: { reviewId: string } }, res: Response) => deleteReview(req, res)
);

// Лайк отзыва
router.post(
  '/:reviewId/like',
  auth,
  (req: AuthRequest & { params: { reviewId: string } }, res: Response) => likeReview(req, res)
);

export default router;
