import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { FormattedError } from '../../utils/errorHandler';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { themes } from '../../theme/theme';

// Компонент свойства
interface ApiErrorProps {
  error: FormattedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export const ApiError: React.FC<ApiErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  // Иконка для разных типов ошибок
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return 'cloud-offline';
      case 'timeout':
        return 'time';
      case 'auth':
        return 'lock-closed';
      case 'validation':
        return 'alert-circle';
      case 'notFound':
        return 'search';
      case 'server':
        return 'server';
      case 'unknown':
      default:
        return 'warning';
    }
  };

  // Определяем цвет для иконки
  const getIconColor = () => {
    switch (error.type) {
      case 'network':
      case 'timeout':
        return theme.colors.warning;
      case 'auth':
      case 'validation':
        return theme.colors.danger;
      case 'notFound':
        return theme.colors.info;
      case 'server':
      case 'unknown':
      default:
        return theme.colors.danger;
    }
  };

  // Компактная версия (только для строчного отображения)
  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderColor: theme.colors.danger }]}>
        <Ionicons name={getErrorIcon()} size={16} color={getIconColor()} />
        <Text variant="body" style={[styles.compactText, { color: theme.colors.danger }]}>
          {error.message}
        </Text>
        {onDismiss && (
          <Ionicons
            name="close"
            size={16}
            color={theme.colors.text.secondary}
            onPress={onDismiss}
            style={styles.dismissIcon}
          />
        )}
      </View>
    );
  }

  // Полная версия с заголовком и кнопками
  return (
    <View style={[styles.container, { borderColor: theme.colors.danger }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={getErrorIcon()} size={32} color={getIconColor()} />
      </View>
      <View style={styles.content}>
        <Text variant="subtitle" style={[styles.title, { color: theme.colors.danger }]}>
          {error.title}
        </Text>
        <Text variant="body" style={[styles.message, { color: theme.colors.text.primary }]}>
          {error.message}
        </Text>
      </View>
      {(error.retry && onRetry) || onDismiss ? (
        <View style={styles.actions}>
          {error.retry && onRetry && (
            <Button
              title="Повторить"
              onPress={onRetry}
              variant="outline"
              style={styles.retryButton}
            />
          )}
          {onDismiss && (
            <Button
              title="Закрыть"
              onPress={onDismiss}
              variant="secondary"
              style={styles.dismissButton}
            />
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  compactContainer: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    marginVertical: 8,
    padding: 8,
  },
  compactText: {
    flex: 1,
    marginLeft: 8,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  dismissButton: {
    marginLeft: 8,
  },
  dismissIcon: {
    marginLeft: 8,
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  message: {
    marginTop: 4,
  },
  retryButton: {
    minWidth: 100,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default ApiError;
