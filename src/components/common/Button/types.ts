/**
 * Типы для компонента Button
 */

import { TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Текст кнопки
   */
  title: string;

  /**
   * Вариант кнопки
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Размер кнопки
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Состояние загрузки
   * @default false
   */
  loading?: boolean;

  /**
   * Состояние отключения
   * @default false
   */
  disabled?: boolean;

  /**
   * Иконка слева от текста
   */
  leftIcon?: React.ReactNode;

  /**
   * Иконка справа от текста
   */
  rightIcon?: React.ReactNode;

  /**
   * Обработчик нажатия
   */
  onPress?: () => void;
}
