import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as LocalAuthentication from 'expo-local-authentication';
import { LoginCredentials } from '../types/user';
import { ErrorMessage } from '../components/ErrorMessage';
import { COLORS } from '../constants';
import { showPlatformToast, vibrate } from '../utils/platform';
import { useAuth } from '../contexts/AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const loginButtonRef = useRef<TouchableOpacity>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string | null>(null);

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (credentials.password) {
      const strength = calculatePasswordStrength(credentials.password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
    }
  }, [credentials.password]);

  // Проверка валидности email при изменении
  useEffect(() => {
    if (credentials.email) {
      setIsEmailValid(validateEmail(credentials.email));
    } else {
      setIsEmailValid(true);
    }
  }, [credentials.email]);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Ошибка проверки биометрии:', error);
      setIsBiometricAvailable(false);
    }
  };

  const calculatePasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 6) strength += 2; // Достаточная длина для входа
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return '#FF3B30';
      case 2:
      case 3:
        return '#FF9500';
      case 4:
      case 5:
        return '#34C759';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return t('veryWeak');
      case 2:
      case 3:
        return t('medium');
      case 4:
      case 5:
        return t('strong');
      default:
        return '';
    }
  };

  const handlePressIn = useCallback(() => {
    try {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      vibrate();
    } catch (error) {
      console.error('Ошибка анимации:', error);
    }
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [scaleAnim]);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('authenticateToLogin'),
        fallbackLabel: t('usePassword'),
      });

      if (result.success) {
        showPlatformToast(t('biometricSuccess') || 'Аутентификация успешна');

        timerRef.current = setTimeout(() => {
          navigation.replace('Home');
        }, 800);
      }
    } catch (error) {
      console.error('Ошибка биометрической аутентификации:', error);
      Alert.alert(
        t('common.error'),
        t('biometricError') || 'Произошла ошибка при биометрической аутентификации'
      );
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert(t('error'), t('auth.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Отправка запроса на вход...');

      await login(credentials.email, credentials.password);
      console.log('Вход выполнен успешно');

      showPlatformToast(t('auth.loginSuccess') || 'Вход выполнен успешно');
      navigation.replace('Home');
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error instanceof Error ? error.message : t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Социальные сети временно недоступны
    Alert.alert(
      t('common.info'),
      t('socialLoginNotAvailable') || `Вход через ${provider} временно недоступен.`,
      [{ text: t('common.ok') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.welcome')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('auth.loginPrompt')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.email')}</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.card },
                !isEmailValid && credentials.email ? styles.inputWrapperError : {},
              ]}
            >
              <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={credentials.email}
                onChangeText={text => setCredentials({ ...credentials, email: text })}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {!isEmailValid && credentials.email && (
              <Text style={styles.errorText}>{t('auth.invalidEmail')}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.password')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={credentials.password}
                onChangeText={text => setCredentials({ ...credentials, password: text })}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {showPasswordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor(passwordStrength) },
                  ]}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                {rememberMe && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={[styles.rememberMeText, { color: theme.colors.text }]}>
                {t('auth.rememberMe')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.loginButtonContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
              loading ? styles.buttonOpacity : null,
            ]}
          >
            <TouchableOpacity
              ref={loginButtonRef}
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                },
                !credentials.email || !credentials.password || !isEmailValid
                  ? styles.buttonOpacityDisabled
                  : null,
              ]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading || !credentials.email || !credentials.password || !isEmailValid}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {isBiometricAvailable && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
              <Ionicons name="finger-print-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.biometricText, { color: theme.colors.text }]}>
                {t('auth.loginWithBiometric')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              {t('auth.orContinueWith')}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: theme.colors.cardBackground }]}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t('auth.dontHaveAccount')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              {t('auth.register')}
            </Text>
          </TouchableOpacity>
        </View>

        {error && <ErrorMessage message={error} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  biometricButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 12,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonOpacity: {
    opacity: 0.8,
  },
  buttonOpacityDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },
  container: {
    flex: 1,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 24,
  },
  dividerText: {
    fontSize: 14,
    marginHorizontal: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  footerText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    gap: 8,
    marginBottom: 20,
  },
  inputWrapper: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    height: 54,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    height: 54,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  passwordStrengthBar: {
    backgroundColor: COLORS.gray5,
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthFill: {
    height: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rememberMeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rememberMeText: {
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 3,
    height: 80,
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 80,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
