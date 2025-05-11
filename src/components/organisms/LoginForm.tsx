import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { LoginCredentials } from '../../types/user';

import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Card } from '../molecules/Card';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!credentials.email || !credentials.password) {
      setValidationError('Пожалуйста, заполните все поля');
      return;
    }

    if (!validateEmail(credentials.email)) {
      setValidationError('Пожалуйста, введите корректный email');
      return;
    }

    setValidationError(null);
    onSubmit(credentials);
  };

  const isButtonDisabled = !credentials.email || !credentials.password || isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.formContainer}>
          <Text variant="title" style={styles.title}>
            Вход
          </Text>

          {error && <Text variant="error">{error}</Text>}
          {validationError && <Text variant="error">{validationError}</Text>}

          <Input
            label="Email"
            value={credentials.email}
            onChangeText={text => {
              setCredentials({ ...credentials, email: text });
              setValidationError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={
              validationError && !validateEmail(credentials.email)
                ? 'Некорректный email'
                : undefined
            }
            style={styles.input}
          />

          <Input
            label="Пароль"
            value={credentials.password}
            onChangeText={text => {
              setCredentials({ ...credentials, password: text });
              setValidationError(null);
            }}
            secureTextEntry
            style={styles.input}
          />

          <Button
            title={isLoading ? 'Вход...' : 'Войти'}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            isLoading={isLoading}
            style={styles.button}
          />

          <View style={styles.linksContainer}>
            <Button
              title="Нет аккаунта? Зарегистрироваться"
              variant="secondary"
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
              style={styles.registerButton}
            />

            <Button
              title="Забыли пароль?"
              variant="secondary"
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isLoading}
              style={styles.forgotButton}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
  },
  container: {
    flex: 1,
  },
  forgotButton: {
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerButton: {
    marginTop: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
});
