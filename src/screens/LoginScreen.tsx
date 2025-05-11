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
import { AuthStackParamList } from '../navigation/AppNavigation';
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

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

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

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
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
          // Биометрическая аутентификация успешна
          // После успешной авторизации в системе будет автоматическое перенаправление
          // на MainNavigator через AppNavigation
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
      // Для навигации в MainNavigator нельзя использовать reset напрямую
      // После успешной авторизации будет автоматическое перенаправление
      // на MainNavigator через AppNavigation
      // navigation.replace('Login'); // Не нужно, т.к. переключение произойдет автоматически
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

  // Получаем сообщение об ошибке для email
  const emailErrorText = !isEmailValid && credentials.email ? t('auth.invalidEmail') : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <Text variant="title" style={styles.welcomeTitle}>
            {t('auth.welcome')}
          </Text>
          <Text variant="subtitle" color="secondary">
            {t('auth.loginPrompt')}
          </Text>
        </View>

        <Card style={styles.loginCard}>
          <View style={styles.inputGroup}>
            <Input
              label={t('auth.email')}
              value={credentials.email}
              onChangeText={text => setCredentials({ ...credentials, email: text })}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!isEmailValid && credentials.email ? true : false}
              helperText={emailErrorText}
              leftIcon={<Icon family="ionicons" name="mail-outline" size={20} color={theme.colors.text.secondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              label={t('auth.password')}
              value={credentials.password}
              onChangeText={text => setCredentials({ ...credentials, password: text })}
              placeholder={t('auth.passwordPlaceholder')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={<Icon family="ionicons" name="lock-closed-outline" size={20} color={theme.colors.text.secondary} />}
              rightIcon={<Icon family="ionicons" name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.text.secondary} />}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {showPasswordStrength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthIndicator,
                      {
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text
                  variant="caption"
                  style={{ color: getPasswordStrengthColor(passwordStrength) }}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rememberContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                checked={rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
                label={t('auth.rememberMe')}
              />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text variant="caption" style={dynamicStyles.dynamicLink}>
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[styles.loginButtonContainer, { transform: [{ scale: scaleAnim }] }]}
          >
            <Button
              title={t('auth.login')}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading || !credentials.email || !credentials.password || !isEmailValid}
              fullWidth
            />
          </Animated.View>

          {isBiometricAvailable && (
            <Button
              title={t('auth.loginWithBiometric')}
              onPress={handleBiometricAuth}
              leftIcon="finger-print-outline"
              variant="outline"
              size="medium"
              fullWidth
              style={styles.biometricButton}
            />
          )}
        </Card>

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text variant="bodySmall" color="secondary" style={styles.orText}>
            {t('auth.orContinueWith')}
          </Text>
          <Divider style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <Button
            title="Google"
            onPress={() => handleSocialLogin('Google')}
            leftIcon={<Icon family="ionicons" name="logo-google" size={20} color="#DB4437" />}
            variant="outline"
            style={styles.googleButton}
          />

          <Button
            title="Facebook"
            onPress={() => handleSocialLogin('Facebook')}
            leftIcon={<Icon family="ionicons" name="logo-facebook" size={20} color="#4267B2" />}
            variant="outline"
            style={styles.facebookButton}
          />

          <Button
            title="Apple"
            onPress={() => handleSocialLogin('Apple')}
            leftIcon={
              <Icon
                family="ionicons"
                name="logo-apple"
                size={20}
                color={String(theme.colors.text.primary)}
              />
            }
            variant="outline"
            style={styles.appleButton}
          />
        </View>

        <View style={styles.registerContainer}>
          <Text variant="body" color="secondary">
            {t('auth.dontHaveAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text variant="caption" style={dynamicStyles.dynamicLink}>
              {t('auth.register')}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Card style={dynamicStyles.errorCard}>
            <Text variant="body" style={dynamicStyles.errorText}>
              {error}
            </Text>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  appleButton: {
    flex: 1,
    marginLeft: 8,
  },
  biometricButton: {
    marginBottom: 16,
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  divider: {
    flex: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  facebookButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  googleButton: {
    flex: 1,
    marginRight: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loginButtonContainer: {
    marginBottom: 16,
  },
  loginCard: {
    marginBottom: 24,
    padding: 24,
  },
  orText: {
    marginHorizontal: 16,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  strengthBar: {
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthIndicator: {
    height: '100%',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    marginBottom: 8,
  },
});
