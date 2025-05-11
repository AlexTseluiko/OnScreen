import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';

export type SpinnerSize = 'small' | 'medium' | 'large';

/**
 * Свойства компонента Spinner
 * @property {SpinnerSize} size - Размер индикатора загрузки
 * @property {string} color - Цвет индикатора загрузки
 * @property {string} text - Текст, отображаемый под индикатором
 * @property {ViewStyle} containerStyle - Стили для контейнера
 */
export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  text?: string;
  containerStyle?: ViewStyle;
  fullScreen?: boolean;
}

/**
 * Компонент для отображения индикатора загрузки
 *
 * Может отображаться с текстом и настраиваемым размером.
 * Автоматически подстраивается под выбранную тему.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color,
  text,
  containerStyle,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  // Определение размера индикатора
  const getSize = (): 'small' | 'large' => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      case 'medium':
      default:
        return 'small';
    }
  };

  // Определение цвета индикатора
  const getColor = (): string => {
    return color || theme.colors.primary;
  };

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, containerStyle]}>
      <ActivityIndicator size={getSize()} color={getColor()} />
      {text && (
        <Text variant="caption" style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
  },
});
