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

router.get('/', authenticate, getUserNotifications);
router.patch('/:notificationId/read', authenticate, markNotificationAsReadController);
router.patch('/read-all', authenticate, markAllNotificationsAsReadController);
router.delete('/:notificationId', authenticate, deleteNotification);
router.delete('/', authenticate, deleteAllNotifications);

export default router; 