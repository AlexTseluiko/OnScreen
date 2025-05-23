import { Router, Request, Response, NextFunction } from 'express';
import { auth, AuthRequest, isAdmin } from '../middleware/auth';
import { Clinic } from '../models/Clinic';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { UserRole } from '../types/user';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';
import * as adminController from '../controllers/adminController';
import { NotificationType } from '../types/notification';

const router = Router();

// Валидатор для проверки ID пользователя
const validateUserId = (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Некорректный ID пользователя' });
  }

  next();
};

// Валидатор для проверки роли
const validateRole = (
  req: Request<{ userId: string }, unknown, { role: UserRole }>,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;

  if (!role || !Object.values(UserRole).includes(role)) {
    return res.status(400).json({ error: 'Некорректная роль пользователя' });
  }

  next();
};

// Получение статистики
router.get('/stats', auth, isAdmin, adminController.getStats);

// Тестовая статистика для дашборда
router.get('/test-stats', auth, isAdmin, adminController.getStats);

// Управление клиниками
router.get('/clinics', auth, isAdmin, adminController.getClinics);

// Получение всех отзывов для админ-панели
router.get('/reviews', auth, isAdmin, adminController.getReviews);

// Маршруты для управления пользователями
router.get('/users', auth, isAdmin, adminController.getUsers);
router.get('/users/:userId', auth, isAdmin, validateUserId, adminController.getUserDetails);
router.put(
  '/users/:userId/role',
  auth,
  isAdmin,
  validateUserId,
  validateRole,
  adminController.updateUserRole
);
router.put(
  '/users/:userId/status',
  auth,
  isAdmin,
  validateUserId,
  adminController.toggleUserStatus
);
router.delete('/users/:userId', auth, isAdmin, validateUserId, adminController.deleteUser);

// Удаление отзыва
router.delete('/reviews/:reviewId', auth, isAdmin, adminController.deleteReview);

// Удаление клиники
router.delete('/clinics/:id', auth, isAdmin, adminController.deleteClinic);

// Получение всех уведомлений для админ-панели
router.get('/notifications', auth, isAdmin, adminController.getNotifications);

// Отправка массовых уведомлений
router.post('/notifications/broadcast', auth, isAdmin, adminController.sendBroadcastNotification);

// Пометка уведомления как прочитанного
router.patch(
  '/notifications/:notificationId/read',
  auth,
  isAdmin,
  adminController.markNotificationAsRead
);

// Получение запросов на роль врача
router.get('/doctor-requests', auth, isAdmin, adminController.getDoctorRequests);

export default router;
