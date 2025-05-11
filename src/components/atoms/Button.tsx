/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      ...(size === 'large' && {
        paddingHorizontal: 24,
        paddingVertical: 16,
      }),
      ...(size === 'medium' && {
        paddingHorizontal: 16,
        paddingVertical: 12,
      }),
      ...(size === 'small' && {
        paddingHorizontal: 12,
        paddingVertical: 8,
      }),
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.text.disabled,
        borderColor: theme.colors.text.disabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...styles.text,
      ...(size === 'large' && {
        fontSize: 18,
      }),
      ...(size === 'medium' && {
        fontSize: 16,
      }),
      ...(size === 'small' && {
        fontSize: 14,
      }),
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: theme.colors.text.disabled,
      };
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyle,
          color: theme.colors.text.inverse,
        };
      case 'outline':
      case 'text':
        return {
          ...baseStyle,
          color: theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'text'
              ? theme.colors.primary
              : theme.colors.text.inverse
          }
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
