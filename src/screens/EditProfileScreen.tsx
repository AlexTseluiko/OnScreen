import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { User } from '../types/user';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Импортируем компоненты из нашей системы атомарного дизайна
import { Text } from '../components/ui/atoms/Text';
import { Button } from '../components/ui/atoms/Button';
import { Input } from '../components/ui/atoms/Input';
import { Avatar } from '../components/ui/atoms/Avatar';
import { Card } from '../components/ui/molecules/Card';
import { Icon } from '../components/ui/atoms/Icon';

type EditProfileScreenProps = StackScreenProps<RootStackParamList, 'EditProfile'>;

// Регулярные выражения для валидации
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ route }) => {
  const { user, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatar);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthDate, setBirthDate] = useState<Date>(
    user?.birthDate ? new Date(user.birthDate) : new Date()
  );
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || 'male');

  // Состояние для DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Состояние валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Запрос разрешений для доступа к галерее
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Требуется разрешение',
            'Нам необходим доступ к вашей галерее для установки фото профиля.'
          );
        }
      }
    })();
  }, []);

  // Функция выбора изображения аватара из галереи
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Отказано в доступе',
          'Пожалуйста, разрешите доступ к галерее для выбора фото.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Ошибка при выборе изображения:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить изображение');
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна для заполнения';
    }

    if (!email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения даты
  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Форматирование даты для отображения
  const formattedDate = format(birthDate, 'dd MMMM yyyy');

  // Сохранение изменений
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // В реальном приложении здесь должна быть загрузка аватара на сервер
      // и получение URL загруженного изображения
      const updatedUser: Partial<User> = {
        firstName,
        lastName,
        phone,
        email,
        birthDate: birthDate.toISOString(),
        address,
        gender,
        avatar: avatarUri,
      };

      // Вызов API для обновления данных пользователя
      // Это заглушка, в реальном приложении будет настоящий API вызов
      setTimeout(() => {
        if (updateUserProfile) {
          updateUserProfile(updatedUser);
        } else {
          console.log('Обновление профиля:', updatedUser);
        }

        setLoading(false);

        // Возвращаемся на экран профиля
        navigation.goBack();
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Ошибка при сохранении профиля:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="large"
              name={`${firstName} ${lastName}`}
              source={avatarUri ? { uri: avatarUri } : undefined}
            />
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary }]}
              onPress={pickImage}
            >
              <Icon name="camera" family="ionicons" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Личная информация</Text>

            <Input
              label="Имя"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Введите имя"
              containerStyle={styles.inputContainer}
              autoCapitalize="words"
            />

            <Input
              label="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Введите фамилию"
              containerStyle={styles.inputContainer}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Введите email"
              containerStyle={styles.inputContainer}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Email обычно не редактируется
            />

            <Input
              label="Телефон"
              value={phone}
              onChangeText={setPhone}
              placeholder="Введите номер телефона"
              containerStyle={styles.inputContainer}
              keyboardType="phone-pad"
            />

            <Input
              label="Дата рождения"
              value={formattedDate}
              onChangeText={() => setShowDatePicker(true)}
              placeholder="ДД.ММ.ГГГГ"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Пол"
              value={gender === 'male' ? 'Мужской' : gender === 'female' ? 'Женский' : 'Другой'}
              onChangeText={() => {}} // Этот input используется только для отображения
              placeholder="Мужской/Женский"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Адрес"
              value={address}
              onChangeText={setAddress}
              placeholder="Введите адрес"
              containerStyle={styles.inputContainer}
              multiline
              numberOfLines={2}
            />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Button
              title="Сохранить изменения"
              onPress={handleSaveProfile}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
  },
  buttonContainer: {
    marginBottom: 30,
    marginHorizontal: 16,
    marginTop: 20,
  },
  container: {
    flex: 1,
  },
  editAvatarButton: {
    alignItems: 'center',
    borderRadius: 15,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: '35%',
    width: 30,
  },
  formContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default EditProfileScreen;
