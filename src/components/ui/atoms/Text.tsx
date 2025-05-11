import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export type TextVariant =
  | 'body'
  | 'bodySmall'
  | 'title'
  | 'subtitle'
  | 'caption'
  | 'label'
  | 'heading'
  | 'subheading';

/**
 * Свойства компонента Text
 * @property {TextVariant} variant - Вариант текста, определяющий его стиль
 * @property {boolean} inverse - Если true, текст будет отображаться с инверсным цветом
 * @property {string} color - Цвет текста
 */
export interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  inverse?: boolean;
  color?: string;
}

/**
 * Базовый компонент для отображения текста
 *
 * Поддерживает различные варианты отображения текста, настраиваемые через props.
 * Автоматически подстраивается под выбранную тему.
 */
export const Text: React.FC<CustomTextProps> = ({
  style,
  variant = 'body',
  inverse = false,
  color,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  // Выбор цвета текста в зависимости от темы
  const getTextColor = (defaultColor: string) => {
    if (color) return color;
    if (inverse) return isDark ? theme.colors.text.inverse : theme.colors.text.inverse;
    return defaultColor;
  };

  // Стили для различных вариантов текста
  const getVariantStyles = () => {
    const textStyles = {
      body: {
        fontSize: 16,
        color: getTextColor(theme.colors.text.primary),
      },
      bodySmall: {
        fontSize: 14,
        color: getTextColor(theme.colors.text.primary),
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: getTextColor(theme.colors.text.primary),
      },
      subtitle: {
        fontSize: 18,
        fontWeight: '500' as const,
        color: getTextColor(theme.colors.text.primary),
      },
      caption: {
        fontSize: 14,
        color: getTextColor(theme.colors.text.secondary),
      },
      label: {
        fontSize: 16,
        fontWeight: '500' as const,
        color: getTextColor(theme.colors.text.secondary),
      },
      heading: {
        fontSize: 22,
        fontWeight: 'bold' as const,
        color: getTextColor(theme.colors.text.primary),
      },
      subheading: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: getTextColor(theme.colors.text.primary),
      },
    };

    return textStyles[variant];
  };

  return <RNText style={[getVariantStyles(), style]} {...props} />;
};
