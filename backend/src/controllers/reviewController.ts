import { Response } from 'express';
import { Review } from '../models/Review';
import { createNotification, NotificationType } from '../utils/notifications';
import { AuthRequest } from '../middleware/auth';
import { FileRequest } from '../types/request';
import { Types } from 'mongoose';

// Создание отзыва
export const createReview = async (req: AuthRequest & FileRequest, res: Response) => {
  try {
    const { content, rating } = req.body;
    const photos = Array.isArray(req.files)
      ? req.files.map((file: Express.Multer.File) => file.path)
      : [];

    const review = new Review({
      text: content,
      rating,
      photos,
      user: req.user?.id,
      clinic: req.body.clinicId,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Ошибка при создании отзыва' });
  }
};

// Получение отзывов клиники
export const getClinicReviews = async (
  req: AuthRequest & { query: { page?: string; limit?: string } },
  res: Response
) => {
  try {
    const { clinicId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const reviews = await Review.find({ clinic: clinicId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Review.countDocuments({ clinic: clinicId });

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get clinic reviews error:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
};

// Обновление отзыва
export const updateReview = async (
  req: AuthRequest & FileRequest & { params: { reviewId: string } },
  res: Response
) => {
  try {
    const { content, rating } = req.body;
    const photos = Array.isArray(req.files)
      ? req.files.map((file: Express.Multer.File) => file.path)
      : [];

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    if (review.user.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Нет прав для редактирования этого отзыва' });
    }

    review.text = content || review.text;
    review.rating = rating || review.rating;
    if (photos.length > 0) {
      review.photos = photos;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении отзыва' });
  }
};

// Удаление отзыва
export const deleteReview = async (
  req: AuthRequest & { params: { reviewId: string } },
  res: Response
) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    if (review.user.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого отзыва' });
    }

    await review.deleteOne();
    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Ошибка при удалении отзыва' });
  }
};

// Лайк отзыва
export const likeReview = async (
  req: AuthRequest & { params: { reviewId: string } },
  res: Response
) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    const userIdObjectId = new Types.ObjectId(userId);

    // Проверяем, не лайкал ли пользователь этот отзыв ранее
    if (review.likes.includes(userIdObjectId)) {
      return res.status(400).json({ error: 'Вы уже лайкнули этот отзыв' });
    }

    review.likes.push(userIdObjectId);
    await review.save();

    // Отправляем уведомление автору отзыва
    await createNotification(
      review.user.toString(),
      NotificationType.REVIEW_LIKED,
      'Новый лайк',
      'Кто-то оценил ваш отзыв',
      { reviewId: review._id }
    );

    res.json(review);
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ error: 'Ошибка при лайке отзыва' });
  }
};

// Получение всех отзывов
export const getReviews = async (
  req: AuthRequest & { query: { page?: string; limit?: string } },
  res: Response
) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const reviews = await Review.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Review.countDocuments();

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
};

// Получение отзыва по ID
export const getReviewById = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('clinic', 'name address');

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    res.json(review);
  } catch (error) {
    console.error('Get review by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении отзыва' });
  }
};
