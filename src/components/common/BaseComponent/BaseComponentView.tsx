/**
 * Базовый Presentational компонент
 * Отвечает только за отображение
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BaseComponentProps } from './types';
import { spacing } from '../../../theme/spacing';
import { getShadowStyle } from '../../../theme/shadows';

export const BaseComponentView: React.FC<BaseComponentProps> = ({
  style,
  testID,
  children,
  isDark,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const { colors } = useTheme();
  const theme = isDark ?? false;

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
          padding: spacing.xs,
        };
      case 'large':
        return {
          padding: spacing.md,
        };
      default:
        return {
          padding: spacing.sm,
        };
    }
  };

  const containerStyles = [
    styles.container,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    style,
  ];

  return (
    <View style={containerStyles} testID={testID}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.text.primary} />
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    ...getShadowStyle(false),
  },
  disabled: {
    opacity: 0.5,
  },
});
