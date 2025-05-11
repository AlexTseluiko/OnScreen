import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';
import { Icon } from './Icon';

/**
 * Свойства компонента Checkbox
 * @property {boolean} checked - Состояние чекбокса (выбран/не выбран)
 * @property {() => void} onPress - Обработчик нажатия
 * @property {string} label - Текст метки
 * @property {boolean} disabled - Если true, чекбокс будет отключен
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ViewStyle} checkboxStyle - Стили для самого чекбокса
 */
export interface CheckboxProps {
  checked: boolean;
  onPress: (e: GestureResponderEvent) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  checkboxStyle?: ViewStyle;
  error?: string;
}

/**
 * Компонент чекбокса
 *
 * Поддерживает различные состояния, метку и стилизацию
 * Автоматически подстраивается под выбранную тему
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  containerStyle,
  checkboxStyle,
  error,
}) => {
  const { theme, isDark } = useTheme();

  // Определение цветов в зависимости от состояния
  const getCheckboxBackgroundColor = () => {
    if (disabled) return theme.colors.text.disabled;
    if (checked) return theme.colors.primary;
    return 'transparent';
  };

  const getCheckboxBorderColor = () => {
    if (error) return theme.colors.danger;
    if (disabled) return theme.colors.text.disabled;
    if (checked) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.touchable,
          {
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: getCheckboxBackgroundColor(),
              borderColor: getCheckboxBorderColor(),
            },
            checkboxStyle,
          ]}
        >
          {checked && (
            <Icon name="check" family="material" size={16} color={theme.colors.text.inverse} />
          )}
        </View>
        {label && (
          <Text
            variant="body"
            style={[
              styles.label,
              disabled ? { color: theme.colors.text.disabled } : null,
              error ? { color: theme.colors.danger } : null,
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text variant="caption" style={[styles.errorText, { color: theme.colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 32,
    marginTop: 4,
  },
  label: {
    marginLeft: 8,
  },
  touchable: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
