export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export const API_KEYS = {
  GOOGLE_MAPS: 'AIzaSyBOy6uPJSI-pFCbjTJUqAUsb2eKJBi_sAw', // Замените на действительный ключ API Google Maps
} as const;

export const APP_CONFIG = {
  MAP_ZOOM_LEVEL: 12,
  REFRESH_INTERVAL: 30000, // 30 секунд
  MAX_REVIEWS_PER_PAGE: 10,
  MAX_FACILITIES_PER_PAGE: 20,
} as const;
