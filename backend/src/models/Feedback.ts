import mongoose, { Document, Schema } from 'mongoose';

// Типы обратной связи
export type FeedbackType = 'suggestion' | 'bug' | 'other';

// Интерфейс для документа обратной связи
export interface IFeedback extends Document {
  feedbackText: string;
  feedbackType: FeedbackType;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  date: Date;
  isRead: boolean;
  readAt?: Date;
  adminNotes?: string;
}

// Схема для обратной связи
const FeedbackSchema: Schema = new Schema({
  feedbackText: {
    type: String,
    required: [true, 'Текст обратной связи обязателен'],
    trim: true,
  },
  feedbackType: {
    type: String,
    enum: ['suggestion', 'bug', 'other'],
    default: 'other',
  },
  email: {
    type: String,
    required: false,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Пожалуйста, укажите корректный email адрес',
    ],
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    required: false,
  },
  adminNotes: {
    type: String,
    required: false,
  },
}, { timestamps: true });

// Создаем и экспортируем модель
export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema); 