import React, { useState, useEffect } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../api/auth';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Получаем токен из параметров маршрута
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
    }
  }, [route.params]);

  // Проверка совпадения паролей
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword]);

  // Расчет силы пароля
  useEffect(() => {
    if (newPassword) {
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const calculatePasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return '#FF3B30'; // Красный
      case 2:
      case 3:
        return '#FF9500'; // Оранжевый
      case 4:
      case 5:
        return '#34C759'; // Зеленый
      default:
        return '#999999'; // Серый
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

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        t('common.error'),
        t('auth.fillAllFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        t('common.error'),
        t('auth.passwordTooShort'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!passwordsMatch) {
      Alert.alert(
        t('common.error'),
        t('auth.passwordsDoNotMatch'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
      Alert.alert(
        t('common.success'),
        t('auth.passwordChanged'),
        [{ text: t('common.ok') }]
      );
    } catch (error: any) {
      console.error('Ошибка сброса пароля:', error);
      
      let errorMessage = 'Не удалось сбросить пароль';
      
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

  const handleGoToLogin = () => {
    navigation.navigate('Login');
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
        {!isSuccess ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {t('auth.resetPasswordTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {t('auth.resetPasswordSubtitle')}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('auth.newPassword')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.inputBackground },
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
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

                {newPassword && (
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

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  {t('auth.confirmNewPassword')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.colors.inputBackground },
                    !passwordsMatch && confirmPassword ? styles.inputWrapperError : {},
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
                {!passwordsMatch && confirmPassword && (
                  <Text style={styles.errorText}>
                    {t('auth.passwordsDoNotMatch')}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: !newPassword || !confirmPassword || !passwordsMatch || passwordStrength < 2 || isLoading ? 0.6 : 1,
                  },
                ]}
                onPress={handleSavePassword}
                disabled={!newPassword || !confirmPassword || !passwordsMatch || passwordStrength < 2 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t('auth.saveNewPassword')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
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
              {t('auth.passwordChanged')}
            </Text>
            <TouchableOpacity
              style={[styles.goToLoginButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleGoToLogin}
            >
              <Text style={styles.goToLoginText}>
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
  eyeIcon: {
    padding: 4,
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
  saveButton: {
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
  saveButtonText: {
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
  goToLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  goToLoginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ResetPasswordScreen; 