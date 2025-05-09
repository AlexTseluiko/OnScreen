import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { LoginCredentials } from '../types/user';
import { spacing } from '../constants/styles';
import { COLORS } from '../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const { theme } = useTheme();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [isEmailValid, setIsEmailValid] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!credentials.email || !credentials.password) {
      return;
    }

    if (!validateEmail(credentials.email)) {
      setIsEmailValid(false);
      return;
    }

    onSubmit(credentials);
  };

  const isButtonDisabled =
    !credentials.email || !credentials.password || !isEmailValid || isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Вход</Text>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.danger + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
              !isEmailValid && { borderColor: theme.colors.danger },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={credentials.email}
            onChangeText={text => {
              setCredentials({ ...credentials, email: text });
              setIsEmailValid(true);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            placeholder="Пароль"
            placeholderTextColor={theme.colors.textSecondary}
            value={credentials.password}
            onChangeText={text => setCredentials({ ...credentials, password: text })}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
              },
              isButtonDisabled && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    padding: spacing.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background.light,
    flex: 1,
  },
  errorContainer: {
    borderRadius: 8,
    marginBottom: spacing.medium,
    padding: spacing.medium,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: spacing.small,
  },
  forgotPasswordText: {
    color: COLORS.text.secondary.light,
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    margin: 16,
    padding: 20,
    shadowColor: COLORS.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.medium,
    padding: spacing.medium,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  linkText: {
    color: COLORS.text.secondary.light,
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.large,
  },
});
