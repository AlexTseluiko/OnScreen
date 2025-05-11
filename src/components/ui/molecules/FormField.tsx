import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Input, InputProps } from '../atoms/Input';

/**
 * Свойства компонента FormField
 * @property {string} name - Имя поля (используется для связи с формой)
 * @property {string} label - Лейбл для поля
 * @property {string} error - Текст ошибки
 * @property {string} helperText - Вспомогательный текст
 * @property {boolean} required - Если true, поле обязательно для заполнения
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {ViewStyle} inputContainerStyle - Стили для контейнера ввода
 * @property {TextStyle} inputStyle - Стили для поля ввода
 * @property {TextStyle} labelStyle - Стили для лейбла
 * @property {ViewStyle} helperTextStyle - Стили для подсказки
 */
export interface FormFieldProps extends Omit<InputProps, 'style' | 'error'> {
  /**
   * Метка поля
   */
  label: string;

  /**
   * Текст подсказки под полем ввода
   */
  helperText?: string;

  /**
   * Текст ошибки (если есть, перекрывает helperText)
   */
  error?: string;

  /**
   * Обязательное ли поле
   */
  required?: boolean;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Дополнительные стили для метки
   */
  labelStyle?: TextStyle;

  /**
   * Дополнительные стили для подсказки
   */
  helperTextStyle?: TextStyle;
}

/**
 * Молекулярный компонент FormField
 *
 * Объединяет поле ввода с меткой, подсказкой и сообщением об ошибке
 * для создания полноценного поля формы
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  required = false,
  containerStyle,
  labelStyle,
  helperTextStyle,
  ...inputProps
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelContainer}>
        <Text variant="subtitle" style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.colors.danger }}> *</Text>}
        </Text>
      </View>

      <Input {...inputProps} error={Boolean(error)} style={styles.input} />

      {(helperText || error) && (
        <Text
          variant="caption"
          style={[
            styles.helperText,
            error ? { color: theme.colors.danger } : undefined,
            helperTextStyle,
          ]}
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
    marginTop: 6,
  },
  label: {
    marginBottom: 4,
  },
  labelContainer: {
    flexDirection: 'row',
  },
});
