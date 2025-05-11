import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Свойства компонента Alert
 * @property {string} title - Заголовок уведомления
 * @property {string} message - Текст уведомления
 * @property {AlertVariant} variant - Вариант отображения уведомления
 * @property {ReactNode} icon - Пользовательская иконка
 * @property {() => void} onClose - Обработчик закрытия уведомления
 * @property {ViewStyle} containerStyle - Стили для контейнера
 * @property {boolean} closable - Если true, уведомление можно закрыть
 */
export interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  icon?: ReactNode;
  onClose?: () => void;
  containerStyle?: ViewStyle;
  closable?: boolean;
}

/**
 * Компонент для отображения уведомлений различных типов
 *
 * Поддерживает разные варианты отображения (success, error, warning, info)
 * Может содержать заголовок, сообщение и иконку
 * Автоматически подстраивается под выбранную тему
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = 'info',
  icon,
  onClose,
  containerStyle,
  closable = false,
}) => {
  const { theme } = useTheme();

  // Получение цветов в зависимости от варианта уведомления
  const getAlertColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: theme.colors.success + '20', // 20% прозрачности
          border: theme.colors.success,
          text: theme.colors.success,
          icon: 'check-circle',
        };
      case 'error':
        return {
          background: theme.colors.danger + '20',
          border: theme.colors.danger,
          text: theme.colors.danger,
          icon: 'error',
        };
      case 'warning':
        return {
          background: theme.colors.warning + '20',
          border: theme.colors.warning,
          text: theme.colors.warning,
          icon: 'warning',
        };
      case 'info':
      default:
        return {
          background: theme.colors.info + '20',
          border: theme.colors.info,
          text: theme.colors.info,
          icon: 'info',
        };
    }
  };

  const alertColors = getAlertColors();

  // Получение иконки
  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    return <Icon name={alertColors.icon} size={24} color={alertColors.text} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: alertColors.background,
          borderColor: alertColors.border,
        },
        containerStyle,
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>

      <View style={styles.contentContainer}>
        {title && (
          <Text variant="subtitle" style={[styles.title, { color: alertColors.text }]}>
            {title}
          </Text>
        )}
        <Text variant="body" style={[styles.message, title ? styles.messageWithTitle : null]}>
          {message}
        </Text>
      </View>

      {(closable || onClose) && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="close" size={18} color={theme.colors.text.secondary} />
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
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    marginVertical: 8,
    padding: 12,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    opacity: 0.9,
  },
  messageWithTitle: {
    marginTop: 4,
  },
  title: {
    fontWeight: '600',
  },
});
