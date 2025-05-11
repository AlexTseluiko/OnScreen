import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, rightElement, containerStyle, ...rest }, ref) => {
    const { isDark } = useTheme();
    const theme = isDark ? themes.dark : themes.light;

    const getInputStyle = () => ({
      backgroundColor: theme.colors.surface,
      borderColor: error ? theme.colors.error : theme.colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.colors.text.primary,
      fontSize: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
    });

    const getLabelStyle = (): TextStyle => ({
      color: theme.colors.text.primary,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    });

    const getErrorStyle = (): TextStyle => ({
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={getLabelStyle()}>{label}</Text>}
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={[getInputStyle(), style, rightElement ? styles.inputWithRightElement : null]}
            placeholderTextColor={theme.colors.text.secondary}
            {...rest}
          />
          {rightElement && <View style={styles.rightElementContainer}>{rightElement}</View>}
        </View>
        {error && <Text style={getErrorStyle()}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  inputWithRightElement: {
    paddingRight: 40,
  },
  rightElementContainer: {
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
  },
});
