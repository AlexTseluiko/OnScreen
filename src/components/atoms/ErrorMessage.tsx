import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  const getContainerStyle = () => ({
    ...styles.container,
    backgroundColor: `${theme.colors.error}20`,
  });

  const getTextStyle = () => ({
    ...styles.text,
    color: theme.colors.error,
  });

  return (
    <View style={getContainerStyle()}>
      <Text style={getTextStyle()}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});
