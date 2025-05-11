import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'information-circle-outline',
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={icon as any}
        size={60}
        color={theme.colors.text.secondary}
        style={styles.icon}
      />
      <Text
        variant="title"
        style={{ color: theme.colors.text.primary, textAlign: 'center', marginVertical: 8 }}
      >
        {title}
      </Text>
      {description && (
        <Text variant="body" style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
          {description}
        </Text>
      )}
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
  icon: {
    marginBottom: 16,
  },
});
