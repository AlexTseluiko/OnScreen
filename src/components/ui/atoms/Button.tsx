import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Свойства компонента Button
 * @property {string} title - Текст кнопки
 * @property {ButtonVariant} variant - Вариант отображения кнопки
 * @property {ButtonSize} size - Размер кнопки
 * @property {boolean} loading - Если true, показывает индикатор загрузки вместо текста
 * @property {boolean} fullWidth - Если true, кнопка растягивается на всю ширину родителя
 */
export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Базовый компонент кнопки
 *
 * Поддерживает различные варианты отображения, загрузку и иконки.
 * Автоматически подстраивается под выбранную тему.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
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

  // Получение стилей текста для различных вариантов кнопок
  const getTextColor = () => {
    if (disabled) return isDark ? theme.colors.text.disabled : theme.colors.text.disabled;

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

  // Получение размера кнопки
  const getSizeStyles = () => {
    const borderRadius = theme.borderRadius || { sm: 4, md: 8, lg: 12 };

    const sizeStyles = {
      small: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.sm,
      },
      medium: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: borderRadius.md,
      },
      large: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: borderRadius.lg,
      },
    };

    return sizeStyles[size];
  };

  // Получение размера текста
  const getTextSize = (): 'body' | 'bodySmall' => {
    if (size === 'small') return 'bodySmall';
    return 'body';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            variant={getTextSize()}
            style={[
              styles.buttonText,
              { color: getTextColor() },
              !!leftIcon && styles.textWithLeftIcon,
              !!rightIcon && styles.textWithRightIcon,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  textWithLeftIcon: {
    marginLeft: 8,
  },
  textWithRightIcon: {
    marginRight: 8,
  },
});
