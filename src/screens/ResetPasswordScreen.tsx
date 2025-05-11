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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../api/auth';
import { validatePassword } from '../utils/validation';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { token } = route.params;
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    setNewPasswordError(null);
    const strength = validatePassword(text);
    setPasswordStrength(typeof strength === 'number' ? strength : 0);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(null);
  };

  const passwordsMatch = newPassword === confirmPassword;

  const requirements = [
    {
      text: t('auth.passwordRequirements.length'),
      met: newPassword.length >= 8,
    },
    {
      text: t('auth.passwordRequirements.uppercase'),
      met: /[A-Z]/.test(newPassword),
    },
    {
      text: t('auth.passwordRequirements.lowercase'),
      met: /[a-z]/.test(newPassword),
    },
    {
      text: t('auth.passwordRequirements.number'),
      met: /[0-9]/.test(newPassword),
    },
    {
      text: t('auth.passwordRequirements.special'),
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setNewPasswordError(t('auth.passwordRequired'));
      setConfirmPasswordError(t('auth.confirmPasswordRequired'));
      return;
    }

    if (!passwordsMatch) {
      setConfirmPasswordError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (passwordStrength < 2) {
      setNewPasswordError(t('auth.passwordTooWeak'));
      return;
    }

    try {
      setIsLoading(true);
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert(t('common.error'), t('auth.resetPasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    !newPassword || !confirmPassword || !passwordsMatch || passwordStrength < 2 || isLoading;
  const buttonOpacity = isButtonDisabled ? 0.6 : 1;

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      marginTop: 20,
      padding: 16,
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
    eyeIcon: {
      padding: 10,
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
    requirement: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 4,
    },
    requirementMet: {
      color: theme.colors.success,
    },
    requirementUnmet: {
      color: theme.colors.error,
    },
    requirements: {
      marginTop: 12,
    },
    scrollView: {
      flex: 1,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: 16,
    },
    successContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    successMessage: {
      color: theme.colors.text.secondary,
      fontSize: 16,
      marginBottom: 30,
      textAlign: 'center',
    },
    successTitle: {
      color: theme.colors.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
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
        {!isSuccess ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{t('auth.resetPassword')}</Text>
              <Text style={styles.subtitle}>{t('auth.enterNewPassword')}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.newPassword')}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, newPasswordError ? styles.inputError : null]}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    placeholder={t('auth.enterNewPassword')}
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    placeholder={t('auth.confirmNewPassword')}
                    placeholderTextColor={theme.colors.text.secondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              <View style={styles.requirements}>
                <Text style={styles.label}>{t('auth.passwordRequirements')}</Text>
                {requirements.map((req, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.requirement,
                      req.met ? styles.requirementMet : styles.requirementUnmet,
                    ]}
                  >
                    {req.text}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, { opacity: buttonOpacity }]}
                onPress={handleResetPassword}
                disabled={isButtonDisabled}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.saveNewPassword')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
            <Text style={styles.successTitle}>{t('auth.passwordResetSuccess')}</Text>
            <Text style={styles.successMessage}>{t('auth.passwordResetSuccessMessage')}</Text>
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

export default ResetPasswordScreen;
