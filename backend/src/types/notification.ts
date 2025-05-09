export enum NotificationType {
  SYSTEM = 'SYSTEM',
  MESSAGE = 'MESSAGE',
  APPOINTMENT = 'APPOINTMENT',
  REMINDER = 'REMINDER',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REVIEW_LIKED = 'REVIEW_LIKED',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
}

export interface INotification {
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
