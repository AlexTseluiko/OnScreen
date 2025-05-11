import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useApi } from '../hooks/useApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Импортируем UI компоненты
import { Text } from '../components/ui/atoms/Text';
import { Icon } from '../components/ui/atoms/Icon';
import { Card } from '../components/ui/molecules/Card';
import { Button } from '../components/ui/atoms/Button';
import { Divider } from '../components/ui/atoms/Divider';
import { Alert } from '../components/ui/molecules/Alert';
import { Badge } from '../components/ui/atoms/Badge';

// Типы для медицинской записи
interface MedicalRecord {
  _id: string;
  date: string;
  diagnosis: string;
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clinic: {
    _id: string;
    name: string;
  };
  treatment: string;
  medications: string[];
  notes: string;
  attachments: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Экран деталей медицинской записи
 */
export const MedicalRecordDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { recordId } = route.params as { recordId: string };
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Получаем детали медицинской записи
  const {
    data: record,
    isLoading,
    error,
  } = useApi<MedicalRecord>({
    url: `/medical-records/${recordId}`,
    method: 'GET',
    autoLoad: !!recordId,
    deps: [recordId],
  });

  // Рендер секции с информацией
  const renderInfoSection = (title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <Text variant="subtitle" style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {content}
    </View>
  );

  // Рендер строки с информацией
  const renderInfoRow = (label: string, value: string | undefined) => (
    <View style={styles.infoRow}>
      <Text variant="label" style={[styles.label, { color: theme.colors.text.secondary }]}>
        {label}:
      </Text>
      <Text variant="body" style={styles.value}>
        {value || t('medicalCard.notSpecified')}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Alert
          variant="error"
          message={t('medicalCard.recordNotFound')}
          containerStyle={styles.errorAlert}
        />
        <Button
          title={t('common.goBack')}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  // Форматирование даты
  const formattedDate = format(new Date(record.date), 'dd MMMM yyyy', { locale: ru });
  const formattedCreatedAt = format(new Date(record.createdAt), 'dd.MM.yyyy HH:mm');
  const formattedUpdatedAt = format(new Date(record.updatedAt), 'dd.MM.yyyy HH:mm');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Заголовок с датой и статусом приватности */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="subtitle" style={{ color: theme.colors.text.primary }}>
            {formattedDate}
          </Text>
          <Text variant="body" style={[styles.diagnosisText, { color: theme.colors.primary }]}>
            {record.diagnosis}
          </Text>
        </View>
        {record.isPrivate && (
          <Badge label={t('medicalCard.private')} variant="warning" containerStyle={styles.badge} />
        )}
      </View>

      <Card containerStyle={styles.card}>
        {/* Информация о враче и клинике */}
        {renderInfoSection(
          t('medicalCard.visitInfo'),
          <>
            {renderInfoRow(
              t('medicalCard.doctor'),
              `${record.doctor.firstName} ${record.doctor.lastName}`
            )}
            {renderInfoRow(t('medicalCard.clinic'), record.clinic.name)}
          </>
        )}

        <Divider style={styles.divider} />

        {/* Назначенное лечение */}
        {renderInfoSection(
          t('medicalCard.treatment'),
          <Text variant="body" style={styles.treatmentText}>
            {record.treatment || t('medicalCard.notSpecified')}
          </Text>
        )}

        {/* Лекарства */}
        {renderInfoSection(
          t('medicalCard.medications'),
          record.medications && record.medications.length > 0 ? (
            <View style={styles.medicationsList}>
              {record.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Icon
                    name="pill"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.medicationIcon}
                  />
                  <Text variant="body">{med}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="body" style={styles.italicText}>
              {t('medicalCard.noMedications')}
            </Text>
          )
        )}

        {/* Дополнительные заметки */}
        {record.notes && (
          <>
            <Divider style={styles.divider} />
            {renderInfoSection(
              t('medicalCard.notes'),
              <Text variant="body" style={styles.notesText}>
                {record.notes}
              </Text>
            )}
          </>
        )}

        {/* Информация о дате создания и обновления */}
        <View style={styles.footer}>
          <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
            {t('medicalCard.created')}: {formattedCreatedAt}
          </Text>
          <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
            {t('medicalCard.updated')}: {formattedUpdatedAt}
          </Text>
        </View>
      </Card>

      {/* Кнопки действий */}
      <View style={styles.actionButtons}>
        <Button
          title={t('common.goBack')}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title={t('common.share')}
          onPress={() => {
            /* TODO: Реализовать функцию поделиться */
          }}
          variant="primary"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    margin: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  backButton: {
    marginTop: 16,
  },
  badge: {
    marginLeft: 8,
  },
  card: {
    margin: 16,
    paddingHorizontal: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  diagnosisText: {
    fontWeight: '500',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  errorAlert: {
    margin: 16,
    width: '80%',
  },
  footer: {
    marginTop: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  headerInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  italicText: {
    fontStyle: 'italic',
  },
  label: {
    flex: 1,
  },
  medicationIcon: {
    marginRight: 8,
  },
  medicationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  medicationsList: {
    marginTop: 8,
  },
  notesText: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  treatmentText: {
    lineHeight: 22,
  },
  value: {
    flex: 2,
  },
});
