import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { shadowStyleLight, shadowStyleDark } from '../../../constants/styles';

/**
 * Свойства компонента TouchableCard
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ViewStyle} cardStyle - Стили для карточки
 * @property {boolean} elevated - Если true, карточка будет иметь тень
 * @property {number} borderRadius - Радиус скругления углов
 */
export interface TouchableCardProps extends TouchableOpacityProps {
  containerStyle?: ViewStyle;
  cardStyle?: ViewStyle;
  elevated?: boolean;
  borderRadius?: number;
}

/**
 * Компонент нажимаемой карточки
 *
 * Используется для создания интерактивных карточек с тенью или без
 * Автоматически подстраивается под выбранную тему
 */
export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  style,
  containerStyle,
  cardStyle,
  elevated = true,
  borderRadius = 8,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  // Определение стилей тени в зависимости от темы
  const shadowStyle = isDark ? shadowStyleDark : shadowStyleLight;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius,
            borderColor: theme.colors.border,
          },
          elevated && shadowStyle,
          cardStyle,
          style,
        ]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
  },
  container: {
    marginVertical: 8,
  },
});
