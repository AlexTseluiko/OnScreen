export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REVIEW_LIKED = 'REVIEW_LIKED'
}

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
} 