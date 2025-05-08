import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { getToken, syncTokens, storeToken } from '../utils/tokenStorage';
import { apiClient } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

type ChangePasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const { theme } = useTheme();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Валидация полей
  const validateInputs = () => {
    if (!currentPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, введите текущий пароль');
      return false;
    }
    
    if (!newPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, введите новый пароль');
      return false;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Ошибка', 'Новый пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return false;
    }
    
    if (currentPassword === newPassword) {
      Alert.alert('Ошибка', 'Новый пароль должен отличаться от текущего');
      return false;
    }
    
    return true;
  };
  
  // Отправка запроса на смену пароля
  const handleChangePassword = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      // Проверим все токены в AsyncStorage
      console.log('Проверка всех токенов в хранилище:');
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('Все ключи в AsyncStorage:', allKeys);
      
      // Выведем значения всех токенов
      for (const key of allKeys) {
        if (key.toLowerCase().includes('token')) {
          const value = await AsyncStorage.getItem(key);
          console.log(`Ключ ${key}:`, value ? `${value.substring(0, 10)}...` : 'отсутствует');
        }
      }
      
      // Синхронизируем токены перед запросом
      await syncTokens();
      const token = await getToken();
      
      console.log('Токен для запроса смены пароля:', token ? `${token.substring(0, 10)}...` : 'отсутствует');
      
      if (!token) {
        Alert.alert('Ошибка авторизации', 'Пожалуйста, войдите в систему заново');
        navigation.navigate('Login');
        return;
      }
      
      // Сначала проверим валидность токена
      console.log('Проверяем валидность токена...');
      try {
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Статус проверки токена:', verifyResponse.status);
        
        if (verifyResponse.status === 401) {
          console.error('Токен невалидный, нужно заново авторизоваться');
          Alert.alert('Ошибка авторизации', 'Ваша сессия истекла. Пожалуйста, войдите в систему заново.');
          navigation.navigate('Login');
          return;
        }
      } catch (verifyError) {
        console.error('Ошибка при проверке токена:', verifyError);
      }
      
      // Проверим, какие маршруты доступны на сервере
      console.log('Проверяем доступные маршруты...');
      
      // Массив потенциальных маршрутов для смены пароля
      const possibleRoutes = [
        '/auth/change-password',
        '/users/change-password',
        '/profile/change-password',
        '/change-password'
      ];
      
      // Используем первый рабочий маршрут
      let workingRoute = null;
      let responseData = null;
      
      for (const route of possibleRoutes) {
        try {
          console.log(`Пробуем маршрут: ${route}`);
          const response = await fetch(`${API_BASE_URL}${route}`, {
            method: 'OPTIONS',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log(`Маршрут ${route} статус:`, response.status);
          
          if (response.status !== 404) {
            workingRoute = route;
            console.log(`Найден рабочий маршрут: ${route}`);
            break;
          }
        } catch (routeError) {
          console.error(`Ошибка при проверке маршрута ${route}:`, routeError);
        }
      }
      
      if (!workingRoute) {
        console.warn('Не удалось найти рабочий маршрут для смены пароля');
        workingRoute = '/auth/change-password'; // Используем маршрут по умолчанию
      }
      
      console.log(`Отправляем запрос на ${workingRoute}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}${workingRoute}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        });
        
        console.log('Ответ fetch API:', response.status);
        
        const responseText = await response.text();
        console.log('Текст ответа:', responseText);
        
        try {
          responseData = JSON.parse(responseText);
          console.log('Данные ответа:', responseData);
        } catch (parseError) {
          console.error('Ошибка парсинга ответа:', parseError);
        }
        
        if (response.ok) {
          Alert.alert('Успех', 'Пароль успешно изменен', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        } else {
          let errorMessage = 'Не удалось изменить пароль';
          if (responseData?.error) {
            errorMessage = responseData.error;
          } else if (responseData?.message) {
            errorMessage = responseData.message;
          }
          Alert.alert('Ошибка', errorMessage);
        }
      } catch (fetchError) {
        console.error('Ошибка при использовании fetch API:', fetchError);
        Alert.alert('Ошибка', 'Не удалось отправить запрос. Проверьте подключение к сети.');
      }
    } catch (error: any) {
      console.error('Ошибка при смене пароля:', error);
      Alert.alert('Ошибка', 'Произошла неожиданная ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Изменение пароля
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Для смены пароля введите текущий пароль и новый пароль
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Текущий пароль
          </Text>
          <View style={[
            styles.inputWrapper, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Введите текущий пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.visibilityButton}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Новый пароль
          </Text>
          <View style={[
            styles.inputWrapper, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Введите новый пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.visibilityButton}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.passwordHint, { color: theme.colors.textSecondary }]}>
            Пароль должен содержать минимум 6 символов
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Подтвердите новый пароль
          </Text>
          <View style={[
            styles.inputWrapper, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Повторите новый пароль"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.visibilityButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.changeButton,
            { opacity: loading ? 0.7 : 1 }
          ]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.changeButtonText}>Изменить пароль</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        
        {/* Отладочные кнопки - видны только в режиме разработки */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Отладка (только для разработки)</Text>
            
            <TouchableOpacity
              style={styles.debugButton}
              onPress={async () => {
                try {
                  // Обновляем этот токен на актуальный при каждом отключении приложения
                  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MGUzNGNhMjA1NTZmMWE1YmVkZGM4OSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDk0MDcwNzUsImV4cCI6MTcxMDAxMTg3NX0.NQnFD1zEzX1m8vwuNPBsCxwfKGQjdDZ-2BW1-JLLZMA';
                  
                  await AsyncStorage.setItem('token', testToken);
                  await AsyncStorage.setItem('auth_token', testToken);
                  
                  console.log('Тестовый токен сохранен');
                  Alert.alert('Токен восстановлен', 'Тестовый токен авторизации восстановлен');
                } catch (error) {
                  console.error('Ошибка при сохранении тестового токена:', error);
                  Alert.alert('Ошибка', 'Не удалось сохранить тестовый токен');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Восстановить тестовый токен</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.debugButton}
              onPress={async () => {
                try {
                  const token = await getToken();
                  if (!token) {
                    Alert.alert('Ошибка', 'Токен отсутствует');
                    return;
                  }
                  
                  console.log('Проверяем токен...');
                  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  console.log('Статус проверки токена:', response.status);
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('Данные пользователя:', data);
                    Alert.alert('Токен валиден', `Пользователь: ${data.user?.email || 'нет данных'}`);
                  } else {
                    Alert.alert('Токен невалиден', `Статус: ${response.status}`);
                  }
                } catch (error) {
                  console.error('Ошибка при проверке токена:', error);
                  Alert.alert('Ошибка', 'Не удалось проверить токен');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Проверить токен</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.debugButton}
              onPress={async () => {
                try {
                  console.log('Проверяем маршруты API...');
                  const routes = [
                    '/auth/verify',
                    '/auth/change-password',
                    '/users/change-password',
                    '/profile/change-password',
                    '/change-password'
                  ];
                  
                  const results = [];
                  
                  for (const route of routes) {
                    try {
                      const response = await fetch(`${API_BASE_URL}${route}`, {
                        method: 'OPTIONS'
                      });
                      
                      results.push(`${route}: ${response.status}`);
                    } catch (error) {
                      results.push(`${route}: ошибка`);
                    }
                  }
                  
                  console.log('Результаты проверки маршрутов:', results);
                  Alert.alert('Маршруты API', results.join('\n'));
                } catch (error) {
                  console.error('Ошибка при проверке маршрутов:', error);
                  Alert.alert('Ошибка', 'Не удалось проверить маршруты');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Проверить маршруты API</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.debugButton, {backgroundColor: '#4CAF50'}]}
              onPress={async () => {
                try {
                  // Пароль для тестирования
                  const testPassword = 'testpassword123';
                  
                  const token = await getToken();
                  if (!token) {
                    Alert.alert('Ошибка', 'Токен отсутствует');
                    return;
                  }
                  
                  // Пробуем напрямую с пользовательским API
                  console.log('Пробуем сменить пароль через пользовательский API...');
                  
                  const response = await fetch(`${API_BASE_URL}/users/password`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      oldPassword: currentPassword || testPassword,
                      newPassword: newPassword || 'NewPass123!'
                    })
                  });
                  
                  console.log('Статус ответа:', response.status);
                  
                  const responseText = await response.text();
                  console.log('Текст ответа:', responseText);
                  
                  try {
                    const responseData = JSON.parse(responseText);
                    console.log('Данные ответа:', responseData);
                    
                    if (response.ok) {
                      Alert.alert('Успех', 'Пароль успешно изменен');
                    } else {
                      Alert.alert('Ошибка', responseData.message || 'Не удалось изменить пароль');
                    }
                  } catch (parseError) {
                    console.error('Ошибка парсинга ответа:', parseError);
                    
                    if (response.ok) {
                      Alert.alert('Успех', 'Пароль успешно изменен');
                    } else {
                      Alert.alert('Ошибка', 'Не удалось изменить пароль');
                    }
                  }
                } catch (error) {
                  console.error('Ошибка при тестовой смене пароля:', error);
                  Alert.alert('Ошибка', 'Не удалось выполнить тестовую смену пароля');
                }
              }}
            >
              <Text style={styles.debugButtonText}>Тестовая смена пароля</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  visibilityButton: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 5,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  debugContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF5722',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FF5722',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen; 