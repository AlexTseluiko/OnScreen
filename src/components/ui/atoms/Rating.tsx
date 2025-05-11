import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Icon } from './Icon';

export interface RatingProps {
  /**
   * Текущее значение рейтинга
   */
  value: number;

  /**
   * Максимальное количество звезд
   */
  maxStars?: number;

  /**
   * Размер звезд
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Обработчик изменения рейтинга
   */
  onValueChange?: (value: number) => void;

  /**
   * Режим "только для чтения"
   */
  readOnly?: boolean;

  /**
   * Позволяет установить рейтинг в ноль при повторном нажатии на текущее значение
   */
  allowZero?: boolean;

  /**
   * Показывать десятичные значения (половинки звезд)
   */
  showHalfStars?: boolean;

  /**
   * Отображать значение рейтинга рядом со звездами
   */
  showValue?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;
}

/**
 * Атомарный компонент Rating
 *
 * Используется для отображения и выставления рейтинга в виде звезд.
 * Поддерживает режим "только для чтения" и различные размеры.
 */
export const Rating: React.FC<RatingProps> = ({
  value = 0,
  maxStars = 5,
  size = 'medium',
  onValueChange,
  readOnly = false,
  allowZero = false,
  showHalfStars = false,
  showValue = false,
  containerStyle,
}) => {
  const { theme } = useTheme();

  // Определение размера звезд на основе пропса size
  const getStarSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      case 'medium':
      default:
        return 24;
    }
  };

  // Определение цветов для заполненных и пустых звезд
  const filledStarColor = theme.colors.warning;
  const emptyStarColor = theme.colors.text.hint;

  // Обработчик нажатия на звезду
  const handleStarPress = (starIndex: number) => {
    if (readOnly || !onValueChange) return;

    // Если выбрана та же звезда и разрешено обнуление, устанавливаем в 0
    if (value === starIndex + 1 && allowZero) {
      onValueChange(0);
    } else {
      onValueChange(starIndex + 1);
    }
  };

  // Рендер звезд
  const renderStars = () => {
    const stars = [];
    const starSize = getStarSize();

    for (let i = 0; i < maxStars; i++) {
      // Определяем, должна ли звезда быть заполнена, наполовину заполнена или пуста
      let iconName = 'star-outline';
      let starColor = emptyStarColor;

      if (value >= i + 1) {
        iconName = 'star';
        starColor = filledStarColor;
      } else if (showHalfStars && value > i && value < i + 1) {
        iconName = 'star-half';
        starColor = filledStarColor;
      }

      stars.push(
        <TouchableOpacity
          key={`star-${i}`}
          onPress={() => handleStarPress(i)}
          disabled={readOnly}
          style={styles.starButton}
          activeOpacity={readOnly ? 1 : 0.7}
        >
          <Icon name={iconName} family="ionicons" size={starSize} color={starColor} />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderStars()}
      {showValue && (
        <View style={styles.valueContainer}>
          <Icon
            name="star"
            family="ionicons"
            size={getStarSize() * 0.75}
            color={filledStarColor}
            style={styles.valueIcon}
          />
          <Icon
            name={value.toFixed(1).toString()}
            family="material"
            size={getStarSize() * 0.75}
            color={theme.colors.text.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  starButton: {
    marginRight: 2,
    padding: 2,
  },
  valueContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 8,
  },
  valueIcon: {
    marginRight: 2,
  },
});
