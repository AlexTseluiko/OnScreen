import { Notification } from '../models/Notification';
import { Server } from 'socket.io';

export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REVIEW_LIKED = 'REVIEW_LIKED',
}

let io: Server;

export const initializeSocket = (socketIo: Server) => {
  io = socketIo;
};

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    });

    // Отправляем уведомление через WebSocket
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const sendBulkNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId =>
        Notification.create({
          user: userId,
          type,
          title,
          message,
          data,
        })
      )
    );

    // Отправляем уведомления через WebSocket
    if (io) {
      notifications.forEach(notification => {
        io.to(notification.user.toString()).emit('notification', notification);
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new Error('Уведомление не найдено');
    }

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
