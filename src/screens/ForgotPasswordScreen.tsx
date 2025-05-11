import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(text === '' || validateEmail(text));
  };

  const handleSubmit = async () => {
    if (!email || !isEmailValid) return;

    try {
      setIsLoading(true);
      const response: ApiResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(res => res.json());

      if (response.success) {
        Alert.alert('Успех', 'Инструкции по сбросу пароля отправлены на ваш email');
      } else {
        Alert.alert('Ошибка', response.error || 'Произошла ошибка при отправке запроса');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      marginTop: 20,
      padding: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonMarginTop: {
      marginTop: 30,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: 16,
      fontWeight: '600',
    },
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    form: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    input: {
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderRadius: 8,
      borderWidth: 1,
      color: theme.colors.text.primary,
      fontSize: 16,
      padding: 12,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    inputWrapper: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 8,
    },
    label: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    scrollView: {
      flex: 1,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: 16,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isSubmitted ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
              <Text style={styles.subtitle}>{t('auth.forgotPasswordDescription')}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={24} color={theme.colors.text.secondary} />
                  <TextInput
                    style={[styles.input, !isEmailValid ? styles.inputError : null]}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder={t('auth.enterEmail')}
                    placeholderTextColor={theme.colors.text.hint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {!isEmailValid && <Text style={styles.errorText}>{t('auth.invalidEmail')}</Text>}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (!email || !isEmailValid || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!email || !isEmailValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.sendResetLink')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.title}>{t('auth.checkEmail')}</Text>
            <Text style={styles.subtitle}>{t('auth.resetPasswordEmailSent')}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonMarginTop]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
