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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  
  // Требования к паролю
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  
  const navigation = useNavigation<NavigationProp>();
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
    if (password) {
      // Проверяем требования к паролю
      setHasMinLength(password.length >= 8);
      setHasUppercase(/[A-Z]/.test(password));
      setHasLowercase(/[a-z]/.test(password));
      setHasNumber(/[0-9]/.test(password));
      setHasSpecialChar(/[^A-Za-z0-9]/.test(password));
      
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
      setHasMinLength(false);
      setHasUppercase(false);
      setHasLowercase(false);
      setHasNumber(false);
      setHasSpecialChar(false);
    }
    
    // Проверка на совпадение паролей при любом изменении
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true); // Если поле пустое, не показываем ошибку
    }
  }, [password, confirmPassword]);

  // Проверка совпадения паролей при изменении подтверждения
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [confirmPassword, password]);

  // Проверка валидности email при изменении
  useEffect(() => {
    if (email) {
      setIsEmailValid(validateEmail(email));
      setEmailExists(false); // Сбрасываем проверку на существование email
      setEmailChecked(false);
    } else {
      setIsEmailValid(true);
    }
  }, [email]);

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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Проверка, существует ли email
  const checkEmailExists = async () => {
    if (!email || !validateEmail(email)) return;
    
    try {
      // Здесь должен быть запрос к API для проверки email
      const exists = await authApi.checkEmailExists(email).catch(() => false);
      setEmailExists(exists);
      setEmailChecked(true);
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailExists(false);
    }
  };

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

  const handleRegister = async () => {
    if (loading) return;
    
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to register with:', { name, email, password: '******' });
      
      const userData = { name, email, password };
      console.log('Sending registration data to server:', JSON.stringify({...userData, password: '******'}));
      
      const response = await authApi.register(userData);
      console.log('Registration successful:', JSON.stringify(response));
      
      // Показываем короткое уведомление об успехе
      showToast(t('auth.registrationSuccess'));
      
      // Небольшая задержка перед навигацией (для всех платформ)
      timerRef.current = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, Platform.OS === 'ios' ? 800 : 300);
      
    } catch (error: any) {
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
      } else if (error.message) {
        console.log('Error message:', error.message);
        
        if (error.message.includes('already exists') || error.message.includes('уже существует')) {
          errorMessage = t('auth.emailAlreadyExists');
          setEmailExists(true);
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        t('common.error'),
        errorMessage,
        [{ text: 'OK' }],
        { cancelable: false }
      );
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
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          <View>
            <TextInput
              style={[
                styles.input, 
                !isEmailValid && email ? styles.inputError : null,
                emailExists ? styles.inputError : null
              ]}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              onBlur={checkEmailExists}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {!isEmailValid && email ? (
              <Text style={styles.errorText}>
                {t('auth.invalidEmail')}
              </Text>
            ) : null}
            {emailExists ? (
              <Text style={styles.errorText}>
                {t('auth.emailAlreadyExists')}
              </Text>
            ) : emailChecked && !emailExists && isEmailValid && email ? (
              <Text style={styles.successText}>
                {t('auth.emailAvailable')}
              </Text>
            ) : null}
          </View>

          <View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, !showPasswordStrength || passwordStrength >= 2 ? null : styles.inputError]}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={setPassword}
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
                  color="#999" 
                />
              </TouchableOpacity>
            </View>

            {showPasswordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.passwordStrengthSegment,
                        {
                          backgroundColor:
                            index <= passwordStrength
                              ? getPasswordStrengthColor(passwordStrength)
                              : '#DDDDDD',
                          height: index <= passwordStrength ? 6 : 4,
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
                  <Text style={styles.requirementsTitle}>
                    {t('auth.passwordRequirements')}
                  </Text>
                  
                  <View style={styles.passwordRequirements}>
                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasMinLength ? styles.checkmarkActive : null]}>
                        <Ionicons 
                          name={hasMinLength ? "checkmark" : "close"} 
                          size={12} 
                          color={hasMinLength ? "#34C759" : "#FF3B30"} 
                        />
                      </View>
                      <Text style={[
                        styles.requirementText, 
                        hasMinLength ? styles.requirementMet : null
                      ]}>
                        {t('auth.minLength')}
                      </Text>
                    </View>
                    
                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasUppercase ? styles.checkmarkActive : null]}>
                        <Ionicons 
                          name={hasUppercase ? "checkmark" : "close"} 
                          size={12} 
                          color={hasUppercase ? "#34C759" : "#FF3B30"} 
                        />
                      </View>
                      <Text style={[
                        styles.requirementText,
                        hasUppercase ? styles.requirementMet : null
                      ]}>
                        {t('auth.upperCase')}
                      </Text>
                    </View>
                    
                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasLowercase ? styles.checkmarkActive : null]}>
                        <Ionicons 
                          name={hasLowercase ? "checkmark" : "close"} 
                          size={12} 
                          color={hasLowercase ? "#34C759" : "#FF3B30"} 
                        />
                      </View>
                      <Text style={[
                        styles.requirementText,
                        hasLowercase ? styles.requirementMet : null
                      ]}>
                        {t('auth.lowerCase')}
                      </Text>
                    </View>
                    
                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasNumber ? styles.checkmarkActive : null]}>
                        <Ionicons 
                          name={hasNumber ? "checkmark" : "close"} 
                          size={12} 
                          color={hasNumber ? "#34C759" : "#FF3B30"} 
                        />
                      </View>
                      <Text style={[
                        styles.requirementText,
                        hasNumber ? styles.requirementMet : null
                      ]}>
                        {t('auth.number')}
                      </Text>
                    </View>
                    
                    <View style={styles.requirementRow}>
                      <View style={[styles.checkmark, hasSpecialChar ? styles.checkmarkActive : null]}>
                        <Ionicons 
                          name={hasSpecialChar ? "checkmark" : "close"} 
                          size={12} 
                          color={hasSpecialChar ? "#34C759" : "#FF3B30"} 
                        />
                      </View>
                      <Text style={[
                        styles.requirementText,
                        hasSpecialChar ? styles.requirementMet : null
                      ]}>
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
                  !passwordsMatch && confirmPassword ? styles.inputError : null
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
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            {!passwordsMatch && confirmPassword ? (
              <Text style={styles.errorText}>
                {t('auth.passwordsDoNotMatch')}
              </Text>
            ) : confirmPassword && passwordsMatch ? (
              <Text style={styles.successText}>
                {t('auth.passwordsMatch')}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button, 
              loading && styles.buttonDisabled,
              (!passwordsMatch || emailExists || !isEmailValid || passwordStrength < 2) && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={loading || !passwordsMatch || emailExists || !isEmailValid || passwordStrength < 2}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.register')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              {t('auth.alreadyHaveAccount')}
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
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 4,
    gap: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  successText: {
    color: '#34C759',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  passwordRequirements: {
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkmarkActive: {
    backgroundColor: '#D4F5DE',
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
  },
  requirementMet: {
    fontWeight: 'bold',
    color: '#34C759',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  passwordRequirementsSection: {
    marginTop: 5,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
}); 