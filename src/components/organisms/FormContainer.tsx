import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Card } from '../molecules/Card';

export interface FormContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
  isLoading?: boolean;
}

/**
 * Контейнерный компонент для форм
 * Используется для отображения форм с общим оформлением
 * и может содержать состояние и логику обработки формы
 */
export const FormContainer: React.FC<FormContainerProps> = ({
  title,
  subtitle,
  children,
  footer,
  error,
  isLoading,
}) => {
  return (
    <Card title={title} subtitle={subtitle} footer={footer} style={styles.card}>
      {isLoading ? (
        <View style={styles.loadingContainer}>{/* Здесь может быть компонент загрузки */}</View>
      ) : (
        <>
          {error && (
            <View style={styles.errorContainer}>
              <Text variant="error">{error}</Text>
            </View>
          )}
          {children}
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  errorContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});
