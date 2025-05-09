/* eslint-disable react-native/sort-styles */
import React from 'react';
import {
  Text as RNText,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CustomTextProps extends TextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

export const Text: React.FC<CustomTextProps> = ({ style, variant = 'body', ...props }) => {
  const { theme } = useTheme();

  const variantStyles = {
    body: {
      fontSize: 16,
      color: theme.colors.text,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500' as const,
      color: theme.colors.text,
    },
    caption: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  };

  return <RNText style={[variantStyles[variant], style]} {...props} />;
};

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  backgroundColor,
  textColor,
  style,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: backgroundColor || theme.colors.primary },
        disabled && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          { color: textColor || theme.colors.buttonText },
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    opacity: 0.8,
  },
});
