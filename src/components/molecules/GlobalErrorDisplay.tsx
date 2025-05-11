import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useError } from '../../contexts/ErrorContext';
import { ApiError } from './ApiError';

interface GlobalErrorDisplayProps {
  maxErrors?: number;
  dismissAfter?: number; // в миллисекундах
}

/**
 * Компонент для отображения глобальных ошибок из контекста ErrorContext
 */
export const GlobalErrorDisplay: React.FC<GlobalErrorDisplayProps> = ({
  maxErrors = 3,
  dismissAfter = 5000, // 5 секунд по умолчанию
}) => {
  const { globalErrors, clearGlobalError } = useError();

  // Показываем только ограниченное количество ошибок
  const displayErrors = globalErrors.slice(0, maxErrors);

  // Автоматическое скрытие ошибок через определённое время
  React.useEffect(() => {
    if (dismissAfter > 0 && displayErrors.length > 0) {
      const timers = displayErrors.map((_, index) => {
        return setTimeout(() => {
          clearGlobalError(index);
        }, dismissAfter);
      });

      // Очистка таймеров при размонтировании компонента
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [displayErrors, dismissAfter, clearGlobalError]);

  // Если нет ошибок, ничего не отображаем
  if (displayErrors.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayErrors.map((error, index) => (
          <View key={`${error.code}_${index}`} style={styles.errorItem}>
            <ApiError error={error} onDismiss={() => clearGlobalError(index)} compact={false} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 50,
    zIndex: 1000,
  },
  errorItem: {
    marginBottom: 8,
    maxWidth: 500,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: 300,
    width: '100%',
  },
});

export default GlobalErrorDisplay;
