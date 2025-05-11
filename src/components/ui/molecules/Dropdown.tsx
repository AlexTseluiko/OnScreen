import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

export interface DropdownOption {
  /**
   * Уникальный идентификатор опции
   */
  value: string | number;

  /**
   * Отображаемое название опции
   */
  label: string;

  /**
   * Опционально - иконка для отображения рядом с опцией
   */
  icon?: string;

  /**
   * Семейство иконки
   */
  iconFamily?: 'ionicons' | 'material';

  /**
   * Дополнительные данные, связанные с опцией
   */
  data?: any;
}

export interface DropdownProps {
  /**
   * Список опций для выбора
   */
  options: DropdownOption[];

  /**
   * Текущее выбранное значение
   */
  value?: string | number;

  /**
   * Обработчик выбора опции
   */
  onSelect: (option: DropdownOption) => void;

  /**
   * Текст-заполнитель, отображаемый, когда ничего не выбрано
   */
  placeholder?: string;

  /**
   * Текст метки над полем выбора
   */
  label?: string;

  /**
   * Показывать ли сообщение об ошибке
   */
  error?: string;

  /**
   * Вспомогательный текст под полем
   */
  helperText?: string;

  /**
   * Флаг, указывающий, что поле обязательно для заполнения
   */
  required?: boolean;

  /**
   * Флаг, указывающий, что поле отключено
   */
  disabled?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили для выбранной опции
   */
  selectedItemStyle?: ViewStyle;

  /**
   * Дополнительные стили для списка опций
   */
  optionsListStyle?: ViewStyle;

  /**
   * Дополнительные стили для элемента в списке опций
   */
  optionItemStyle?: ViewStyle;

  /**
   * Дополнительные стили для текста метки
   */
  labelStyle?: TextStyle;

  /**
   * Дополнительные стили для текста заполнителя/выбранной опции
   */
  textStyle?: TextStyle;

  /**
   * Максимальная высота списка опций
   */
  maxHeight?: number;

  /**
   * Размер иконки
   */
  iconSize?: number;
}

/**
 * Молекулярный компонент Dropdown
 *
 * Выпадающий список для выбора одного значения из нескольких вариантов
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Выберите...',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  containerStyle,
  selectedItemStyle,
  optionsListStyle,
  optionItemStyle,
  labelStyle,
  textStyle,
  maxHeight = 300,
  iconSize = 20,
}) => {
  const { theme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Найти текущую выбранную опцию
  const selectedOption = options.find(option => option.value === value);

  // Управление анимацией стрелки
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="label"
          style={[
            styles.label,
            { color: error ? theme.colors.danger : theme.colors.text.secondary },
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={{ color: theme.colors.danger }}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectedItem,
          {
            borderColor: error
              ? theme.colors.danger
              : isOpen
                ? theme.colors.primary
                : theme.colors.border,
            backgroundColor: disabled
              ? isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)'
              : theme.colors.surface,
          },
          selectedItemStyle,
        ]}
        onPress={toggleDropdown}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        {selectedOption ? (
          <View style={styles.selectedContent}>
            {selectedOption.icon && (
              <Icon
                name={selectedOption.icon}
                family={selectedOption.iconFamily || 'ionicons'}
                size={iconSize}
                color={theme.colors.text.primary}
                style={styles.optionIcon}
              />
            )}
            <Text
              variant="body"
              style={[
                { color: theme.colors.text.primary },
                disabled && { color: theme.colors.text.disabled },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {selectedOption.label}
            </Text>
          </View>
        ) : (
          <Text
            variant="body"
            style={[
              { color: theme.colors.text.secondary },
              disabled && { color: theme.colors.text.disabled },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {placeholder}
          </Text>
        )}

        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon
            name="chevron-down"
            family="ionicons"
            size={24}
            color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {(error || helperText) && (
        <Text
          variant="caption"
          style={[
            styles.helperText,
            { color: error ? theme.colors.danger : theme.colors.text.secondary },
          ]}
        >
          {error || helperText}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.optionsList,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                maxHeight,
              },
              optionsListStyle,
            ]}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {options.map(option => (
                <TouchableOpacity
                  key={option.value.toString()}
                  style={[
                    styles.optionItem,
                    option.value === value && {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    optionItemStyle,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  {option.icon && (
                    <Icon
                      name={option.icon}
                      family={option.iconFamily || 'ionicons'}
                      size={iconSize}
                      color={
                        option.value === value ? theme.colors.primary : theme.colors.text.primary
                      }
                      style={styles.optionIcon}
                    />
                  )}
                  <Text
                    variant="body"
                    style={{
                      color:
                        option.value === value ? theme.colors.primary : theme.colors.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  helperText: {
    marginTop: 4,
  },
  label: {
    marginBottom: 8,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionsList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: width - 40,
  },
  selectedContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  selectedItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
