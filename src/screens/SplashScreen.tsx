import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { AppLoader } from '../components/AppLoader';
import { useTheme } from '../contexts/ThemeContext';

export const SplashScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <AppLoader />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 200,
    marginBottom: 20,
    width: 200,
  },
});
