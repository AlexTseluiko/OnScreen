/**
 * Типы для базового компонента
 */

import {
  BaseProps,
  ThemedProps,
  VariantProps,
  SizeProps,
  IconProps,
} from '../../../types/components';

export interface BaseComponentProps
  extends BaseProps,
    ThemedProps,
    VariantProps,
    SizeProps,
    IconProps {
  /**
   * Уникальный идентификатор компонента
   */
  id?: string;

  /**
   * Тестовый идентификатор для тестирования
   */
  testID?: string;

  /**
   * Дополнительные классы для стилизации
   */
  className?: string;

  /**
   * Дочерние элементы компонента
   */
  children?: React.ReactNode;
}
