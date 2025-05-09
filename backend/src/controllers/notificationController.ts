import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import {
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendBulkNotifications,
  NotificationType,
} from '../utils/notificationUtils';

interface NotificationRequest {
  title: string;
  message: string;
  type?: NotificationType;
}

interface TargetedNotificationRequest extends NotificationRequest {
  userIds: string[];
}

// Получение уведомлений пользователя
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments({ userId });

    res.json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Error getting notifications' });
  }
};

// Отправка уведомления всем пользователям
export const sendBroadcastNotification = async (
  req: Request<Record<string, never>, unknown, NotificationRequest>,
  res: Response
) => {
  try {
    const { title, message, type = NotificationType.SYSTEM } = req.body;

    // Получаем всех пользователей
    const users = await User.find();
    const userIds = users.map(user => user._id.toString());

    // Отправляем уведомление каждому пользователю
    const notifications = await sendBulkNotifications(userIds, type, title, message);

    res.json({
      message: 'Уведомления успешно отправлены',
      count: notifications.length,
    });
  } catch (error) {
    console.error('Send broadcast notification error:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомлений' });
  }
};

// Отправка уведомления конкретным пользователям
export const sendTargetedNotification = async (
  req: Request<Record<string, never>, unknown, TargetedNotificationRequest>,
  res: Response
) => {
  try {
    const { userIds, title, message, type = NotificationType.SYSTEM } = req.body;

    // Отправляем уведомление каждому указанному пользователю
    const notifications = await sendBulkNotifications(userIds, type, title, message);

    res.json({
      message: 'Уведомления успешно отправлены',
      count: notifications.length,
    });
  } catch (error) {
    console.error('Send targeted notification error:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомлений' });
  }
};

// Отметка уведомления как прочитанного
export const markNotificationAsReadController = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await markNotificationAsRead(notificationId, userId);
    res.json({ message: 'Уведомление отмечено как прочитанное', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомления' });
  }
};

// Отметка всех уведомлений как прочитанных
export const markAllNotificationsAsReadController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await markAllNotificationsAsRead(userId);
    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомлений' });
  }
};

// Удаление уведомления
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Error deleting notification' });
  }
};

// Удаление всех уведомлений
export const deleteAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await Notification.deleteMany({ userId });
    res.json({ message: 'Все уведомления успешно удалены' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Ошибка при удалении уведомлений' });
  }
};

// Создание нового уведомления
export const createNotificationController = async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const notification = await createNotification(userId, type, title, message, data);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Error creating notification' });
  }
};

// Получение всех уведомлений пользователя
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Ошибка при получении уведомлений' });
  }
};
