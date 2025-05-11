export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  CLINIC_ADMIN: 'clinic_admin',
  GUEST: 'guest',
} as const;

export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  MESSAGE: 'message',
  REMINDER: 'reminder',
  SYSTEM: 'system',
  ALERT: 'alert',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  EMERGENCY: 'emergency',
} as const;
