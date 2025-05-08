import { Router } from 'express';
import {
  createReview,
  getClinicReviews,
  updateReview,
  deleteReview,
  likeReview,
} from '../controllers/reviewController';
import { upload } from '../utils/fileUpload';

const router = Router();

// Получение отзывов клиники
router.get('/clinic/:clinicId', getClinicReviews);

// Создание отзыва
router.post(
  '/',
  upload.array('photos', 5),
  createReview
);

// Обновление отзыва
router.put(
  '/:reviewId',
  upload.array('photos', 5),
  updateReview
);

// Удаление отзыва
router.delete('/:reviewId', deleteReview);

// Лайк отзыва
router.post('/:reviewId/like', likeReview);

export default router; 