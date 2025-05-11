import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../theme';
import { commonStyles } from '../../constants/styles';
import { Text } from '../atoms/Text';

export interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  style,
  ...rest
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[isDark ? commonStyles.cardDark : commonStyles.card, style]} {...rest}>
      {title && (
        <View style={styles.header}>
          <Text variant="subtitle">{title}</Text>
          {subtitle && <Text variant="secondary">{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    marginVertical: 8,
  },
  footer: {
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  header: {
    marginBottom: 8,
  },
});
