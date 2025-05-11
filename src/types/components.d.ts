/**
 * Типы для UI компонентов
 */

// Информируем TypeScript об атомарных компонентах
declare module '../components/ui/atoms/Text' {
  import { TextProps as RNTextProps } from 'react-native';

  export interface CustomTextProps extends RNTextProps {
    variant?:
      | 'body'
      | 'bodySmall'
      | 'title'
      | 'subtitle'
      | 'caption'
      | 'label'
      | 'heading'
      | 'subheading';
    inverse?: boolean;
    color?: string;
  }

  export const Text: React.FC<CustomTextProps>;
}

declare module '../components/ui/atoms/Input' {
  import { TextInputProps, ViewStyle, TextStyle } from 'react-native';

  export interface InputProps extends TextInputProps {
    label?: string;
    error?: boolean;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputContainerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    disabled?: boolean;
  }

  export const Input: React.FC<InputProps>;
}

declare module '../components/ui/atoms/Badge' {
  import { ViewStyle } from 'react-native';

  export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  export type BadgeSize = 'small' | 'medium' | 'large';

  export interface BadgeProps {
    label?: string;
    count?: number;
    max?: number;
    variant?: BadgeVariant;
    size?: BadgeSize;
    showZero?: boolean;
    dot?: boolean;
    containerStyle?: ViewStyle;
  }

  export const Badge: React.FC<BadgeProps>;
}
