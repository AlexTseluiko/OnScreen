/**
 * Presentational компонент Button
 * Отвечает только за отображение
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ButtonProps } from './types';
import { spacing } from '../../../theme/spacing';
import { getShadowStyle } from '../../../theme/shadows';

export const ButtonView: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
    }
  };

  const buttonStyles = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'outline' && { color: colors.primary },
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
        ) : (
          <>
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            <Text style={textStyles}>{title}</Text>
            {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    ...getShadowStyle(false),
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.7,
  },
});
