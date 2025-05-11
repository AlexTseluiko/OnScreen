import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

/**
 * Свойства компонента ListItem
 * @property {string} title - Основной текст элемента списка
 * @property {string} subtitle - Дополнительный текст элемента списка
 * @property {ReactNode} leftContent - Содержимое слева (иконка, аватар и т.д.)
 * @property {ReactNode} rightContent - Содержимое справа (иконка, чекбокс и т.д.)
 * @property {() => void} onPress - Обработчик нажатия
 * @property {() => void} onLongPress - Обработчик долгого нажатия
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ViewStyle} contentStyle - Стили для содержимого
 * @property {boolean} showDivider - Показывать разделитель снизу
 * @property {boolean} chevron - Показывать стрелку вправо
 */
export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  showDivider?: boolean;
  chevron?: boolean;
}

/**
 * Компонент элемента списка
 *
 * Используется для отображения интерактивных элементов в списках
 * Поддерживает различные варианты отображения и обработку нажатий
 * Автоматически подстраивается под выбранную тему
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  onPress,
  onLongPress,
  containerStyle,
  contentStyle,
  showDivider = false,
  chevron = false,
}) => {
  const { theme } = useTheme();

  // Создаем общее содержимое для контейнера
  const content = (
    <>
      {leftContent && <View style={styles.leftContent}>{leftContent}</View>}

      <View style={[styles.content, contentStyle]}>
        <Text variant="body">{title}</Text>
        {subtitle && (
          <Text variant="caption" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {(rightContent || chevron) && (
        <View style={styles.rightContent}>
          {rightContent}
          {chevron && <Icon name="chevron-right" size={20} color={theme.colors.text.secondary} />}
        </View>
      )}
    </>
  );

  // Общие стили для контейнера
  const containerStyles = [
    styles.container,
    {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: showDivider ? 1 : 0,
    },
    containerStyle,
  ];

  // Если есть обработчики нажатия, используем TouchableOpacity, иначе View
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  // Если нет обработчиков, используем простой View
  return <View style={containerStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  leftContent: {
    marginRight: 16,
  },
  rightContent: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 16,
  },
  subtitle: {
    marginTop: 4,
  },
});
