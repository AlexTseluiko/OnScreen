import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Функция для обработки поискового запроса
   */
  onSearch?: (query: string) => void;

  /**
   * Функция для обработки сброса поиска
   */
  onClear?: () => void;

  /**
   * Функция для обработки нажатия на кнопку фильтра
   */
  onFilter?: () => void;

  /**
   * Значение поискового запроса
   */
  value?: string;

  /**
   * Плейсхолдер поискового поля
   */
  placeholder?: string;

  /**
   * Показывать ли кнопку фильтра
   */
  showFilterButton?: boolean;

  /**
   * Количество активных фильтров (отображается как бейдж на кнопке фильтра)
   */
  activeFiltersCount?: number;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;
}

/**
 * Компонент поисковой строки
 *
 * Включает поле ввода, кнопку очистки и опциональную кнопку фильтра.
 * Автоматически подстраивается под выбранную тему.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  onFilter,
  value = '',
  placeholder = 'Поиск...',
  showFilterButton = false,
  activeFiltersCount = 0,
  containerStyle,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (text: string) => {
    setInputValue(text);
    // Если передан колбэк onSearch, вызываем его при изменении текста
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setInputValue('');
    // Если передан колбэк onClear, вызываем его при очистке
    if (onClear) {
      onClear();
    } else if (onSearch) {
      // Если нет колбэка onClear, но есть onSearch, вызываем его с пустой строкой
      onSearch('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Input
        value={inputValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        leftIcon={
          <Icon name="search" family="ionicons" size={20} color={theme.colors.text.secondary} />
        }
        rightIcon={
          inputValue ? (
            <TouchableOpacity onPress={handleClear}>
              <Icon
                name="close-circle"
                family="ionicons"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          ) : null
        }
        containerStyle={styles.inputContainer}
        {...inputProps}
      />

      {showFilterButton && (
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
          onPress={onFilter}
        >
          <Icon name="options" family="ionicons" size={20} color={theme.colors.text.inverse} />
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Text
                variant="caption"
                style={[styles.badgeText, { color: theme.colors.text.inverse }]}
              >
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    width: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
    width: 48,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
});
