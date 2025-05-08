export enum NotificationType {
  SYSTEM = 'SYSTEM',
  MESSAGE = 'MESSAGE',
  REVIEW = 'REVIEW',
  APPOINTMENT = 'APPOINTMENT'
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