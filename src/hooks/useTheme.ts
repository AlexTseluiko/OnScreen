/**
 * Хук для работы с темой приложения
 * Предоставляет доступ к текущей теме и цветам
 */

import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';
import { COLORS } from '../theme';

export const useTheme = () => {
  const { isDark } = useContext(ThemeContext);
  const colors = isDark ? COLORS.dark : COLORS.light;

  return {
    isDark,
    colors,
  };
};
