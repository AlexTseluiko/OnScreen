import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export interface TextProps extends RNTextProps {
  variant?:
    | 'body'
    | 'body1'
    | 'body2'
    | 'title'
    | 'subtitle'
    | 'caption'
    | 'error'
    | 'secondary'
    | 'h4'
    | 'h5';
}

export const Text: React.FC<TextProps> = ({ variant = 'body', style, children, ...rest }) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'h4':
        return {
          fontSize: 24,
          fontWeight: '600',
          color: theme.colors.text.primary,
        };
      case 'h5':
        return {
          fontSize: 20,
          fontWeight: '600',
          color: theme.colors.text.primary,
        };
      case 'title':
        return {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text.primary,
        };
      case 'subtitle':
        return {
          fontSize: 16,
          fontWeight: '500',
          color: theme.colors.text.primary,
        };
      case 'caption':
        return {
          fontSize: 12,
          color: theme.colors.text.secondary,
        };
      case 'error':
        return {
          fontSize: 14,
          color: theme.colors.error,
        };
      case 'secondary':
        return {
          fontSize: 14,
          color: theme.colors.text.secondary,
        };
      case 'body1':
        return {
          fontSize: 16,
          color: theme.colors.text.primary,
        };
      case 'body2':
        return {
          fontSize: 14,
          color: theme.colors.text.secondary,
        };
      case 'body':
      default:
        return {
          fontSize: 16,
          color: theme.colors.text.primary,
        };
    }
  };

  return (
    <RNText style={[getTextStyle(), style]} {...rest}>
      {children}
    </RNText>
  );
};
