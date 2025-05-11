export const CONTENT_TYPES = {
  ARTICLE: 'article',
  NEWS: 'news',
  VIDEO: 'video',
  PODCAST: 'podcast',
} as const;

export const MEDICAL_CATEGORIES = {
  GENERAL: 'general',
  CARDIOLOGY: 'cardiology',
  DERMATOLOGY: 'dermatology',
  NEUROLOGY: 'neurology',
  PEDIATRICS: 'pediatrics',
  GYNECOLOGY: 'gynecology',
  OPHTHALMOLOGY: 'ophthalmology',
  ORTHOPEDICS: 'orthopedics',
  DENTISTRY: 'dentistry',
  PSYCHIATRY: 'psychiatry',
  ENDOCRINOLOGY: 'endocrinology',
  UROLOGY: 'urology',
  ONCOLOGY: 'oncology',
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
] as const;
