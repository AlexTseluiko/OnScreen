/**
 * Константы отступов для всего приложения
 * Используются для поддержания консистентности в дизайне
 */

export interface SpacingTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export const spacing: SpacingTheme = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Утилиты для создания отступов
export const createSpacing = (multiplier: number = 1) => spacing.md * multiplier;
