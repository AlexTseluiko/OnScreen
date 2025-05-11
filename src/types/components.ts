/**
 * Общие типы для компонентов
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Базовый интерфейс для стилей компонентов
 */
export interface BaseStyles {
  container?: ViewStyle;
  text?: TextStyle;
  image?: ImageStyle;
}

/**
 * Базовый интерфейс для пропсов компонентов
 */
export interface BaseProps {
  /**
   * Дополнительные стили для контейнера
   */
  style?: ViewStyle;

  /**
   * Дополнительные стили для текста
   */
  textStyle?: TextStyle;

  /**
   * Флаг для отключения компонента
   */
  disabled?: boolean;

  /**
   * Флаг для отображения состояния загрузки
   */
  loading?: boolean;

  /**
   * Обработчик нажатия
   */
  onPress?: () => void;
}

/**
 * Интерфейс для компонентов с темами
 */
export interface ThemedProps {
  /**
   * Флаг темной темы
   */
  isDark?: boolean;
}

/**
 * Интерфейс для компонентов с вариациями
 */
export interface VariantProps {
  /**
   * Вариант отображения компонента
   */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Интерфейс для компонентов с размерами
 */
export interface SizeProps {
  /**
   * Размер компонента
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Интерфейс для компонентов с иконками
 */
export interface IconProps {
  /**
   * Иконка слева
   */
  leftIcon?: React.ReactNode;

  /**
   * Иконка справа
   */
  rightIcon?: React.ReactNode;
}
