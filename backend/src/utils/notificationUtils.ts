import { Notification } from '../models/Notification';
import { getSocketService } from './socket';

export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REVIEW_LIKED = 'REVIEW_LIKED',
  MEDICAL_RECORD = 'MEDICAL_RECORD'
}

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notification = new Notification({
    user: userId,
    type,
    title,
    message,
    data
  });
  
  const savedNotification = await notification.save();
  
  // Отправляем уведомление через WebSocket
  try {
    const socketService = getSocketService();
    socketService.sendNotification(userId, savedNotification);
  } catch (error) {
    console.error('Error sending notification via WebSocket:', error);
  }
  
  return savedNotification;
};

export const sendBulkNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notifications = await Promise.all(
    userIds.map(userId => createNotification(userId, type, title, message, data))
  );
  
  return notifications;
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    throw new Error('Уведомление не найдено');
  }

  notification.isRead = true;
  return await notification.save();
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
}; 