import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  /**
   * Текст внутри бейджа
   */
  label?: string;

  /**
   * Числовое значение для бейджа
   */
  count?: number;

  /**
   * Максимальное отображаемое значение
   * (выше этого значения будет показан "+")
   */
  max?: number;

  /**
   * Стиль бейджа
   */
  variant?: BadgeVariant;

  /**
   * Размер бейджа
   */
  size?: BadgeSize;

  /**
   * Показывать бейдж, даже если count равен 0
   */
  showZero?: boolean;

  /**
   * Отображать бейдж как точку (без текста)
   */
  dot?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;
}

/**
 * Атомарный компонент Badge
 *
 * Используется для отображения статусов, счетчиков и индикаторов
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  count,
  max = 99,
  variant = 'primary',
  size = 'medium',
  showZero = false,
  dot = false,
  containerStyle,
}) => {
  const { theme } = useTheme();

  // Создаем display-текст бейджа на основе пропсов
  const getDisplayContent = () => {
    if (dot) return '';
    if (label) return label;
    if (count === undefined) return '';
    if (count === 0 && !showZero) return '';
    if (count > max) return `${max}+`;
    return count.toString();
  };

  const content = getDisplayContent();

  // Если нет контента и не точка - не рендерим ничего
  if (!content && !dot) return null;

  // Получаем цвет бейджа в зависимости от варианта
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.danger;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  // Определяем размеры в зависимости от пропса size
  const getSizeStyles = (): ViewStyle => {
    const baseSize = dot ? 8 : size === 'small' ? 16 : size === 'medium' ? 20 : 24;
    return {
      height: baseSize,
      minWidth: dot ? baseSize : baseSize + 4,
      paddingHorizontal: dot ? 0 : 4,
      borderRadius: baseSize / 2,
    };
  };

  return (
    <View
      style={[
        styles.container,
        getSizeStyles(),
        { backgroundColor: getBackgroundColor() },
        dot && styles.dot,
        containerStyle,
      ]}
    >
      {!dot && (
        <Text
          variant="caption"
          style={[
            styles.text,
            size === 'small' && { fontSize: 10 },
            size === 'large' && { fontSize: 14 },
          ]}
        >
          {content}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 4,
    height: 8,
    minWidth: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
