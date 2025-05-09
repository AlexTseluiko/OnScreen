import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authApi, AuthError } from '../api/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RegisterData } from '../types/user';
import { COLORS } from '../constants/colors';
import { showToast } from '../utils/toast.android';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit: _onSubmit }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Требования к паролю
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
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
      setPasswordsMatch(formData.password === confirmPassword);
    } else {
      setShowPasswordStrength(false);
      setPasswordsMatch(true);
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
        return COLORS.danger;
      case 2:
      case 3:
        return COLORS.warning;
      case 4:
      case 5:
        return COLORS.success;
      default:
        return COLORS.gray[500];
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Обработка изменения email
  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, email: text });
    const isValid = validateEmail(text);
    setIsEmailValid(isValid);
    if (isValid) {
      setEmailChecked(false);
      setEmailExists(false);
    }
  };

  // Проверка, существует ли email
  const checkEmailExists = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setIsEmailValid(false);
      return;
    }

    try {
      const exists = await authApi.checkEmailExists(formData.email).catch(() => false);
      setEmailExists(exists);
      setEmailChecked(true);
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailExists(false);
      setEmailChecked(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    if (formData.password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to register with:', {
        name: formData.name,
        email: formData.email,
        password: '******',
      });

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      console.log(
        'Sending registration data to server:',
        JSON.stringify({ ...userData, password: '******' })
      );

      const response = await authApi.register(userData);
      console.log('Registration successful:', JSON.stringify(response));

      // Показываем короткое уведомление об успехе
      showToast(t('auth.registrationSuccess'));

      // Небольшая задержка перед навигацией (для всех платформ)
      timerRef.current = setTimeout(
        () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
        Platform.OS === 'ios' ? 800 : 300
      );
    } catch (error: unknown) {
      console.error('Registration error:', error);

      let errorMessage = t('auth.registrationFailed');

      if (error instanceof AuthError) {
        console.log(`Auth error: ${error.message}, status: ${error.status}, code: ${error.code}`);

        if (error.code === 'email_exists') {
          errorMessage = t('auth.emailAlreadyExists');
          setEmailExists(true);
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        console.log('Error message:', error.message);

        if (error.message.includes('already exists') || error.message.includes('уже существует')) {
          errorMessage = t('auth.emailAlreadyExists');
          setEmailExists(true);
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(t('common.error'), errorMessage, [{ text: 'OK' }], { cancelable: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('auth.register')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('auth.name')}
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            autoCapitalize="words"
            editable={!loading}
          />

          <View>
            <TextInput
              style={[
                styles.input,
                !isEmailValid && formData.email ? styles.inputError : null,
                emailExists ? styles.inputError : null,
              ]}
              placeholder={t('auth.email')}
              value={formData.email}
              onChangeText={handleEmailChange}
              onBlur={checkEmailExists}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {!isEmailValid && formData.email ? (
              <Text style={styles.errorText}>{t('auth.invalidEmail')}</Text>
            ) : null}
            {emailExists ? (
              <Text style={styles.errorText}>{t('auth.emailAlreadyExists')}</Text>
            ) : emailChecked && !emailExists && isEmailValid && formData.email ? (
              <Text style={styles.successText}>{t('auth.emailAvailable')}</Text>
            ) : null}
          </View>

          <View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  !showPasswordStrength || passwordStrength >= 2 ? null : styles.inputError,
                ]}
                placeholder={t('auth.password')}
                value={formData.password}
                onChangeText={text => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.gray[500]}
                />
              </TouchableOpacity>
            </View>

            {showPasswordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  {[1, 2, 3, 4, 5].map(index => (
                    <View
                      key={index}
                      style={[
                        styles.passwordStrengthSegment,
                        index <= passwordStrength
                          ? styles.passwordStrengthSegmentActive
                          : styles.passwordStrengthSegmentInactive,
                        {
                          backgroundColor:
                            index <= passwordStrength
                              ? getPasswordStrengthColor(passwordStrength)
                              : COLORS.gray[300],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor(passwordStrength) },
                  ]}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>

                <View style={styles.passwordRequirementsSection}>
                  <Text style={styles.requirementsTitle}>{t('auth.passwordRequirements')}</Text>

                  <View style={styles.passwordRequirements}>
                    <View style={styles.requirementRow}>
                      <View
                        style={[styles.checkmark, hasMinLength ? styles.checkmarkActive : null]}
                      >
                        <Ionicons
                          name={hasMinLength ? 'checkmark' : 'close'}
                          size={12}
                          color={hasMinLength ? COLORS.success : COLORS.danger}
                        />
                      </View>
                      <Text
                        style={[
                          styles.requirementText,
                          hasMinLength ? styles.requirementMet : null,
                        ]}
                      >
                        {t('auth.minLength')}
                      </Text>
                    </View>

                    <View style={styles.requirementRow}>
                      <View
                        style={[styles.checkmark, hasUppercase ? styles.checkmarkActive : null]}
                      >
                        <Ionicons
                          name={hasUppercase ? 'checkmark' : 'close'}
                          size={12}
                          color={hasUppercase ? COLORS.success : COLORS.danger}
                        />
                      </View>
                      <Text
                        style={[
                          styles.requirementText,
                          hasUppercase ? styles.requirementMet : null,
                        ]}
                      >
                        {t('auth.upperCase')}
                      </Text>
                    </View>

                    <View style={styles.requirementRow}>
                      <View
                        style={[styles.checkmark, hasLowercase ? styles.checkmarkActive : null]}
                      >
                        <Ionicons
                          name={hasLowercase ? 'checkmark' : 'close'}
                          size={12}
                          color={hasLowercase ? COLORS.success : COLORS.danger}
                        />
                      </View>
                      <Text
                        style={[
                          styles.requirementText,
                          hasLowercase ? styles.requirementMet : null,
                        ]}
                      >
                        {t('auth.lowerCase')}
                      </Text>
                    </View>

                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasNumber ? styles.checkmarkActive : null]}>
                        <Ionicons
                          name={hasNumber ? 'checkmark' : 'close'}
                          size={12}
                          color={hasNumber ? COLORS.success : COLORS.danger}
                        />
                      </View>
                      <Text
                        style={[styles.requirementText, hasNumber ? styles.requirementMet : null]}
                      >
                        {t('auth.number')}
                      </Text>
                    </View>

                    <View style={styles.requirementRow}>
                      <View
                        style={[styles.checkmark, hasSpecialChar ? styles.checkmarkActive : null]}
                      >
                        <Ionicons
                          name={hasSpecialChar ? 'checkmark' : 'close'}
                          size={12}
                          color={hasSpecialChar ? COLORS.success : COLORS.danger}
                        />
                      </View>
                      <Text
                        style={[
                          styles.requirementText,
                          hasSpecialChar ? styles.requirementMet : null,
                        ]}
                      >
                        {t('auth.specialChar')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  !passwordsMatch && confirmPassword ? styles.inputError : null,
                ]}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.gray[500]}
                />
              </TouchableOpacity>
            </View>
            {!passwordsMatch && confirmPassword ? (
              <Text style={styles.errorText}>{t('auth.passwordsDoNotMatch')}</Text>
            ) : confirmPassword && passwordsMatch ? (
              <Text style={styles.successText}>{t('auth.passwordsMatch')}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
              (!passwordsMatch || emailExists || !isEmailValid || passwordStrength < 2) &&
                styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={
              loading || !passwordsMatch || emailExists || !isEmailValid || passwordStrength < 2
            }
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>{t('auth.register')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>{t('auth.alreadyHaveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkmark: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[200],
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    marginRight: 6,
    width: 16,
  },
  checkmarkActive: {
    backgroundColor: COLORS.success + '20',
  },
  container: {
    backgroundColor: COLORS.gray[100],
    flex: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  eyeButton: {
    padding: 10,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    margin: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  passwordContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  passwordRequirements: {
    marginBottom: 8,
  },
  passwordRequirementsSection: {
    backgroundColor: COLORS.gray[100],
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 3,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 5,
    padding: 10,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
    marginBottom: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthSegment: {
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  passwordStrengthSegmentActive: {
    height: 6,
  },
  passwordStrengthSegmentInactive: {
    height: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  requirementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  requirementText: {
    color: COLORS.gray[600],
    fontSize: 12,
  },
  requirementsTitle: {
    color: COLORS.gray[900],
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  successText: {
    color: COLORS.success,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
});
