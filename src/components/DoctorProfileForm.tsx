import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

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

export const DoctorProfileForm = ({
  initialData = {},
  onSave,
  onCancel,
  isEditable = true,
}: DoctorProfileFormProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Проверяем наличие темного режима
  const isDarkMode = theme.colors.background === '#121212';

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

  const [loading, setLoading] = useState(false);
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
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkingHourChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {t('common.loading', 'Загрузка...')}
        </Text>
      </View>
    );
  }

  // Массив дней недели для отображения рабочих часов
  const days = [
    { key: 'monday', label: t('days.monday', 'Понедельник') },
    { key: 'tuesday', label: t('days.tuesday', 'Вторник') },
    { key: 'wednesday', label: t('days.wednesday', 'Среда') },
    { key: 'thursday', label: t('days.thursday', 'Четверг') },
    { key: 'friday', label: t('days.friday', 'Пятница') },
    { key: 'saturday', label: t('days.saturday', 'Суббота') },
    { key: 'sunday', label: t('days.sunday', 'Воскресенье') },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Фото профиля */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={[styles.photoContainer, { borderColor: theme.colors.border }]}
            onPress={pickImage}
            disabled={!isEditable}
          >
            {formData.profilePhoto ? (
              <Image source={{ uri: formData.profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.border }]}>
                <Ionicons name="person" size={60} color={theme.colors.text} />
              </View>
            )}
            {isEditable && (
              <View style={styles.editPhotoButton}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.photoTextContainer}>
            <Text style={[styles.photoTitle, { color: theme.colors.text }]}>
              {t('profile.doctor.profilePhoto', 'Фото профиля')}
            </Text>
            <Text style={[styles.photoSubtitle, { color: theme.colors.text }]}>
              {t('profile.doctor.photoHelp', 'Загрузите профессиональное фото')}
            </Text>
          </View>
        </View>

        {/* Основная информация */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.basicInfo', 'Основная информация')}
          </Text>

          <View style={styles.formRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('profile.doctor.specialization', 'Специализация')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.specialization}
              onChangeText={value => handleChange('specialization', value)}
              placeholder={t('profile.doctor.specializationPlaceholder', 'Например: Кардиолог')}
              placeholderTextColor={theme.colors.text + '80'}
              editable={isEditable}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('profile.doctor.bio', 'О себе')}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              multiline
              numberOfLines={5}
              value={formData.bio}
              onChangeText={value => handleChange('bio', value)}
              placeholder={t(
                'profile.doctor.bioPlaceholder',
                'Краткая информация о себе и своем опыте...'
              )}
              placeholderTextColor={theme.colors.text + '80'}
              editable={isEditable}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('profile.doctor.education', 'Образование')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.education}
              onChangeText={value => handleChange('education', value)}
              placeholder={t('profile.doctor.educationPlaceholder', 'Ваше образование')}
              placeholderTextColor={theme.colors.text + '80'}
              editable={isEditable}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('profile.doctor.experience', 'Опыт работы (лет)')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.experience}
              onChangeText={value => handleChange('experience', value)}
              placeholder={t('profile.doctor.experiencePlaceholder', 'Например: 10')}
              placeholderTextColor={theme.colors.text + '80'}
              keyboardType="number-pad"
              editable={isEditable}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('profile.doctor.consultationFee', 'Стоимость консультации')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={formData.consultationFee}
              onChangeText={value => handleChange('consultationFee', value)}
              placeholder={t('profile.doctor.consultationFeePlaceholder', 'Например: 2000')}
              placeholderTextColor={theme.colors.text + '80'}
              keyboardType="number-pad"
              editable={isEditable}
            />
          </View>
        </View>

        {/* Языки */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.languages', 'Языки')}
          </Text>

          {formData.languages.map((language, index) => (
            <View key={`lang-${index}`} style={styles.dynamicInputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.dynamicInput,
                  {
                    backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={language}
                onChangeText={value => handleLanguageChange(index, value)}
                placeholder={t('profile.doctor.languagePlaceholder', 'Язык')}
                placeholderTextColor={theme.colors.text + '80'}
                editable={isEditable}
              />
              {isEditable && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => removeLanguage(index)}
                  disabled={formData.languages.length <= 1}
                >
                  <Ionicons name="remove" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditable && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.primary }]}
              onPress={addLanguage}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                {t('profile.doctor.addLanguage', 'Добавить язык')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Сертификаты */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.certifications', 'Сертификаты')}
          </Text>

          {formData.certifications.map((certification, index) => (
            <View key={`cert-${index}`} style={styles.dynamicInputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.dynamicInput,
                  {
                    backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={certification}
                onChangeText={value => handleCertificationChange(index, value)}
                placeholder={t('profile.doctor.certificationPlaceholder', 'Название сертификата')}
                placeholderTextColor={theme.colors.text + '80'}
                editable={isEditable}
              />
              {isEditable && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => removeCertification(index)}
                  disabled={formData.certifications.length <= 1}
                >
                  <Ionicons name="remove" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditable && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.primary }]}
              onPress={addCertification}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                {t('profile.doctor.addCertification', 'Добавить сертификат')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Рабочие часы */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.workingHours', 'Часы работы')}
          </Text>

          {days.map(day => (
            <View key={day.key} style={styles.workingHoursRow}>
              <View style={styles.dayToggleContainer}>
                <Text style={[styles.dayName, { color: theme.colors.text }]}>{day.label}</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: formData.workingHours[
                        day.key as keyof typeof formData.workingHours
                      ].isWorking
                        ? theme.colors.primary
                        : isDarkMode
                          ? '#555'
                          : '#e0e0e0',
                    },
                  ]}
                  onPress={() =>
                    handleWorkingHourChange(
                      day.key as string,
                      'isWorking',
                      !formData.workingHours[day.key as keyof typeof formData.workingHours]
                        .isWorking
                    )
                  }
                  disabled={!isEditable}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      {
                        transform: [
                          {
                            translateX: formData.workingHours[
                              day.key as keyof typeof formData.workingHours
                            ].isWorking
                              ? 18
                              : 0,
                          },
                        ],
                        backgroundColor: 'white',
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {formData.workingHours[day.key as keyof typeof formData.workingHours].isWorking && (
                <View style={styles.hoursContainer}>
                  <View style={styles.timeInputContainer}>
                    <Text style={[styles.timeLabel, { color: theme.colors.text }]}>
                      {t('profile.doctor.start', 'Начало')}
                    </Text>
                    <TextInput
                      style={[
                        styles.timeInput,
                        {
                          backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={
                        formData.workingHours[day.key as keyof typeof formData.workingHours].start
                      }
                      onChangeText={value => handleWorkingHourChange(day.key, 'start', value)}
                      placeholder="09:00"
                      placeholderTextColor={theme.colors.text + '80'}
                      editable={isEditable}
                    />
                  </View>

                  <Text style={[styles.timeSeparator, { color: theme.colors.text }]}>—</Text>

                  <View style={styles.timeInputContainer}>
                    <Text style={[styles.timeLabel, { color: theme.colors.text }]}>
                      {t('profile.doctor.end', 'Конец')}
                    </Text>
                    <TextInput
                      style={[
                        styles.timeInput,
                        {
                          backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={
                        formData.workingHours[day.key as keyof typeof formData.workingHours].end
                      }
                      onChangeText={value => handleWorkingHourChange(day.key, 'end', value)}
                      placeholder="18:00"
                      placeholderTextColor={theme.colors.text + '80'}
                      editable={isEditable}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Дополнительные опции */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.additionalOptions', 'Дополнительные опции')}
          </Text>

          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {t('profile.doctor.acceptingNewPatients', 'Принимаю новых пациентов')}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.text }]}>
                {t(
                  'profile.doctor.acceptingNewPatientsDesc',
                  'Доступны ли записи для новых пациентов'
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: formData.acceptingNewPatients
                    ? theme.colors.primary
                    : isDarkMode
                      ? '#555'
                      : '#e0e0e0',
                },
              ]}
              onPress={() => handleChange('acceptingNewPatients', !formData.acceptingNewPatients)}
              disabled={!isEditable}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    transform: [{ translateX: formData.acceptingNewPatients ? 18 : 0 }],
                    backgroundColor: 'white',
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {t('profile.doctor.telemedicineAvailable', 'Доступны онлайн-консультации')}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.text }]}>
                {t(
                  'profile.doctor.telemedicineAvailableDesc',
                  'Возможность проведения консультаций онлайн'
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: formData.telemedicineAvailable
                    ? theme.colors.primary
                    : isDarkMode
                      ? '#555'
                      : '#e0e0e0',
                },
              ]}
              onPress={() => handleChange('telemedicineAvailable', !formData.telemedicineAvailable)}
              disabled={!isEditable}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    transform: [{ translateX: formData.telemedicineAvailable ? 18 : 0 }],
                    backgroundColor: 'white',
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Адрес клиники */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('profile.doctor.clinicAddress', 'Адрес клиники')}
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            multiline
            numberOfLines={3}
            value={formData.clinicAddress}
            onChangeText={value => handleChange('clinicAddress', value)}
            placeholder={t('profile.doctor.clinicAddressPlaceholder', 'Полный адрес клиники')}
            placeholderTextColor={theme.colors.text + '80'}
            editable={isEditable}
          />
        </View>

        {/* Кнопки действий */}
        {isEditable && (
          <View style={styles.actionButtons}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={onCancel}
                disabled={savingProfile}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {t('common.cancel', 'Отмена')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
                savingProfile && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{t('common.save', 'Сохранить')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 12,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayToggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dynamicInput: {
    flex: 1,
    marginRight: 8,
  },
  dynamicInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  editPhotoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  formRow: {
    marginBottom: 16,
  },
  hoursContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  optionDescription: {
    fontSize: 14,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  photoContainer: {
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 2,
    height: 100,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 100,
  },
  photoPlaceholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  photoSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  photoSubtitle: {
    fontSize: 14,
  },
  photoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profilePhoto: {
    height: '100%',
    width: '100%',
  },
  saveButton: {
    flex: 2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  timeInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    height: 40,
    paddingHorizontal: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeSeparator: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  toggleButton: {
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: 50,
  },
  toggleKnob: {
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  workingHoursRow: {
    marginBottom: 16,
  },
});
