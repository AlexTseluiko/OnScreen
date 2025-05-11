import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loginSuccess } from '../store/slices/authSlice';
import { apiClient } from '../api/apiClient';
import { UserData, RegisterData } from '../types/user';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { ErrorMessage } from '../components/atoms/ErrorMessage';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import { useTheme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegisterScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const handleRegister = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<UserData>('/auth/register', data);

      dispatch(loginSuccess(response.data));
      navigation.navigate('Home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <RegisterForm onSubmit={handleRegister} error={error || undefined} isLoading={isLoading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
