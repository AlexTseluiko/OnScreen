import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

/**
 * Свойства компонента Divider
 * @property {ViewStyle} style - Дополнительные стили
 * @property {number} thickness - Толщина разделителя
 * @property {number} spacing - Отступы снизу и сверху
 * @property {string} color - Цвет разделителя
 * @property {'horizontal' | 'vertical'} orientation - Ориентация разделителя
 */
export interface DividerProps {
  style?: ViewStyle;
  thickness?: number;
  spacing?: number;
  color?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Компонент разделительной линии
 *
 * Используется для разделения контента на логические секции
 * Поддерживает горизонтальную и вертикальную ориентацию
 */
export const Divider: React.FC<DividerProps> = ({
  style,
  thickness = 1,
  spacing = 8,
  color,
  orientation = 'horizontal',
}) => {
  const { theme, isDark } = useTheme();

  // Определение цвета разделителя
  const dividerColor = color || theme.colors.divider;

  // Определение стилей в зависимости от ориентации
  const dividerStyle = {
    backgroundColor: dividerColor,
    ...(orientation === 'horizontal'
      ? {
          height: thickness as DimensionValue,
          marginVertical: spacing,
          width: '100%' as DimensionValue,
        }
      : {
          height: '100%' as DimensionValue,
          marginHorizontal: spacing,
          width: thickness as DimensionValue,
        }),
  };

  return <View style={[dividerStyle, style]} />;
};

const styles = StyleSheet.create({});
