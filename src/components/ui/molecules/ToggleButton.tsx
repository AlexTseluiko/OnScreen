import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

export interface ToggleButtonProps {
  /**
   * Текст кнопки
   */
  label?: string;

  /**
   * Флаг, указывающий, выбрана ли кнопка
   */
  selected: boolean;

  /**
   * Функция обратного вызова при нажатии на кнопку
   */
  onToggle: () => void;

  /**
   * Имя иконки (опционально)
   */
  icon?: string;

  /**
   * Семейство иконки
   */
  iconFamily?: 'ionicons' | 'material';

  /**
   * Размер иконки
   */
  iconSize?: number;

  /**
   * Флаг, указывающий, отключена ли кнопка
   */
  disabled?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили для текста
   */
  labelStyle?: TextStyle;

  /**
   * Размер кнопки - маленькая, средняя или большая
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Форма кнопки - прямоугольная, округленная или круглая
   */
  shape?: 'square' | 'rounded' | 'circle';
}

/**
 * Молекулярный компонент ToggleButton
 *
 * Кнопка с двумя состояниями (вкл/выкл), которая может содержать иконку и текст
 */
export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  selected,
  onToggle,
  icon,
  iconFamily = 'ionicons',
  iconSize,
  disabled = false,
  containerStyle,
  labelStyle,
  size = 'medium',
  shape = 'rounded',
}) => {
  const { theme, isDark } = useTheme();

  // Определение размера кнопки и иконки в зависимости от пропса size
  const getSizeStyles = (): ViewStyle & { iconSize: number } => {
    switch (size) {
      case 'small':
        return {
          height: 32,
          paddingHorizontal: label ? 12 : 8,
          iconSize: iconSize || 16,
        };
      case 'large':
        return {
          height: 48,
          paddingHorizontal: label ? 20 : 12,
          iconSize: iconSize || 24,
        };
      case 'medium':
      default:
        return {
          height: 40,
          paddingHorizontal: label ? 16 : 10,
          iconSize: iconSize || 20,
        };
    }
  };

  // Определение радиуса скругления в зависимости от пропса shape
  const getBorderRadius = (): number => {
    switch (shape) {
      case 'square':
        return 4;
      case 'circle':
        return 999;
      case 'rounded':
      default:
        return size === 'small' ? 16 : 20;
    }
  };

  const sizeStyles = getSizeStyles();
  const borderRadius = getBorderRadius();

  // Определение цветов в зависимости от состояния кнопки
  const getBackgroundColor = () => {
    if (disabled) {
      return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    }

    if (selected) {
      return theme.colors.primary;
    }

    return isDark ? theme.colors.surface : theme.colors.background;
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.text.disabled;
    }

    if (selected) {
      return theme.colors.text.inverse;
    }

    return theme.colors.text.primary;
  };

  const getBorderColor = () => {
    if (disabled) {
      return 'transparent';
    }

    if (selected) {
      return theme.colors.primary;
    }

    return theme.colors.border;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: 1,
        },
        shape === 'circle' &&
          !label && {
            width: sizeStyles.height,
            paddingHorizontal: 0,
            justifyContent: 'center',
          },
        containerStyle,
      ]}
      onPress={disabled ? undefined : onToggle}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {icon && (
        <Icon
          name={icon}
          family={iconFamily}
          size={sizeStyles.iconSize}
          color={getTextColor()}
          style={label ? styles.iconWithLabel : undefined}
        />
      )}
      {label && (
        <Text
          variant={size === 'small' ? 'caption' : 'body'}
          style={[{ color: getTextColor() }, selected && styles.selectedText, labelStyle]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconWithLabel: {
    marginRight: 8,
  },
  selectedText: {
    fontWeight: '500',
  },
});
