import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';

/**
 * Свойства компонента Input
 * @property {string} label - Лейбл для поля ввода
 * @property {boolean} error - Флаг ошибки
 * @property {string} helperText - Вспомогательный текст
 * @property {React.ReactNode} leftIcon - Иконка слева от поля ввода
 * @property {React.ReactNode} rightIcon - Иконка справа от поля ввода
 * @property {() => void} onRightIconPress - Обработчик нажатия на правую иконку
 * @property {string} containerStyle - Стили для контейнера
 * @property {string} inputContainerStyle - Стили для контейнера инпута
 * @property {boolean} disabled - Если true, поле ввода будет отключено
 */
export interface InputProps extends TextInputProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

/**
 * Базовый компонент для полей ввода
 *
 * Поддерживает лейблы, иконки, сообщения об ошибках и вспомогательный текст.
 * Автоматически подстраивается под выбранную тему.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  disabled = false,
  placeholderTextColor,
  ...rest
}) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    rest.onFocus && rest.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    rest.onBlur && rest.onBlur(e);
  };

  // Определение цветов для различных состояний поля ввода
  const getBorderColor = () => {
    if (error) return theme.colors.danger;
    if (isFocused) return theme.colors.primary;
    return isDark ? theme.colors.border : theme.colors.border;
  };

  // Цвет для placeholder
  const getPlaceholderColor = () => {
    return placeholderTextColor || theme.colors.text.hint;
  };

  // Определение стилей текста
  const getInputTextColor = () => {
    if (disabled) return theme.colors.text.disabled;
    return theme.colors.text.primary;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="label"
          style={[
            styles.label,
            error ? { color: theme.colors.danger } : null,
            disabled ? { color: theme.colors.text.disabled } : null,
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? theme.colors.surface : theme.colors.surface,
            borderColor: getBorderColor(),
          },
          isFocused ? styles.inputContainerFocused : null,
          error ? styles.inputContainerError : null,
          disabled ? styles.inputContainerDisabled : null,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: getInputTextColor() },
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholderTextColor={getPlaceholderColor()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={disabled || !onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <Text
          variant="caption"
          style={[styles.helperText, error ? { color: theme.colors.danger } : null]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  helperText: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  inputContainerDisabled: {
    opacity: 0.7,
  },
  inputContainerError: {
    borderWidth: 1,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  label: {
    marginBottom: 4,
  },
  leftIconContainer: {
    paddingLeft: 12,
  },
  rightIconContainer: {
    paddingRight: 12,
  },
});
