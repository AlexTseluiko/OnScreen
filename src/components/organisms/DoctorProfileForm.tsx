import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
} from 'react-native';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Divider } from '../atoms/Divider';
import { Avatar } from '../atoms/Avatar';

// Интерфейс для рабочих часов
interface WorkingHours {
  start: string;
  end: string;
  isWorking: boolean;
}

// Интерфейс для данных формы доктора
interface DoctorFormData {
  specialization: string;
  education: string;
  experience: string;
  languages: string[];
  certifications: string[];
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  consultationFee: string;
  bio: string;
  acceptingNewPatients: boolean;
  telemedicineAvailable: boolean;
  clinicAddress: string;
  profilePhoto: string | null;
}

interface DoctorProfileFormProps {
  initialData?: Partial<DoctorFormData>;
  onSave?: (data: DoctorFormData) => void;
  onCancel?: () => void;
  isEditable?: boolean;
}

export const DoctorProfileForm: React.FC<DoctorProfileFormProps> = ({
  initialData = {},
  onSave,
  onCancel,
  isEditable = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Инициализируем данные формы
  const [formData, setFormData] = useState<DoctorFormData>({
    specialization: '',
    education: '',
    experience: '',
    languages: [''],
    certifications: [''],
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '14:00', isWorking: false },
      sunday: { start: '00:00', end: '00:00', isWorking: false },
    },
    consultationFee: '',
    bio: '',
    acceptingNewPatients: true,
    telemedicineAvailable: true,
    clinicAddress: '',
    profilePhoto: null,
  });

  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Обновляем форму данными, которые были переданы
      setFormData(prev => ({
        ...prev,
        ...initialData,
        languages: initialData.languages || [''],
        certifications: initialData.certifications || [''],
        workingHours: initialData.workingHours || prev.workingHours,
      }));
    }
  }, [initialData]);

  // Обработчики для полей формы
  const handleChange = (
    field: keyof DoctorFormData,
    value: DoctorFormData[keyof DoctorFormData]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkingHourChange = (
    day: keyof DoctorFormData['workingHours'],
    field: keyof WorkingHours,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLanguageChange = (index: number, value: string) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = value;
    setFormData(prev => ({
      ...prev,
      languages: updatedLanguages,
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, ''],
    }));
  };

  const removeLanguage = (index: number) => {
    if (formData.languages.length > 1) {
      const updatedLanguages = [...formData.languages];
      updatedLanguages.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        languages: updatedLanguages,
      }));
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: updatedCertifications,
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ''],
    }));
  };

  const removeCertification = (index: number) => {
    if (formData.certifications.length > 1) {
      const updatedCertifications = [...formData.certifications];
      updatedCertifications.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        certifications: updatedCertifications,
      }));
    }
  };

  // Выбор изображения для профиля
  const pickImage = async () => {
    if (!isEditable) return;

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          t('common.error'),
          t('profile.permissions.photos', 'Необходимо разрешение на доступ к фото')
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
        setFormData(prev => ({
          ...prev,
          profilePhoto: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Ошибка при выборе изображения:', error);
      Alert.alert(
        t('common.error', 'Ошибка'),
        t('profile.error.imageSelection', 'Не удалось выбрать изображение')
      );
    }
  };

  // Отправка формы
  const handleSubmit = async () => {
    if (!isEditable) return;

    try {
      setSavingProfile(true);

      // Здесь должен быть вызов API для сохранения данных
      if (onSave) {
        onSave(formData);
      }

      Alert.alert(
        t('common.success', 'Успех'),
        t('profile.doctor.saveSuccess', 'Профиль успешно сохранен')
      );
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      Alert.alert(
        t('common.error', 'Ошибка'),
        t('profile.doctor.saveError', 'Не удалось сохранить профиль')
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const renderDay = (day: keyof DoctorFormData['workingHours'], dayName: string) => {
    const dayData = formData.workingHours[day];

    return (
      <View key={day} style={styles.workingDayRow}>
        <View style={styles.workingDayNameContainer}>
          <Text variant="body" style={styles.dayName}>
            {dayName}
          </Text>
          <Switch
            value={dayData.isWorking}
            onValueChange={value => handleWorkingHourChange(day, 'isWorking', value)}
            disabled={!isEditable}
            trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.hoursContainer}>
          <Input
            value={dayData.start}
            onChangeText={value => handleWorkingHourChange(day, 'start', value)}
            style={styles.timeInput}
            placeholder="00:00"
            editable={isEditable && dayData.isWorking}
          />
          <Text variant="body" style={styles.timeSeparator}>
            -
          </Text>
          <Input
            value={dayData.end}
            onChangeText={value => handleWorkingHourChange(day, 'end', value)}
            style={styles.timeInput}
            placeholder="00:00"
            editable={isEditable && dayData.isWorking}
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        {/* Фото профиля */}
        <View style={styles.profilePhotoContainer}>
          {formData.profilePhoto ? (
            <TouchableOpacity onPress={pickImage} disabled={!isEditable}>
              <Image source={{ uri: formData.profilePhoto }} style={styles.profilePhoto} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={pickImage} disabled={!isEditable}>
              <Avatar size={120} initials={formData.specialization.charAt(0)} />
              {isEditable && (
                <View style={styles.photoOverlay}>
                  <Ionicons name="camera" size={24} color={theme.colors.text.inverse} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Основная информация */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.basicInfo', 'Основная информация')}
          </Text>

          <Input
            label={t('profile.doctor.specialization', 'Специализация')}
            value={formData.specialization}
            onChangeText={value => handleChange('specialization', value)}
            style={styles.input}
            editable={isEditable}
          />

          <Input
            label={t('profile.doctor.experience', 'Опыт работы (лет)')}
            value={formData.experience}
            onChangeText={value => handleChange('experience', value)}
            style={styles.input}
            keyboardType="numeric"
            editable={isEditable}
          />

          <Input
            label={t('profile.doctor.consultation', 'Стоимость консультации')}
            value={formData.consultationFee}
            onChangeText={value => handleChange('consultationFee', value)}
            style={styles.input}
            keyboardType="numeric"
            editable={isEditable}
          />

          <Input
            label={t('profile.doctor.clinic', 'Адрес клиники')}
            value={formData.clinicAddress}
            onChangeText={value => handleChange('clinicAddress', value)}
            style={styles.input}
            editable={isEditable}
          />

          <View style={styles.switchContainer}>
            <Text variant="body">{t('profile.doctor.accepting', 'Принимает новых пациентов')}</Text>
            <Switch
              value={formData.acceptingNewPatients}
              onValueChange={value => handleChange('acceptingNewPatients', value)}
              disabled={!isEditable}
              trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text variant="body">{t('profile.doctor.telemedicine', 'Доступна телемедицина')}</Text>
            <Switch
              value={formData.telemedicineAvailable}
              onValueChange={value => handleChange('telemedicineAvailable', value)}
              disabled={!isEditable}
              trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </Card>

        {/* Образование */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.education', 'Образование')}
          </Text>
          <Input
            label={t('profile.doctor.education', 'Образование и квалификация')}
            value={formData.education}
            onChangeText={value => handleChange('education', value)}
            style={styles.textArea}
            multiline
            numberOfLines={4}
            editable={isEditable}
          />
        </Card>

        {/* Языки */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.languages', 'Языки')}
          </Text>

          {formData.languages.map((language, index) => (
            <View key={`lang-${index}`} style={styles.itemRow}>
              <Input
                placeholder={t('profile.doctor.languagePlaceholder', 'Например: Русский')}
                value={language}
                onChangeText={value => handleLanguageChange(index, value)}
                style={styles.itemInput}
                editable={isEditable}
              />
              {isEditable && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeLanguage(index)}
                  disabled={formData.languages.length <= 1}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={
                      formData.languages.length <= 1
                        ? theme.colors.text.secondary
                        : theme.colors.danger
                    }
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditable && (
            <Button
              title={t('common.add', 'Добавить')}
              onPress={addLanguage}
              variant="outline"
              style={styles.addButton}
            />
          )}
        </Card>

        {/* Сертификаты */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.certifications', 'Сертификаты')}
          </Text>

          {formData.certifications.map((certification, index) => (
            <View key={`cert-${index}`} style={styles.itemRow}>
              <Input
                placeholder={t(
                  'profile.doctor.certificationPlaceholder',
                  'Сертификат или лицензия'
                )}
                value={certification}
                onChangeText={value => handleCertificationChange(index, value)}
                style={styles.itemInput}
                editable={isEditable}
              />
              {isEditable && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCertification(index)}
                  disabled={formData.certifications.length <= 1}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={
                      formData.certifications.length <= 1
                        ? theme.colors.text.secondary
                        : theme.colors.danger
                    }
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditable && (
            <Button
              title={t('common.add', 'Добавить')}
              onPress={addCertification}
              variant="outline"
              style={styles.addButton}
            />
          )}
        </Card>

        {/* График работы */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.schedule', 'График работы')}
          </Text>

          {renderDay('monday', t('days.monday', 'Понедельник'))}
          <Divider style={styles.divider} />
          {renderDay('tuesday', t('days.tuesday', 'Вторник'))}
          <Divider style={styles.divider} />
          {renderDay('wednesday', t('days.wednesday', 'Среда'))}
          <Divider style={styles.divider} />
          {renderDay('thursday', t('days.thursday', 'Четверг'))}
          <Divider style={styles.divider} />
          {renderDay('friday', t('days.friday', 'Пятница'))}
          <Divider style={styles.divider} />
          {renderDay('saturday', t('days.saturday', 'Суббота'))}
          <Divider style={styles.divider} />
          {renderDay('sunday', t('days.sunday', 'Воскресенье'))}
        </Card>

        {/* Биография */}
        <Card style={styles.section}>
          <Text variant="title" style={styles.sectionTitle}>
            {t('profile.doctor.bio', 'О себе')}
          </Text>
          <Input
            label={t('profile.doctor.bioDescription', 'Расскажите о своем подходе и опыте')}
            value={formData.bio}
            onChangeText={value => handleChange('bio', value)}
            style={styles.textArea}
            multiline
            numberOfLines={6}
            editable={isEditable}
          />
        </Card>

        {/* Кнопки действий */}
        {isEditable && (
          <View style={styles.buttonContainer}>
            {onCancel && (
              <Button
                title={t('common.cancel', 'Отмена')}
                onPress={onCancel}
                variant="outline"
                style={styles.button}
              />
            )}
            <Button
              title={t('common.save', 'Сохранить')}
              onPress={handleSubmit}
              variant="primary"
              isLoading={savingProfile}
              style={[styles.button, styles.saveButton]}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  container: {
    flex: 1,
  },
  dayName: {
    flex: 1,
  },
  divider: {
    marginVertical: 10,
  },
  hoursContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
  },
  itemInput: {
    flex: 1,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    bottom: 0,
    height: 120,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 120,
  },
  profilePhoto: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  removeButton: {
    marginLeft: 10,
  },
  saveButton: {
    marginLeft: 10,
  },
  section: {
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 10,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeInput: {
    textAlign: 'center',
    width: 70,
  },
  timeSeparator: {
    marginHorizontal: 5,
  },
  workingDayNameContainer: {
    alignItems: 'center',
    flex: 1.5,
    flexDirection: 'row',
  },
  workingDayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
});
