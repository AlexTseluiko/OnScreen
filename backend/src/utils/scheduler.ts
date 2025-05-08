import { createNotification, NotificationType } from './notifications';
import { ScheduledNotification } from '../models/ScheduledNotification';

// Планирование уведомления
export const scheduleNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  scheduledTime: Date
) => {
  try {
    // Создаем запись о запланированном уведомлении
    const scheduledNotification = await ScheduledNotification.create({
      user: userId,
      type,
      title,
      message,
      scheduledTime,
      status: 'PENDING'
    });

    // Планируем отправку уведомления
    setTimeout(async () => {
      try {
        // Отправляем уведомление
        await createNotification(userId, type, title, message);
        
        // Обновляем статус запланированного уведомления
        scheduledNotification.status = 'SENT';
        await scheduledNotification.save();
      } catch (error: any) {
        console.error('Error sending scheduled notification:', error);
        scheduledNotification.status = 'FAILED';
        scheduledNotification.error = error?.message || 'Unknown error';
        await scheduledNotification.save();
      }
    }, scheduledTime.getTime() - Date.now());

    return scheduledNotification;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

// Получение запланированных уведомлений
export const getScheduledNotifications = async (userId: string) => {
  try {
    return await ScheduledNotification.find({
      user: userId,
      status: 'PENDING'
    }).sort({ scheduledTime: 1 });
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    throw error;
  }
};

// Отмена запланированного уведомления
export const cancelScheduledNotification = async (notificationId: string) => {
  try {
    const notification = await ScheduledNotification.findById(notificationId);
    if (!notification) {
      throw new Error('Запланированное уведомление не найдено');
    }

    notification.status = 'CANCELLED';
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    throw error;
  }
}; 