import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';
import { Icon } from './Icon';

export type ChipVariant = 'default' | 'primary' | 'secondary' | 'outline';

export interface ChipProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Текст, отображаемый внутри чипа
   */
  label: string;

  /**
   * Обработчик нажатия на чип
   */
  onPress?: () => void;

  /**
   * Иконка слева от текста
   */
  leftIcon?: string;

  /**
   * Семейство иконок слева
   */
  leftIconFamily?: 'ionicons' | 'material';

  /**
   * Иконка справа от текста
   */
  rightIcon?: string;

  /**
   * Семейство иконок справа
   */
  rightIconFamily?: 'ionicons' | 'material';

  /**
   * Обработчик нажатия на иконку справа (закрытие)
   */
  onClose?: () => void;

  /**
   * Вариант отображения чипа
   */
  variant?: ChipVariant;

  /**
   * Состояние выбора чипа
   */
  selected?: boolean;

  /**
   * Состояние недоступности чипа
   */
  disabled?: boolean;

  /**
   * Дополнительные стили контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили текста
   */
  labelStyle?: TextStyle;
}

/**
 * Атомарный компонент Chip
 *
 * Используется для отображения тегов, фильтров и выбираемых опций.
 * Поддерживает различные варианты отображения и состояние выбора.
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  leftIcon,
  leftIconFamily = 'ionicons',
  rightIcon,
  rightIconFamily = 'ionicons',
  onClose,
  variant = 'default',
  selected = false,
  disabled = false,
  containerStyle,
  labelStyle,
}) => {
  const { theme, isDark } = useTheme();

  // Определение стилей в зависимости от варианта и темы
  const getVariantStyles = (): ViewStyle => {
    // Стили для выбранного состояния
    if (selected) {
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      };
    }

    // Стили для различных вариантов
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary + '20', // 20 = 12% opacity
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary + '20',
          borderColor: theme.colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: isDark ? theme.colors.border : theme.colors.text.secondary,
        };
      default:
        return {
          backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
          borderColor: theme.colors.border,
        };
    }
  };

  // Определение цвета текста в зависимости от варианта и состояния
  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    if (selected) return theme.colors.text.inverse;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      default:
        return theme.colors.text.primary;
    }
  };

  // Определение цвета иконок
  const getIconColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    if (selected) return theme.colors.text.inverse;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Создаем обработчик для кнопки закрытия
  const handleClosePress = () => {
    if (!disabled && onClose) {
      onClose();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getVariantStyles(), disabled && styles.disabled, containerStyle]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {leftIcon && (
        <Icon
          name={leftIcon}
          family={leftIconFamily}
          size={16}
          color={getIconColor()}
          style={styles.leftIcon}
        />
      )}

      <Text variant="caption" style={[styles.label, { color: getTextColor() }, labelStyle]}>
        {label}
      </Text>

      {rightIcon && (
        <TouchableOpacity onPress={handleClosePress} disabled={disabled}>
          <Icon
            name={rightIcon}
            family={rightIconFamily}
            size={16}
            color={getIconColor()}
            style={styles.rightIcon}
          />
        </TouchableOpacity>
      )}

      {!rightIcon && onClose && (
        <TouchableOpacity onPress={handleClosePress} disabled={disabled}>
          <Icon
            name="close-circle"
            family="ionicons"
            size={16}
            color={getIconColor()}
            style={styles.rightIcon}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    height: 32,
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
});
