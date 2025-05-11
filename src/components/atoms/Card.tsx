import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getCardStyle = () => ({
    ...styles.card,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
  });

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    elevation: 2,
    padding: 16,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
