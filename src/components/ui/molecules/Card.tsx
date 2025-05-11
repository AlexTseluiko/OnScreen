import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { TouchableCard } from '../atoms/TouchableCard';
import { shadowStyleLight, shadowStyleDark } from '../../../constants/styles';

/**
 * Свойства компонента Card
 * @property {ReactNode} children - Содержимое карточки
 * @property {string} title - Заголовок карточки
 * @property {string} subtitle - Подзаголовок карточки
 * @property {ReactNode} headerRight - Контент для правого угла заголовка
 * @property {ReactNode} footer - Содержимое нижней части карточки
 * @property {boolean} elevated - Если true, карточка будет иметь тень
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ViewStyle} contentStyle - Стили для основного контента
 * @property {boolean} onPress - Обработчик нажатия (если указан, карточка будет нажимаемой)
 */
export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  elevated?: boolean;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  footerStyle?: ViewStyle;
  onPress?: () => void;
}

/**
 * Компонент информационной карточки
 *
 * Поддерживает отображение заголовка, основного контента и нижней части
 * Может быть интерактивной при указании обработчика нажатия
 * Автоматически подстраивается под выбранную тему
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerRight,
  footer,
  elevated = true,
  containerStyle,
  contentStyle,
  headerStyle,
  footerStyle,
  onPress,
}) => {
  const { theme, isDark } = useTheme();
  const shadowStyle = isDark ? shadowStyleDark : shadowStyleLight;

  // Если карточка не кликабельна, отображаем обычную View
  if (!onPress) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          elevated && shadowStyle,
          containerStyle,
        ]}
      >
        {renderCardContent()}
      </View>
    );
  }

  // Для кликабельной карточки используем TouchableCard
  return (
    <TouchableCard
      onPress={onPress}
      elevated={elevated}
      containerStyle={containerStyle}
      cardStyle={{
        padding: 0, // Убираем дефолтные отступы, чтобы управлять ими внутри
      }}
    >
      {renderCardContent()}
    </TouchableCard>
  );

  // Общая функция для отображения контента карточки
  function renderCardContent() {
    return (
      <>
        {(title || subtitle || headerRight) && (
          <View style={[styles.header, headerStyle]}>
            <View style={styles.headerTitleContainer}>
              {title && (
                <Text variant="subtitle" style={styles.title}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text variant="caption" style={styles.subtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
            {headerRight && <View>{headerRight}</View>}
          </View>
        )}

        <View style={[styles.content, contentStyle]}>{children}</View>

        {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  footer: {
    borderTopWidth: 1,
    padding: 12,
  },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  title: {
    marginBottom: 2,
  },
});
