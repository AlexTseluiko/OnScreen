import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';

export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Заголовок карточки
   */
  title?: string;

  /**
   * Дочерние элементы
   */
  children: React.ReactNode;

  /**
   * Стили контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Стили для заголовка
   */
  titleStyle?: ViewStyle;

  /**
   * Флаг: показывать ли тень
   */
  elevated?: boolean;

  /**
   * Флаг: делать ли карточку нажимаемой
   */
  onPress?: () => void;

  /**
   * Стили для самой карточки
   */
  style?: ViewStyle;
}

/**
 * Атомарный компонент Card
 *
 * Предоставляет базовый контейнер для отображения информации в виде карточки.
 * Поддерживает заголовок, тени и возможность нажатия.
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  containerStyle,
  titleStyle,
  elevated = true,
  style,
  onPress,
  ...rest
}) => {
  const { theme, isDark } = useTheme();

  // Определение стилей для карточки в зависимости от темы
  const cardBaseStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.border,
    borderWidth: isDark ? 1 : 0,
    ...getShadowStyle(elevated, isDark),
  };

  // Определение стилей для тени в зависимости от темы
  function getShadowStyle(showShadow: boolean, isDarkMode: boolean): ViewStyle {
    if (!showShadow) return {};

    return isDarkMode
      ? {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 3.84,
          elevation: 5,
        }
      : {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        };
  }

  // Базовый контент карточки с заголовком (если есть) и содержимым
  const cardContent = (
    <>
      {title && (
        <Text variant="subtitle" style={[styles.title, titleStyle]}>
          {title}
        </Text>
      )}
      <View style={styles.content}>{children}</View>
    </>
  );

  // Если карточка нажимаемая - рендерим TouchableOpacity, иначе - View
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, cardBaseStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
        {...rest}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, cardBaseStyle, style]}>{cardContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
});
