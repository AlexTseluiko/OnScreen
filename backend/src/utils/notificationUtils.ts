import { Notification } from '../models/Notification';

export enum NotificationType {
  SYSTEM = 'system',
  APPOINTMENT = 'appointment',
  REVIEW = 'review',
  CLINIC = 'clinic',
  DOCTOR = 'doctor',
}

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
) => {
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    data,
    isRead: false,
  });

  await notification.save();
  return notification;
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

export const sendBulkNotifications = async (
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
) => {
  const notifications = userIds.map(userId =>
    createNotification(userId, type, title, message, data)
  );

  return Promise.all(notifications);
};
