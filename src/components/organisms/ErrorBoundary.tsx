import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { logger } from '../../utils/logger';
import { useTheme } from '../../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Обновляем состояние, чтобы отрендерить запасной UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку
    logger.error('Component Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Вызываем обработчик ошибки, если он предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleTryAgain = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      // Если есть предоставленный fallback, используем его
      if (fallback) {
        return fallback;
      }

      // Иначе используем запасной UI по умолчанию
      return <ErrorFallback error={error} onTryAgain={this.handleTryAgain} />;
    }

    return children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onTryAgain: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onTryAgain }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.danger }]}>
          Произошла ошибка приложения
        </Text>
        <Text style={[styles.message, { color: theme.colors.text.primary }]}>
          {error?.message || 'Неизвестная ошибка'}
        </Text>
        <Button title="Попробовать снова" onPress={onTryAgain} color={theme.colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
    maxWidth: 400,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
