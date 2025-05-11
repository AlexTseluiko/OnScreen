import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon, IconProps } from '../atoms/Icon';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type IconButtonSize = 'small' | 'medium' | 'large';

/**
 * Свойства компонента IconButton
 * @property {string} name - Название иконки
 * @property {IconFamily} family - Семейство иконок
 * @property {IconButtonVariant} variant - Вариант отображения кнопки
 * @property {IconButtonSize} size - Размер кнопки
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {boolean} disabled - Если true, кнопка будет отключена
 * @property {string} color - Цвет иконки
 */
export interface IconButtonProps
  extends Omit<TouchableOpacityProps, 'style'>,
    Omit<IconProps, 'size' | 'color'> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  containerStyle?: ViewStyle;
  color?: string;
}

/**
 * Компонент кнопки с иконкой
 *
 * Поддерживает различные варианты отображения и размеры
 * Автоматически подстраивается под выбранную тему
 */
export const IconButton: React.FC<IconButtonProps> = ({
  name,
  family,
  variant = 'primary',
  size = 'medium',
  containerStyle,
  disabled = false,
  color,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  // Получение стилей для различных вариантов кнопок
  const getVariantStyles = () => {
    const buttonStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      danger: {
        backgroundColor: theme.colors.danger,
        borderWidth: 0,
      },
    };

    return buttonStyles[variant];
  };

  // Получение цвета иконки в зависимости от варианта кнопки
  const getIconColor = (): string => {
    if (color) return color;
    if (disabled) return theme.colors.text.disabled;

    switch (variant) {
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      case 'primary':
      case 'secondary':
      case 'danger':
      default:
        return theme.colors.text.inverse;
    }
  };

  // Получение размеров кнопки и иконки
  const getSizeStyles = () => {
    const borderRadius = theme.borderRadius || { sm: 4, md: 8, lg: 12 };

    const sizeMap = {
      small: {
        container: {
          width: 32,
          height: 32,
          borderRadius: borderRadius.sm,
        },
        icon: 16,
      },
      medium: {
        container: {
          width: 40,
          height: 40,
          borderRadius: borderRadius.md,
        },
        icon: 20,
      },
      large: {
        container: {
          width: 48,
          height: 48,
          borderRadius: borderRadius.lg,
        },
        icon: 24,
      },
    };

    return sizeMap[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getVariantStyles(),
        sizeStyles.container,
        disabled && styles.disabled,
        containerStyle,
      ]}
      disabled={disabled}
      {...props}
    >
      <Icon name={name} family={family} size={sizeStyles.icon} color={getIconColor()} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
