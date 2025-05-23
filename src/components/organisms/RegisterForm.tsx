import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { RegisterData } from '../../types/user';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Button } from '../ui/atoms/Button';
import { Card } from '../molecules/Card';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Требования к паролю
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    const currentTimer = timerRef.current;
    return () => {
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
    };
  }, []);

  // Обработка изменения пароля
  useEffect(() => {
    if (formData.password) {
      // Проверяем требования к паролю
      setHasMinLength(formData.password.length >= 8);
      setHasUppercase(/[A-Z]/.test(formData.password));
      setHasLowercase(/[a-z]/.test(formData.password));
      setHasNumber(/[0-9]/.test(formData.password));
      setHasSpecialChar(/[^A-Za-z0-9]/.test(formData.password));

      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
    }
  }, [formData.password, confirmPassword]);

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
        return theme.colors.danger;
      case 2:
      case 3:
        return theme.colors.warning;
      case 4:
      case 5:
        return theme.colors.success;
      default:
        return theme.colors.text.hint;
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Обработка изменения email
  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, email: text });
    const isValid = validateEmail(text);
    if (isValid) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    } else {
      setFormErrors(prev => ({ ...prev, email: t('auth.invalidEmail') }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name) {
      errors.name = t('auth.nameRequired');
    }

    if (!formData.email) {
      errors.email = t('auth.emailRequired');
    } else if (!validateEmail(formData.email)) {
      errors.email = t('auth.invalidEmail');
    }

    if (!formData.password) {
      errors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 8) {
      errors.password = t('auth.passwordTooShort');
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.formContainer}>
          <Text variant="title" style={styles.title}>
            {t('auth.register')}
          </Text>

          {error && (
            <Text variant="error" style={styles.errorText}>
              {error}
            </Text>
          )}

          <Input
            label={t('auth.name')}
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholder={t('auth.enterName')}
            error={formErrors.name}
            style={styles.input}
          />

          <Input
            label={t('auth.email')}
            value={formData.email}
            onChangeText={handleEmailChange}
            placeholder={t('auth.enterEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={formErrors.email}
            style={styles.input}
          />

          <Input
            label={t('auth.password')}
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            placeholder={t('auth.enterPassword')}
            secureTextEntry={!showPassword}
            error={formErrors.password}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            }
            style={styles.input}
          />

          {showPasswordStrength && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthMeter}>
                {[1, 2, 3, 4, 5].map(segment => (
                  <View
                    key={segment}
                    style={[
                      styles.passwordStrengthSegment,
                      {
                        backgroundColor:
                          segment <= passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : theme.colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text variant="caption" style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                {getPasswordStrengthText(passwordStrength)}
              </Text>
            </View>
          )}

          <Input
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('auth.enterConfirmPassword')}
            secureTextEntry={!showConfirmPassword}
            error={formErrors.confirmPassword}
            rightElement={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            }
            style={styles.input}
          />

          <View style={styles.passwordRequirements}>
            <Text variant="caption" style={styles.passwordRequirementsTitle}>
              {t('auth.passwordRequirements')}:
            </Text>
            <View style={styles.passwordRequirementItem}>
              <Ionicons
                name={hasMinLength ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={hasMinLength ? theme.colors.success : theme.colors.text.hint}
              />
              <Text
                variant="caption"
                style={[
                  styles.passwordRequirementText,
                  { color: hasMinLength ? theme.colors.success : theme.colors.text.hint },
                ]}
              >
                {t('auth.minLength')}
              </Text>
            </View>
            <View style={styles.passwordRequirementItem}>
              <Ionicons
                name={hasUppercase ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={hasUppercase ? theme.colors.success : theme.colors.text.hint}
              />
              <Text
                variant="caption"
                style={[
                  styles.passwordRequirementText,
                  { color: hasUppercase ? theme.colors.success : theme.colors.text.hint },
                ]}
              >
                {t('auth.hasUppercase')}
              </Text>
            </View>
            <View style={styles.passwordRequirementItem}>
              <Ionicons
                name={hasLowercase ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={hasLowercase ? theme.colors.success : theme.colors.text.hint}
              />
              <Text
                variant="caption"
                style={[
                  styles.passwordRequirementText,
                  { color: hasLowercase ? theme.colors.success : theme.colors.text.hint },
                ]}
              >
                {t('auth.hasLowercase')}
              </Text>
            </View>
            <View style={styles.passwordRequirementItem}>
              <Ionicons
                name={hasNumber ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={hasNumber ? theme.colors.success : theme.colors.text.hint}
              />
              <Text
                variant="caption"
                style={[
                  styles.passwordRequirementText,
                  { color: hasNumber ? theme.colors.success : theme.colors.text.hint },
                ]}
              >
                {t('auth.hasNumber')}
              </Text>
            </View>
            <View style={styles.passwordRequirementItem}>
              <Ionicons
                name={hasSpecialChar ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={hasSpecialChar ? theme.colors.success : theme.colors.text.hint}
              />
              <Text
                variant="caption"
                style={[
                  styles.passwordRequirementText,
                  { color: hasSpecialChar ? theme.colors.success : theme.colors.text.hint },
                ]}
              >
                {t('auth.hasSpecialChar')}
              </Text>
            </View>
          </View>

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            disabled={isLoading}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text variant="body">{t('auth.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text variant="body" style={[styles.loginLink, { color: theme.colors.primary }]}>
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
  },
  container: {
    flex: 1,
  },
  errorText: {
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  formContainer: {
    padding: 24,
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  loginLink: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  passwordRequirementItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  passwordRequirementText: {
    marginLeft: 6,
  },
  passwordRequirements: {
    marginBottom: 16,
    marginTop: 4,
  },
  passwordRequirementsTitle: {
    marginBottom: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
    marginTop: -12,
  },
  passwordStrengthMeter: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 6,
    marginTop: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: '100%',
    marginRight: 2,
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
