import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '../utils/notificationUtils';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Индексы для поиска
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });

// Создаем и экспортируем модель с обоими вариантами (именованный и по умолчанию) для совместимости
const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

// Именованный экспорт для использования с import { Notification } from ...
export const Notification = NotificationModel;

// Экспорт по умолчанию для использования с import Notification from ...
export default NotificationModel; 