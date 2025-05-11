import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Container } from '../molecules/Container';
import { Text } from '../atoms/Text';

export interface PageTemplateProps {
  title?: string;
  children: ReactNode;
  scrollable?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  loading?: boolean;
  error?: string;
}

/**
 * Базовый шаблон для страниц приложения
 * Определяет общую структуру для всех страниц
 */
export const PageTemplate: React.FC<PageTemplateProps> = ({
  title,
  children,
  scrollable = true,
  headerContent,
  footerContent,
  loading = false,
  error,
}) => {
  return (
    <Container scrollable={scrollable}>
      <View style={styles.header}>
        {title && (
          <Text variant="title" style={styles.title}>
            {title}
          </Text>
        )}
        {headerContent && <View style={styles.headerContent}>{headerContent}</View>}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text variant="error">{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>{/* Здесь может быть компонент загрузки */}</View>
        ) : (
          children
        )}
      </View>

      {footerContent && <View style={styles.footer}>{footerContent}</View>}
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    marginBottom: 8,
  },
});
