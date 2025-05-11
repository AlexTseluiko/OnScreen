import React from 'react';
import { TextStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeContext';

export type IconFamily = 'material' | 'community' | 'fontawesome' | 'ionicons';

/**
 * Свойства компонента Icon
 *
 * @property {string} name - Название иконки
 * @property {IconFamily} family - Семейство иконок
 * @property {number} size - Размер иконки
 * @property {string} color - Цвет иконки
 * @property {TextStyle} style - Дополнительные стили
 */
export interface IconProps {
  name: string;
  family?: IconFamily;
  size?: number;
  color?: string;
  style?: TextStyle;
  testID?: string;
}

/**
 * Компонент Icon для отображения иконок из различных библиотек
 *
 * Поддерживает Material Icons, Material Community Icons, FontAwesome и Ionicons
 * Автоматически подстраивается под тему
 */
export const Icon: React.FC<IconProps> = ({
  name,
  family = 'material',
  size = 24,
  color,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  // Если цвет не указан, используем цвет текста из темы
  const iconColor = color || theme.colors.text.primary;

  // Выбор компонента иконки в зависимости от семейства
  const renderIcon = () => {
    switch (family) {
      case 'material':
        return (
          <MaterialIcons name={name} size={size} color={iconColor} style={style} testID={testID} />
        );
      case 'community':
        return (
          <MaterialCommunityIcons
            name={name}
            size={size}
            color={iconColor}
            style={style}
            testID={testID}
          />
        );
      case 'fontawesome':
        return (
          <FontAwesome name={name} size={size} color={iconColor} style={style} testID={testID} />
        );
      case 'ionicons':
        return <Ionicons name={name} size={size} color={iconColor} style={style} testID={testID} />;
      default:
        return (
          <MaterialIcons name={name} size={size} color={iconColor} style={style} testID={testID} />
        );
    }
  };

  return renderIcon();
};
