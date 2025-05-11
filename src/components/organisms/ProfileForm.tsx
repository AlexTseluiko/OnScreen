import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { Profile } from '../../types/profile';
import { ApiError } from '../../api/apiClient';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { Avatar } from '../atoms/Avatar';
import { Divider } from '../atoms/Divider';

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

  // Используем данные из контекста профиля
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      if (profile.avatar) {
        setAvatar(profile.avatar);
      }
    }
  }, [profile]);

  // Перезагрузка профиля при необходимости
  useEffect(() => {
    if (!profile && !profileLoading && user) {
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

  const handleInputChange = (field: keyof Profile, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  if (profileLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text.primary, marginTop: 16 }}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (profileError || error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.danger, marginBottom: 16 }}>
          {profileError || error}
        </Text>
        <Button
          title={t('common.retry')}
          onPress={() => {
            setError(null);
            loadProfile();
          }}
          variant="primary"
        />
      </View>
    );
  }

  if (!formData) {
    // Инициализация пустого профиля, если данные отсутствуют
    const emptyProfile: Profile = {
      id: user?.id || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'PATIENT',
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
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
      phone: user?.phone || '',
      isVerified: user?.isVerified || false,
      isBlocked: user?.isBlocked || false,
    };

    setFormData(emptyProfile);
    return null; // Вернем null, чтобы избежать рендеринга до установки formData
  }

  // Режим редактирования профиля
  if (editMode) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.card}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={avatar}
              initials={`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`}
              size={80}
            />
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={{ color: theme.colors.primary }}>{t('profile.changeAvatar')}</Text>
            </TouchableOpacity>
          </View>

          <Input
            label={t('profile.firstName')}
            value={formData.firstName}
            onChangeText={value => handleInputChange('firstName', value)}
            style={styles.inputContainer}
          />

          <Input
            label={t('profile.lastName')}
            value={formData.lastName}
            onChangeText={value => handleInputChange('lastName', value)}
            style={styles.inputContainer}
          />

          <Input
            label={t('profile.email')}
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            keyboardType="email-address"
            style={styles.inputContainer}
          />

          <Input
            label={t('profile.phone')}
            value={formData.phone || ''}
            onChangeText={value => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            style={styles.inputContainer}
          />

          <Input
            label={t('profile.birthDate')}
            value={formData.birthDate || ''}
            onChangeText={value => handleInputChange('birthDate', value)}
            placeholder="YYYY-MM-DD"
            style={styles.inputContainer}
          />

          <Input
            label={t('profile.address')}
            value={formData.address || ''}
            onChangeText={value => handleInputChange('address', value)}
            style={styles.inputContainer}
          />

          <View style={styles.buttonRow}>
            <Button
              title={t('common.cancel')}
              onPress={handleEditToggle}
              variant="outline"
              style={styles.button}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              variant="primary"
              isLoading={loading}
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>
    );
  }

  // Режим просмотра профиля
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar
          uri={avatar}
          initials={`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`}
          size={100}
        />
        <Text variant="title" style={{ color: theme.colors.text.primary, marginTop: 16 }}>
          {formData.firstName && formData.lastName
            ? `${formData.firstName} ${formData.lastName}`
            : t('profile.noName')}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text.secondary, marginTop: 4 }}>
          {formData.email || ''}
        </Text>
      </View>

      <Card style={styles.card}>
        <Text variant="title" style={{ color: theme.colors.text.primary, marginBottom: 16 }}>
          {t('profile.personalInfo')}
        </Text>

        <View style={styles.infoRow}>
          <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
            {t('profile.gender')}:
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
            {formData.gender || t('profile.notSpecified')}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
            {t('profile.birthDate')}:
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
            {formData.birthDate || t('profile.notSpecified')}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
            {t('profile.phone')}:
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
            {formData.phone || t('profile.notSpecified')}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
            {t('profile.address')}:
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
            {formData.address || t('profile.notSpecified')}
          </Text>
        </View>
      </Card>

      {formData.role === 'PATIENT' && (
        <Card style={styles.card}>
          <Text variant="title" style={{ color: theme.colors.text.primary, marginBottom: 16 }}>
            {t('profile.medicalInfo')}
          </Text>

          <View style={styles.infoRow}>
            <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
              {t('profile.allergies')}:
            </Text>
            <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
              {formData.allergies && formData.allergies.length > 0
                ? formData.allergies.join(', ')
                : t('profile.noAllergies')}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="body" style={{ color: theme.colors.text.secondary, flex: 1 }}>
              {t('profile.medications')}:
            </Text>
            <Text variant="body" style={{ color: theme.colors.text.primary, flex: 2 }}>
              {formData.medications && formData.medications.length > 0
                ? formData.medications.join(', ')
                : t('profile.noMedications')}
            </Text>
          </View>
        </Card>
      )}

      <Button
        title={t('profile.editProfile')}
        onPress={handleEditToggle}
        variant="primary"
        style={styles.editButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  divider: {
    marginVertical: 12,
  },
  editButton: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
});
