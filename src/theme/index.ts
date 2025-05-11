/**
 * Основной файл экспорта темы
 * Содержит все необходимые константы и типы для работы с темой приложения
 */

// Экспорт цветов
export * from './colors';

// Экспорт темы
export * from './theme';

// Экспорт контекста темы и хуков
export * from './ThemeContext';

// Экспорт типографики
export * from './typography';

// Явный реэкспорт для избежания конфликтов
export { spacing } from './spacing';
export { shadows } from './shadows';
export * from './animations';

// Реэкспорт типов
export type { ColorTheme, Colors } from './colors';
export type { TYPOGRAPHY as TypographyTheme } from './typography';
export type { SpacingTheme } from './spacing';
export type { ShadowTheme } from './shadows';
export type { AnimationTheme } from './animations';

// Новые стили
export * from './styles';
