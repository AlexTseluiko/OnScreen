import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { createNotification, NotificationType, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notificationUtils';

interface NotificationRequest {
  title: string;
  message: string;
  type?: NotificationType;
}

interface TargetedNotificationRequest extends NotificationRequest {
  userIds: string[];
}

// Получение уведомлений пользователя
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Notification.countDocuments({ user: userId });

    res.json({
      notifications,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
};

// Отправка уведомления всем пользователям
export const sendBroadcastNotification = async (req: Request<{}, {}, NotificationRequest>, res: Response) => {
  try {
    const { title, message, type = NotificationType.SYSTEM } = req.body;

    // Получаем всех пользователей
    const users = await User.find();
    
    // Отправляем уведомление каждому пользователю
    const notifications = await Promise.all(
      users.map(user => 
        createNotification(user._id.toString(), type, title, message)
      )
    );

    res.json({ 
      message: 'Уведомления успешно отправлены',
      count: notifications.length 
    });
  } catch (error) {
    console.error('Send broadcast notification error:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомлений' });
  }
};

// Отправка уведомления конкретным пользователям
export const sendTargetedNotification = async (req: Request<{}, {}, TargetedNotificationRequest>, res: Response) => {
  try {
    const { userIds, title, message, type = NotificationType.SYSTEM } = req.body;

    // Отправляем уведомление каждому указанному пользователю
    const notifications = await Promise.all(
      userIds.map((userId: string) => 
        createNotification(userId, type, title, message)
      )
    );

    res.json({ 
      message: 'Уведомления успешно отправлены',
      count: notifications.length 
    });
  } catch (error) {
    console.error('Send targeted notification error:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомлений' });
  }
};

// Отметка уведомления как прочитанного
export const markNotificationAsReadController = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await markNotificationAsRead(notificationId, userId.toString());
    res.json({ message: 'Уведомление отмечено как прочитанное', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомления' });
  }
};

// Отметка всех уведомлений как прочитанных
export const markAllNotificationsAsReadController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    await markAllNotificationsAsRead(userId.toString());
    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомлений' });
  }
};

// Удаление уведомления
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    res.json({ message: 'Уведомление успешно удалено' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Ошибка при удалении уведомления' });
  }
};

// Удаление всех уведомлений
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ user: userId });

    res.json({ message: 'Все уведомления успешно удалены' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Ошибка при удалении уведомлений' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Ошибка при получении уведомлений' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await markNotificationAsRead(notificationId, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Ошибка при отметке уведомления как прочитанного' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    await markAllNotificationsAsRead(userId);
    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Ошибка при отметке всех уведомлений как прочитанных' });
  }
}; 