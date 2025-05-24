import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface AppLoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ size = 'large', color = '#007AFF' }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
