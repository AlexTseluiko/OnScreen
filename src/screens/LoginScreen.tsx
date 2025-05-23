import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import * as LocalAuthentication from 'expo-local-authentication';
import { LoginCredentials } from '../types/user';
import { showPlatformToast, vibrate } from '../utils/platform';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

// Импортируем компоненты из атомарной дизайн-системы
import { Text } from '../components/ui/atoms/Text';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { Checkbox } from '../components/ui/atoms/Checkbox';
import { Card } from '../components/ui/atoms/Card';
import { Divider } from '../components/ui/atoms/Divider';
import { Icon } from '../components/ui/atoms/Icon';

// Импортируем наш новый компонент логотипа
import { LogoWithoutBackground } from '../components/ui/atoms/LogoWithoutBackground';
import { SOCIAL_COLORS } from '../constants/socialColors';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuth();

  // Состояния
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
  const [error, setError] = useState<string | null>(null);

  // Состояние для хранения динамических стилей
  const [dynamicStyles, setDynamicStyles] = useState({
    errorCard: {
      backgroundColor: theme.colors.error,
      marginTop: 16,
      padding: 16,
    },
    errorText: {
      color: theme.colors.surface,
    },
    dynamicLink: {
      color: theme.colors.primary,
    },
  });

  // Ссылки
  const timerRef = useRef<NodeJS.Timeout>();

  // Стили компонента
  const styles = StyleSheet.create({
    appName: {
      marginTop: 8,
    },
    appleButton: {
      backgroundColor: SOCIAL_COLORS.APPLE,
    },
    biometricButton: {
      marginBottom: 16,
    },
    container: {
      flex: 1,
    },
    dividerStyle: {
      marginVertical: 16,
    },
    facebookButton: {
      backgroundColor: SOCIAL_COLORS.FACEBOOK,
    },
    formCard: {
      marginBottom: 24,
      padding: 24,
    },
    formContainer: {
      marginBottom: 24,
    },
    googleButton: {
      backgroundColor: SOCIAL_COLORS.GOOGLE,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    loginButton: {
      marginBottom: 16,
    },
    loginPromptText: {
      color: theme.colors.text.secondary,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    passwordStrengthBar: {
      borderRadius: 2,
      height: 4,
      marginBottom: 4,
      overflow: 'hidden',
    },
    passwordStrengthContainer: {
      marginBottom: 16,
    },
    registerContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 16,
    },
    rememberContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    rememberForgotContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingVertical: 32,
    },
    socialButton: {
      borderRadius: 20,
      padding: 12,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    socialLoginContainer: {
      marginBottom: 24,
    },
    socialText: {
      marginBottom: 16,
      textAlign: 'center',
    },
    welcomeText: {
      marginBottom: 8,
    },
  });

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    const currentTimerRef = timerRef.current;
    return () => {
      if (currentTimerRef) {
        clearTimeout(currentTimerRef);
      }
    };
  }, []);

  // Обновляем динамические стили при изменении темы
  useEffect(() => {
    setDynamicStyles({
      errorCard: {
        backgroundColor: theme.colors.error,
        marginTop: 16,
        padding: 16,
      },
      errorText: {
        color: theme.colors.surface,
      },
      dynamicLink: {
        color: theme.colors.primary,
      },
    });
  }, [theme]);

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
        return theme.colors.text.secondary;
    }
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return t('auth.passwordStrength.veryWeak');
      case 2:
      case 3:
        return t('auth.passwordStrength.medium');
      case 4:
      case 5:
        return t('auth.passwordStrength.strong');
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
        promptMessage: t('auth.authenticateToLogin'),
        fallbackLabel: t('auth.usePassword'),
      });

      if (result.success) {
        // Предполагаем, что у нас есть сохраненные данные для входа
        if (credentials.email && credentials.password) {
          handleLogin();
        } else {
          showPlatformToast('Необходимо ввести логин и пароль хотя бы один раз');
        }
      }
    } catch (error) {
      console.error('Ошибка биометрической аутентификации:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить биометрическую аутентификацию');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    if (!isEmailValid) {
      setError(t('auth.invalidEmail'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(credentials.email, credentials.password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('auth.loginFailed'));
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Заглушка для демонстрации. В реальном приложении тут будет интеграция с социальными сетями
    showPlatformToast(`Вход через ${provider} будет доступен позже`);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.colors.background }}
      >
        <View style={styles.logoContainer}>
          <LogoWithoutBackground size={100} color={theme.colors.primary} />
          <Text variant="heading" style={styles.appName}>
            OnScreen
          </Text>
        </View>

        <Card containerStyle={styles.formCard}>
          <View style={styles.headerContainer}>
            <Text variant="heading" style={styles.welcomeText}>
              {t('auth.welcome')}
            </Text>
            <Text variant="bodySmall" style={styles.loginPromptText}>
              {t('auth.loginPrompt')}
            </Text>
          </View>

          {error && (
            <Card containerStyle={dynamicStyles.errorCard}>
              <Text variant="body" style={dynamicStyles.errorText}>
                {error}
              </Text>
            </Card>
          )}

          <View style={styles.formContainer}>
            <Input
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={credentials.email}
              onChangeText={text => setCredentials({ ...credentials, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!isEmailValid && credentials.email ? true : false}
              helperText={!isEmailValid && credentials.email ? t('auth.invalidEmail') : undefined}
              leftIcon={
                <Icon name="mail" family="ionicons" size={20} color={theme.colors.primary} />
              }
            />

            <Input
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={credentials.password}
              onChangeText={text => setCredentials({ ...credentials, password: text })}
              secureTextEntry={!showPassword}
              leftIcon={
                <Icon name="lock-closed" family="ionicons" size={20} color={theme.colors.primary} />
              }
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    family="ionicons"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              }
            />

            {showPasswordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View
                  style={[
                    styles.passwordStrengthBar,
                    {
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength),
                    },
                  ]}
                />
                <Text
                  variant="caption"
                  style={{ color: getPasswordStrengthColor(passwordStrength) }}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
              </View>
            )}

            <View style={styles.rememberForgotContainer}>
              <View style={styles.rememberContainer}>
                <Checkbox
                  checked={rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                  label={t('auth.rememberMe')}
                />
              </View>

              <TouchableOpacity onPress={navigateToForgotPassword}>
                <Text variant="bodySmall" style={dynamicStyles.dynamicLink}>
                  {t('auth.forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Button
                title={t('auth.login')}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.loginButton}
              />
            </Animated.View>

            {isBiometricAvailable && (
              <TouchableOpacity onPress={handleBiometricAuth} style={styles.biometricButton}>
                <Icon
                  name="finger-print"
                  family="ionicons"
                  size={32}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            <View style={styles.registerContainer}>
              <Text variant="body">{t('auth.noAccount')}</Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text variant="bodySmall" style={dynamicStyles.dynamicLink}>
                  {t('auth.register')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialLoginContainer}>
              <Divider style={styles.dividerStyle} />
              <Text variant="bodySmall" style={styles.socialText}>
                {t('auth.loginWithSocial')}
              </Text>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => handleSocialLogin(t('auth.socialLogin.google'))}
                >
                  <Icon
                    name="logo-google"
                    family="ionicons"
                    size={24}
                    color={SOCIAL_COLORS.WHITE}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialLogin(t('auth.socialLogin.apple'))}
                >
                  <Icon name="logo-apple" family="ionicons" size={24} color={SOCIAL_COLORS.WHITE} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin(t('auth.socialLogin.facebook'))}
                >
                  <Icon
                    name="logo-facebook"
                    family="ionicons"
                    size={24}
                    color={SOCIAL_COLORS.WHITE}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
