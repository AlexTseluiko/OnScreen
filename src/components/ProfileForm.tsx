import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types/profile';
import { ApiError } from '../api/apiClient';

export const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile, profileLoading, profileError, updateProfile, loadProfile } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setFormData(profile);
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
      await updateProfile(formData);
      setEditMode(false);
      Alert.alert(t('common.success'), t('profile.updateSuccess'));
    } catch (err) {
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
    setFormData({
      _id: user?.id || '',
      id: user?.id || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'PATIENT',
      birthDate: '',
      gender: '',
      address: '',
      medicalHistory: [],
      allergies: [],
      medications: [],
      emergencyContacts: [
        {
          name: '',
          phone: '',
          relationship: '',
        },
      ],
      avatar: user?.avatar,
      phone: user?.phone,
      isVerified: user?.isVerified || false,
      isBlocked: user?.isBlocked || false,
    });
  }

  // Показываем режим просмотра или редактирования
  return editMode ? (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
              {t('common.save')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  ) : (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {formData && (
        <>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.defaultAvatarText}>
                    {formData.firstName && formData.firstName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.name, { color: theme.colors.text }]}>
              {formData.firstName && formData.lastName
                ? `${formData.firstName} ${formData.lastName}`
                : t('profile.noName')}
            </Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
              {formData.email || ''}
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.personalInfo')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.gender')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.gender || t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.birthDate')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.birthDate || t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.address')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.address || t('profile.notSpecified')}
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.medicalInfo')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.allergies')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.allergies && formData.allergies.length > 0
                  ? formData.allergies.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.medications')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.medications && formData.medications.length > 0
                  ? formData.medications.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                {t('profile.medicalHistory')}:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formData.medicalHistory && formData.medicalHistory.length > 0
                  ? formData.medicalHistory.join(', ')
                  : t('profile.notSpecified')}
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('profile.emergencyContact')}
            </Text>
            {formData.emergencyContacts &&
              formData.emergencyContacts.map((contact, index) => (
                <View key={index}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      {t('profile.name')}:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {contact.name || t('profile.notSpecified')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      {t('profile.phone')}:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {contact.phone || t('profile.notSpecified')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                      {t('profile.relationship')}:
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {contact.relationship || t('profile.notSpecified')}
                    </Text>
                  </View>
                </View>
              ))}
          </View>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEditToggle}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.white }]}>
              {t('common.edit')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
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
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoValue: {
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
