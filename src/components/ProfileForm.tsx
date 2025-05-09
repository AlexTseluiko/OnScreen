import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { userStorage, UserData } from '../utils/userStorage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { profileApi, ProfileData, PatientProfileData } from '../api/profile';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants';
import { PersonalInfoSection } from './profile/PersonalInfoSection';
import { MedicalInfoSection } from './profile/MedicalInfoSection';
import { EmergencyContactSection } from './profile/EmergencyContactSection';
import { AdditionalInfoSection } from './profile/AdditionalInfoSection';
import { ApiError } from '../api/apiClient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppSelector, useAppDispatch } from '../store';
import { authApi } from '../api/auth';
import { setLanguage } from '../store/slices/settingsSlice';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';

// Не используем локальное изображение, так как оно отсутствует
// const DEFAULT_AVATAR = require('../../assets/default-avatar.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileForm: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    loadProfile,
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<PatientProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<string>('personal');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log('ProfileForm mount/update:', {
      user,
      profile,
      profileLoading,
      profileError,
      formData: !!formData,
    });
  }, [user, profile, profileLoading, profileError, formData]);

  // Используем данные из контекста профиля
  useEffect(() => {
    if (profile) {
      console.log('Setting form data from profile');
      setFormData({
        ...profile,
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        height: profile.height || 0,
        weight: profile.weight || 0,
        bloodType: profile.bloodType || '',
        allergies: profile.allergies || [],
        chronicDiseases: profile.chronicDiseases || [],
        medications: profile.medications || [],
        emergencyContact: profile.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
      });
      if (profile.avatar) {
        setAvatar(profile.avatar);
      }
    } else {
      console.log('No profile data available');
    }
  }, [profile]);

  // Перезагрузка профиля при необходимости
  useEffect(() => {
    if (!profile && !profileLoading && user) {
      console.log('Loading profile data');
      loadProfile();
    }
  }, [profile, profileLoading, user, loadProfile]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    if (!formData || !user) {
      setError(t('profile.missingData'));
      setLoading(false);
      return;
    }

    try {
      // Используем функцию из контекста профиля
      const success = await updateProfile(formData);

      if (success) {
        setEditMode(false);
        Alert.alert(t('common.success'), t('profile.updateSuccess'));
      } else {
        throw new Error(t('profile.updateFailed'));
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      let errorMessage = t('profile.updateFailed');

      if (err instanceof ApiError) {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Если мы выходим из режима редактирования без сохранения,
      // восстанавливаем данные из контекста
      if (profile) {
        setFormData(profile);
      }
    }
    setEditMode(!editMode);
  };

  // Компонент для просмотра профиля
  const ProfileViewMode = () => (
    <ScrollView style={styles.container}>
      {formData && (
        <>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.defaultAvatarText}>
                    {formData.userId && formData.userId.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.name, { color: theme.colors.text }]}>
              {user?.name || t('profile.noName')}
            </Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
              {user?.email || ''}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.personalInfo')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.gender')}:</Text>
              <Text style={styles.infoValue}>{formData.gender || t('profile.notSpecified')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.birthDate')}:</Text>
              <Text style={styles.infoValue}>
                {formData.birthDate || t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.height')}:</Text>
              <Text style={styles.infoValue}>
                {formData.height ? `${formData.height} см` : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.weight')}:</Text>
              <Text style={styles.infoValue}>
                {formData.weight ? `${formData.weight} кг` : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.bloodType')}:</Text>
              <Text style={styles.infoValue}>
                {formData.bloodType || t('profile.notSpecified')}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.medicalInfo')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.allergies')}:</Text>
              <Text style={styles.infoValue}>
                {formData.allergies && formData.allergies.length > 0
                  ? formData.allergies.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.chronicConditions')}:</Text>
              <Text style={styles.infoValue}>
                {formData.chronicConditions && formData.chronicConditions.length > 0
                  ? formData.chronicConditions.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.medications')}:</Text>
              <Text style={styles.infoValue}>
                {formData.medications && formData.medications.length > 0
                  ? formData.medications.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.medicalHistory')}:</Text>
              <Text style={styles.infoValue}>
                {formData.medicalHistory || t('profile.notSpecified')}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.emergencyContact')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.name')}:</Text>
              <Text style={styles.infoValue}>
                {formData.emergencyContact?.name || t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.phone')}:</Text>
              <Text style={styles.infoValue}>
                {formData.emergencyContact?.phone || t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('profile.relationship')}:</Text>
              <Text style={styles.infoValue}>
                {formData.emergencyContact?.relationship || t('profile.notSpecified')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEditToggle}
          >
            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  if (profileLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (profileError || error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {profileError || error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setError(null);
            loadProfile();
          }}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!formData) {
    console.log('No form data available, initializing empty profile');
    // Инициализируем пустой профиль вместо возврата ошибки
    setFormData({
      userId: user?.id || '',
      birthDate: '',
      gender: '',
      height: 0,
      weight: 0,
      bloodType: '',
      allergies: [],
      chronicConditions: [],
      medications: [],
      medicalHistory: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
      insurance: {
        provider: '',
        policyNumber: '',
        expiryDate: '',
      },
      preferredLanguage: '',
      lastCheckup: null,
    });
  }

  // Показываем режим просмотра или редактирования
  return editMode ? (
    // Существующий код для редактирования
    <ScrollView style={styles.container}>
      {/* ... существующий код ... */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.primary }]}
          onPress={handleEditToggle}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  ) : (
    <ProfileViewMode />
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  defaultAvatar: {
    alignItems: 'center',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  defaultAvatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 32,
    marginTop: 12,
    paddingVertical: 12,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    color: '#666',
    flex: 1,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoValue: {
    color: '#333',
    flex: 2,
    fontSize: 16,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  retryButton: {
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
