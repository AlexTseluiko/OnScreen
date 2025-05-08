import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../types/notification';

export interface IScheduledNotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  scheduledTime: Date;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledNotificationSchema = new Schema<IScheduledNotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для поиска
scheduledNotificationSchema.index({ user: 1, scheduledTime: 1 });
scheduledNotificationSchema.index({ status: 1, scheduledTime: 1 });

export const ScheduledNotification = mongoose.model<IScheduledNotification>(
  'ScheduledNotification',
  scheduledNotificationSchema
); 