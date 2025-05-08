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
import { authApi } from '../api/auth';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(text === '' || validateEmail(text));
  };

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert(
        t('common.error'),
        t('auth.fillAllFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setIsSubmitted(true);
      Alert.alert(
        t('common.success'),
        t('auth.resetLinkSent'),
        [{ text: t('common.ok') }]
      );
    } catch (error: any) {
      console.error('Ошибка восстановления пароля:', error);
      
      let errorMessage = 'Не удалось отправить инструкции для сброса пароля';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        t('common.error'),
        errorMessage,
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('auth.forgotPasswordTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('auth.forgotPasswordSubtitle')}
          </Text>
        </View>

        {!isSubmitted ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t('auth.email')}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.colors.inputBackground },
                  !isEmailValid ? styles.inputWrapperError : {},
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {!isEmailValid && email && (
                <Text style={styles.errorText}>
                  {t('auth.invalidEmail')}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: !email || !isEmailValid || isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleSendResetLink}
              disabled={!email || !isEmailValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>
                  {t('auth.sendResetLink')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={theme.colors.success}
              />
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
              {t('common.success')}
            </Text>
            <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
              {t('auth.resetLinkSent')}
            </Text>
            <TouchableOpacity
              style={[styles.backToLoginButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backToLoginText}>
                {t('auth.goBackToLogin')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  sendButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ForgotPasswordScreen; 