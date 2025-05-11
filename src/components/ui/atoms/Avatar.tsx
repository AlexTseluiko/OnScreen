import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
  Text,
  ImageStyle,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export type AvatarSize = 'small' | 'medium' | 'large' | number;

/**
 * Свойства компонента Avatar
 * @property {ImageSourcePropType} source - Источник изображения
 * @property {AvatarSize} size - Размер аватара
 * @property {string} name - Имя пользователя (для отображения инициалов)
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ImageStyle} imageStyle - Стили для изображения
 * @property {string} backgroundColor - Фоновый цвет при отображении инициалов
 */
export interface AvatarProps {
  source?: ImageSourcePropType;
  size?: AvatarSize;
  name?: string;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  backgroundColor?: string;
}

/**
 * Компонент для отображения аватара пользователя
 *
 * Если изображение не указано, отображает инициалы пользователя
 * Поддерживает разные размеры и автоматически подстраивается под тему
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'medium',
  name,
  containerStyle,
  imageStyle,
  backgroundColor,
}) => {
  const { theme } = useTheme();

  // Определение размера в пикселях
  const getSize = (): number => {
    if (typeof size === 'number') return size;

    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 96;
      case 'medium':
      default:
        return 48;
    }
  };

  // Получение инициалов из имени
  const getInitials = (): string => {
    if (!name) return '';

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Определение фонового цвета
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;

    // Если нет изображения и имени, используем цвет из темы
    if (!source && !name) return theme.colors.surface;

    // Если нет изображения, но есть имя, используем цветную заглушку
    if (!source && name) {
      // Простая хеш-функция для имени, чтобы получить всегда один и тот же цвет для одного имени
      const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      // Получаем цвет из хеша
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 70%, 60%)`;
    }

    return 'transparent';
  };

  const pixelSize = getSize();
  const fontSize = pixelSize / 2.5;

  return (
    <View
      style={[
        styles.container,
        {
          width: pixelSize,
          height: pixelSize,
          borderRadius: pixelSize / 2,
          backgroundColor: getBackgroundColor(),
        },
        containerStyle,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: pixelSize,
              height: pixelSize,
              borderRadius: pixelSize / 2,
            },
            imageStyle,
          ]}
        />
      ) : (
        name && (
          <Text
            style={[
              styles.initialsText,
              {
                fontSize,
                color: theme.colors.text.inverse,
              },
            ]}
          >
            {getInitials()}
          </Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initialsText: {
    fontWeight: 'bold',
  },
});
