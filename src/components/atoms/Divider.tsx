import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export interface DividerProps {
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ style }) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getDividerStyle = () => ({
    ...styles.divider,
    backgroundColor: theme.colors.border,
  });

  return <View style={[getDividerStyle(), style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
