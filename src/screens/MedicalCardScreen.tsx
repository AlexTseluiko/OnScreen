import React from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useApi } from '../hooks/useApi';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { formatDate } from '../utils/dateUtils';
import { MedicalRecord } from '../api/medicalRecords';

// Импортируем атомарные компоненты
import { Text } from '../components/ui/atoms/Text';
import { Card } from '../components/ui/molecules/Card';
import { Button } from '../components/ui/atoms/Button';
import { Divider } from '../components/ui/atoms/Divider';
import { Alert } from '../components/ui/molecules/Alert';
import { Icon } from '../components/ui/atoms/Icon';
import styles from './MedicalCardScreen.styles';

/**
 * Экран медицинской карты пользователя
 *
 * Отображает основную медицинскую информацию о пользователе и список записей
 */
export const MedicalCardScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Получаем медицинские записи пользователя
  const {
    data: medicalRecords,
    isLoading,
    error,
    execute: fetchMedicalRecords,
  } = useApi<MedicalRecord[]>({
    url: user ? `/medical-records/patient/${user.id}` : '',
    method: 'GET',
    autoLoad: !!user,
    deps: [user?.id],
  });

  if (!user) {
    return (
      <View style={styles.container}>
        <Alert variant="error" message={t('auth.pleaseLogin')} containerStyle={styles.errorAlert} />
      </View>
    );
  }

  // Рендер строки с информацией
  const renderInfoRow = (label: string, value: string | undefined) => (
    <View style={styles.infoRow}>
      <Text variant="label" style={styles.label}>
        {label}:
      </Text>
      <Text variant="body" style={styles.value}>
        {value || t('medicalCard.notSpecified')}
      </Text>
    </View>
  );

  // Рендер медицинской записи
  const renderMedicalRecord = (record: MedicalRecord) => {
    const formattedDate = formatDate(record.date);

    return (
      <TouchableOpacity
        key={record._id}
        style={[styles.recordCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('MedicalRecordDetails', { recordId: record._id })}
      >
        <View style={styles.recordHeader}>
          <Text variant="subtitle" color={theme.colors.primary}>
            {formattedDate}
          </Text>
          {record.isPrivate && <Icon name="lock" size={16} color={theme.colors.primary} />}
        </View>

        <Text variant="body" style={styles.diagnosisText}>
          {record.diagnosis}
        </Text>

        <View style={styles.recordFooter}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {t('medicalCard.doctor')}: {record.doctor.firstName} {record.doctor.lastName}
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {t('medicalCard.clinic')}: {record.clinic.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card title={t('medicalCard.title')} containerStyle={styles.card}>
        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            {t('medicalCard.personalInfo')}
          </Text>
          {renderInfoRow(t('medicalCard.name'), `${user.firstName} ${user.lastName}`)}
          {renderInfoRow(t('medicalCard.email'), user.email)}
          {renderInfoRow(t('medicalCard.phone'), user.phone)}
        </View>

        <Divider />

        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            {t('medicalCard.medicalInfo')}
          </Text>
          {renderInfoRow(t('medicalCard.bloodType'), user.bloodType)}
          {renderInfoRow(
            t('medicalCard.allergies'),
            user.allergies?.length ? user.allergies.join(', ') : undefined
          )}
          {renderInfoRow(
            t('medicalCard.chronicDiseases'),
            user.chronicConditions?.length ? user.chronicConditions.join(', ') : undefined
          )}
        </View>
      </Card>

      <Card title={t('medicalCard.records')} containerStyle={styles.card}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Alert
            variant="error"
            message={t('medicalCard.errorLoadingRecords')}
            containerStyle={styles.errorAlert}
          />
        ) : !medicalRecords || medicalRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" style={styles.emptyStateText}>
              {t('medicalCard.noRecords')}
            </Text>
          </View>
        ) : (
          <View style={styles.recordsContainer}>{medicalRecords.map(renderMedicalRecord)}</View>
        )}

        <Button
          title={t('medicalCard.refresh')}
          onPress={() => fetchMedicalRecords()}
          variant="outline"
          style={styles.refreshButton}
        />
      </Card>
    </ScrollView>
  );
};
