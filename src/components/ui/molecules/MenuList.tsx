import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Divider } from '../atoms/Divider';

export interface MenuItem {
  /**
   * Уникальный идентификатор пункта меню
   */
  id: string;

  /**
   * Заголовок пункта меню
   */
  title: string;

  /**
   * Описание или подзаголовок (опционально)
   */
  subtitle?: string;

  /**
   * Имя иконки слева (опционально)
   */
  leftIcon?: string;

  /**
   * Семейство иконки слева
   */
  leftIconFamily?: 'ionicons' | 'material';

  /**
   * Имя иконки справа (по умолчанию - chevron-right)
   */
  rightIcon?: string;

  /**
   * Семейство иконки справа
   */
  rightIconFamily?: 'ionicons' | 'material';

  /**
   * Обработчик нажатия на пункт меню
   */
  onPress?: () => void;

  /**
   * Флаг отключения пункта меню
   */
  disabled?: boolean;

  /**
   * Дополнительные данные, ассоциированные с пунктом меню
   */
  data?: any;
}

export interface MenuListProps {
  /**
   * Массив пунктов меню
   */
  items: MenuItem[];

  /**
   * Показывать разделители между пунктами
   */
  showDividers?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили для пункта меню
   */
  itemStyle?: ViewStyle;
}

/**
 * Молекулярный компонент MenuList
 *
 * Отображает список элементов меню с иконками и возможностью нажатия
 */
export const MenuList: React.FC<MenuListProps> = ({
  items,
  showDividers = true,
  containerStyle,
  itemStyle,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            style={[styles.item, itemStyle, item.disabled && styles.itemDisabled]}
            onPress={item.disabled ? undefined : item.onPress}
            activeOpacity={item.disabled ? 1 : 0.7}
            disabled={item.disabled}
          >
            {item.leftIcon && (
              <Icon
                name={item.leftIcon}
                family={item.leftIconFamily || 'ionicons'}
                size={24}
                color={item.disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
                style={styles.leftIcon}
              />
            )}

            <View style={styles.textContainer}>
              <Text
                variant="body"
                style={{
                  color: item.disabled ? theme.colors.text.disabled : theme.colors.text.primary,
                }}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  variant="caption"
                  style={{
                    color: item.disabled ? theme.colors.text.disabled : theme.colors.text.secondary,
                  }}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>

            <Icon
              name={item.rightIcon || 'chevron-forward'}
              family={item.rightIconFamily || 'ionicons'}
              size={20}
              color={item.disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          </TouchableOpacity>

          {showDividers && index < items.length - 1 && <Divider style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    marginHorizontal: 16,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
});
