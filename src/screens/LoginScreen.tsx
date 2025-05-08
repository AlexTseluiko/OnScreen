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
  Vibration,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi, AuthError } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useUserStorage } from '../contexts/UserStorageContext';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { LoginCredentials } from '../types/user';
import { User, UserRole } from '../types/auth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();
  const userStorage = useUserStorage();
  const dispatch = useAppDispatch();
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
        useNativeDriver: true,
      }).start();
      
      // Проверяем поддержку вибрации на устройстве
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
    } catch (error) {
      console.error('Ошибка анимации:', error);
    }
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  // Функция для показа уведомления на разных платформах
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      try {
        // Безопасный способ проверки наличия ToastAndroid, избегаем статических импортов
        const RN = require('react-native');
        if (RN && RN.ToastAndroid) {
          RN.ToastAndroid.show(message, RN.ToastAndroid.SHORT);
        } else if (Alert) {
          // Запасной вариант для Android без ToastAndroid
          Alert.alert(t('common.success'), message, [{ text: t('common.ok') }]);
        }
      } catch (error) {
        console.error('Toast error:', error);
        // Используем Alert как запасной вариант
        if (Alert) {
          Alert.alert(t('common.success'), message, [{ text: t('common.ok') }]);
        }
      }
    } else if (Platform.OS === 'ios') {
      // На iOS показываем Alert с автоматическим закрытием
      Alert.alert(
        t('common.success'),
        message,
        [{ text: t('common.ok'), style: 'default' }]
      );
    } else {
      // Для веб создаем кастомное уведомление
      if (typeof document !== 'undefined') {
        // Проверяем, что мы в веб-окружении
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#2c2c2c';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      } else {
        // Fallback для других платформ
        console.log('Toast message:', message);
      }
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('authenticateToLogin'),
        fallbackLabel: t('usePassword'),
      });

      if (result.success) {
        // Показываем уведомление об успешной аутентификации
        showToast(t('biometricSuccess') || 'Аутентификация успешна');
        
        // Небольшая задержка для лучшего пользовательского опыта
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
      const response = await dispatch(login(credentials)).unwrap();
      if (response.user && response.token) {
        // Преобразуем данные пользователя в правильный формат
        const userData: User = {
          id: response.user._id,
          email: response.user.email,
          role: mapUserRole(response.user.role),
          name: `${response.user.firstName} ${response.user.lastName}`,
          photoUrl: response.user.avatar,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt
        };
        
        await userStorage.saveUserData({
          user: userData,
          token: response.token,
          refreshToken: response.token // Используем основной токен как refreshToken
        });
        navigation.replace('Home');
      } else {
        Alert.alert(t('error'), t('auth.invalidCredentials'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('auth.invalidCredentials'));
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

  // Функция для преобразования роли пользователя
  const mapUserRole = (role: string): UserRole => {
    switch (role) {
      case 'admin':
        return UserRole.ADMIN;
      case 'doctor':
        return UserRole.DOCTOR;
      case 'user':
      case 'clinic':
      default:
        return UserRole.PATIENT;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('auth.welcome')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('auth.loginPrompt')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('auth.email')}
            </Text>
            <View style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.card },
              !isEmailValid && credentials.email ? styles.inputWrapperError : {}
            ]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={credentials.email}
                onChangeText={(text) => setCredentials({ ...credentials, email: text })}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {!isEmailValid && credentials.email && (
              <Text style={styles.errorText}>
                {t('auth.invalidEmail')}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('auth.password')}
            </Text>
            <View style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.card }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={credentials.password}
                onChangeText={(text) => setCredentials({ ...credentials, password: text })}
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
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                )}
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
              {
                transform: [{ scale: scaleAnim }],
                opacity: loading ? 0.8 : 1,
              },
            ]}
          >
            <TouchableOpacity
              ref={loginButtonRef}
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: (!credentials.email || !credentials.password || !isEmailValid) ? 0.6 : 1,
                },
              ]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading || !credentials.email || !credentials.password || !isEmailValid}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {isBiometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
            >
              <Ionicons
                name="finger-print-outline"
                size={24}
                color={theme.colors.primary}
              />
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
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
  eyeIcon: {
    padding: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  socialButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
}); 