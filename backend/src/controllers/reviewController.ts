import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Clinic } from '../models/Clinic';
import { createNotification, NotificationType } from '../utils/notificationUtils';
import { deleteFile } from '../utils/fileUpload';

// Создание отзыва
export const createReview = async (req: Request, res: Response) => {
  try {
    const { clinicId, rating, text } = req.body;
    const userId = req.user._id;
    const photos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];

    const review = new Review({
      user: userId,
      clinic: clinicId,
      rating,
      text,
      photos
    });

    await review.save();

    // Получаем информацию о клинике
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Клиника не найдена' });
    }

    // Отправляем уведомление владельцу клиники
    await createNotification(
      clinic.owner.toString(),
      NotificationType.REVIEW_ADDED,
      'Новый отзыв',
      `Пользователь оставил новый отзыв с оценкой ${rating} звезд`,
      { reviewId: review._id, clinicId }
    );

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Ошибка при создании отзыва' });
  }
};

// Получение отзывов клиники
export const getClinicReviews = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user._id;
    const newPhotos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    // Удаление старых фотографий
    if (newPhotos.length > 0) {
      review.photos.forEach((photo: string) => deleteFile(photo));
    }

    // Обновление отзыва
    review.rating = rating;
    review.text = text;
    if (newPhotos.length > 0) {
      review.photos = newPhotos;
    }
    await review.save();

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении отзыва' });
  }
};

// Удаление отзыва
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Ошибка при удалении отзыва' });
  }
};

// Лайк отзыва
export const likeReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    // Проверяем, не лайкал ли пользователь этот отзыв ранее
    if (review.likes.includes(userId)) {
      return res.status(400).json({ error: 'Вы уже лайкнули этот отзыв' });
    }

    review.likes.push(userId);
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