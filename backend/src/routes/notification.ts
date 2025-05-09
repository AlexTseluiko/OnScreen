import { Router, Response } from 'express';
import {
  getUserNotifications,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notificationController';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Получение уведомлений пользователя
router.get('/', auth, (req: AuthRequest, res: Response) => getUserNotifications(req, res));

// Отметка уведомления как прочитанного
router.patch(
  '/:notificationId/read',
  auth,
  (req: AuthRequest & { params: { notificationId: string } }, res: Response) =>
    markNotificationAsReadController(req, res)
);

// Отметка всех уведомлений как прочитанных
router.patch('/read-all', auth, (req: AuthRequest, res: Response) =>
  markAllNotificationsAsReadController(req, res)
);

// Удаление уведомления
router.delete(
  '/:notificationId',
  auth,
  (req: AuthRequest & { params: { notificationId: string } }, res: Response) =>
    deleteNotification(req, res)
);

// Удаление всех уведомлений
router.delete('/', auth, (req: AuthRequest, res: Response) => deleteAllNotifications(req, res));

export default router;
