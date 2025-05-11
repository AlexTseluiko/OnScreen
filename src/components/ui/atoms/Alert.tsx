import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from './Text';
import { Icon } from './Icon';

export type AlertVariant = 'info' | 'success' | 'error' | 'warning';

export interface AlertProps {
  /**
   * Тип уведомления
   */
  variant?: AlertVariant;

  /**
   * Сообщение для отображения
   */
  message: string;

  /**
   * Заголовок уведомления (опционально)
   */
  title?: string;

  /**
   * Функция для обработки закрытия уведомления
   */
  onClose?: () => void;

  /**
   * Дополнительные стили контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Указывает, является ли сообщение важным
   */
  important?: boolean;
}

/**
 * Компонент для отображения уведомлений разных типов
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  message,
  title,
  onClose,
  containerStyle,
  important = false,
}) => {
  const { theme } = useTheme();

  // Конфигурация для разных типов уведомлений
  const variantConfig = {
    info: {
      icon: 'information-circle',
      color: theme.colors.info,
      backgroundColor: theme.colors.info + '20', // 20 = 12% opacity in hex
    },
    success: {
      icon: 'checkmark-circle',
      color: theme.colors.success,
      backgroundColor: theme.colors.success + '20',
    },
    error: {
      icon: 'alert-circle',
      color: theme.colors.danger,
      backgroundColor: theme.colors.danger + '20',
    },
    warning: {
      icon: 'warning',
      color: theme.colors.warning,
      backgroundColor: theme.colors.warning + '20',
    },
  };

  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor, borderColor: config.color, borderWidth: 1 },
        important && styles.importantAlert,
        containerStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        <Icon name={config.icon} family="ionicons" size={24} color={config.color} />
      </View>
      <View style={styles.textContainer}>
        {title && (
          <Text variant="subtitle" style={{ color: config.color }}>
            {title}
          </Text>
        )}
        <Text variant="body" style={{ color: theme.colors.text.primary }}>
          {message}
        </Text>
      </View>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" family="ionicons" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  container: {
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  importantAlert: {
    borderLeftWidth: 4,
  },
  textContainer: {
    flex: 1,
  },
});
