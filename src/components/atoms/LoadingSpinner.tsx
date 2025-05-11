import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export const LoadingSpinner: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getContainerStyle = () => ({
    ...styles.container,
    backgroundColor: theme.colors.overlay,
  });

  return (
    <View style={getContainerStyle()}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
