import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

// Включение анимаций для Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface AccordionProps {
  /**
   * Заголовок аккордеона
   */
  title: string;

  /**
   * Содержимое, которое будет показываться при развороте
   */
  children: React.ReactNode;

  /**
   * Иконка для заголовка (опционально)
   */
  icon?: string;

  /**
   * Семейство иконки
   */
  iconFamily?: 'ionicons' | 'material';

  /**
   * Размер иконки
   */
  iconSize?: number;

  /**
   * Развернут ли аккордеон по умолчанию
   */
  defaultExpanded?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили для заголовка
   */
  headerStyle?: ViewStyle;

  /**
   * Дополнительные стили для содержимого
   */
  contentStyle?: ViewStyle;

  /**
   * Дополнительные стили для текста заголовка
   */
  titleStyle?: TextStyle;

  /**
   * Обработчик события разворачивания/сворачивания
   */
  onToggle?: (expanded: boolean) => void;

  /**
   * Флаг, указывающий, отключен ли аккордеон
   */
  disabled?: boolean;
}

/**
 * Молекулярный компонент Accordion
 *
 * Сворачиваемый/разворачиваемый контейнер для контента
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  icon,
  iconFamily = 'ionicons',
  iconSize = 24,
  defaultExpanded = false,
  containerStyle,
  headerStyle,
  contentStyle,
  titleStyle,
  onToggle,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleAccordion = () => {
    if (disabled) return;

    const newExpanded = !expanded;

    // Настройка анимации для плавного изменения высоты
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(newExpanded);

    // Анимация вращения иконки
    Animated.timing(rotateAnim, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  // Расчет поворота иконки
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        style={[
          styles.header,
          {
            backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
            borderColor: theme.colors.border,
          },
          headerStyle,
        ]}
        onPress={toggleAccordion}
        disabled={disabled}
      >
        <View style={styles.titleContainer}>
          {icon && (
            <Icon
              name={icon}
              family={iconFamily}
              size={iconSize}
              color={disabled ? theme.colors.text.disabled : theme.colors.text.primary}
              style={styles.titleIcon}
            />
          )}
          <Text
            variant="subtitle"
            style={[
              { color: disabled ? theme.colors.text.disabled : theme.colors.text.primary },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon
            name="chevron-down"
            family="ionicons"
            size={24}
            color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[
            styles.content,
            {
              backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
              borderColor: theme.colors.border,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 0,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleIcon: {
    marginRight: 8,
  },
});
