import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsReadController, 
  markAllNotificationsAsReadController,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Получение уведомлений пользователя
router.get('/', authenticate, getUserNotifications);

// Отметка уведомления как прочитанного
router.patch('/:notificationId/read', authenticate, markNotificationAsReadController);

// Отметка всех уведомлений как прочитанных
router.patch('/read-all', authenticate, markAllNotificationsAsReadController);

// Удаление уведомления
router.delete('/:notificationId', authenticate, deleteNotification);

// Удаление всех уведомлений
router.delete('/', authenticate, deleteAllNotifications);

export default router;

 