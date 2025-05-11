import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../theme/colors';
import { Text } from '../components/ui/atoms/Text';
import { Button } from '../components/ui/atoms/Button';
import { Card } from '../components/ui/atoms/Card';
import { Divider } from '../components/ui/atoms/Divider';
import { Badge } from '../components/ui/atoms/Badge';
import { Spinner } from '../components/ui/atoms/Spinner';
import { IconButton } from '../components/ui/molecules/IconButton';
import { ListItem } from '../components/ui/molecules/ListItem';
import { Icon } from '../components/ui/atoms/Icon';
import {
  medicationsApi,
  Medication,
  MedicationReminder,
  MedicationStatus,
} from '../api/medications';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/dateUtils';
import { NotificationService } from '../services/NotificationService';
import { useTheme } from '../theme/ThemeContext';

type MedicationDetailsRouteProp = RouteProp<RootStackParamList, 'MedicationDetails'>;

export const MedicationDetailsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<MedicationDetailsRouteProp>();
  const { medicationId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

  // Получаем данные о лекарстве
  const {
    data: medication,
    isLoading,
    error,
    refresh,
  } = useApi<Medication>({
    url: `/medications/${medicationId}`,
    cacheKey: `medication_${medicationId}`,
    cacheStrategy: 'cache-first',
    cacheDuration: 5 * 60 * 1000, // 5 минут
    showErrorToast: true,
  });

  // Получаем напоминания о лекарстве
  const {
    data: reminders,
    isLoading: isRemindersLoading,
    refresh: refreshReminders,
  } = useApi<MedicationReminder[]>({
    url: `/medications/${medicationId}/reminders`,
    cacheKey: `medication_reminders_${medicationId}`,
    cacheStrategy: 'cache-first',
    cacheDuration: 5 * 60 * 1000,
    showErrorToast: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshReminders()]);
    setRefreshing(false);
  };

  const handleEdit = () => {
    if (medication) {
      navigation.navigate('EditMedication', { medicationId });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удаление лекарства',
      'Вы действительно хотите удалить это лекарство и все связанные с ним напоминания?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationsApi.deleteMedication(medicationId);
              // Удаляем все уведомления для этого лекарства
              if (reminders) {
                for (const reminder of reminders) {
                  await NotificationService.cancelNotification(reminder._id);
                }
              }
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Ошибка', 'Не удалось удалить лекарство');
            }
          },
        },
      ]
    );
  };

  // Получаем текст статуса
  const getMedicationStatusText = (status: MedicationStatus): string => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return 'Активен';
      case MedicationStatus.CANCELLED:
        return 'Отменен';
      case MedicationStatus.COMPLETED:
        return 'Завершен';
      case MedicationStatus.PAUSED:
        return 'Приостановлен';
      default:
        return 'Неизвестно';
    }
  };

  // Получаем цвет статуса
  const getMedicationStatusColor = (status: MedicationStatus): string => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return theme.success;
      case MedicationStatus.CANCELLED:
        return theme.danger;
      case MedicationStatus.COMPLETED:
        return theme.primary;
      case MedicationStatus.PAUSED:
        return theme.warning;
      default:
        return theme.text.secondary;
    }
  };

  // Функция для форматирования частоты приема
  const formatFrequency = (medication: Medication): string => {
    switch (medication.frequency) {
      case 'once':
        return 'Однократно';
      case 'daily':
        return 'Ежедневно';
      case 'twice_daily':
        return 'Дважды в день';
      case 'three_times_daily':
        return 'Трижды в день';
      case 'four_times_daily':
        return 'Четыре раза в день';
      case 'weekly':
        return 'Еженедельно';
      case 'monthly':
        return 'Ежемесячно';
      case 'as_needed':
        return 'По необходимости';
      case 'custom':
        return 'Индивидуальный график';
      default:
        return 'Неизвестно';
    }
  };

  // Функция для форматирования формы лекарства
  const formatForm = (form: string): string => {
    switch (form) {
      case 'tablet':
        return 'Таблетки';
      case 'capsule':
        return 'Капсулы';
      case 'liquid':
        return 'Жидкость';
      case 'injection':
        return 'Инъекции';
      case 'cream':
        return 'Крем/мазь';
      case 'drops':
        return 'Капли';
      case 'inhaler':
        return 'Ингалятор';
      case 'patch':
        return 'Пластырь';
      case 'powder':
        return 'Порошок';
      case 'other':
        return 'Другое';
      default:
        return 'Неизвестно';
    }
  };

  const formatReminderTime = (time: string) => {
    return time;
  };

  const handleMarkAsTaken = async (reminderId: string) => {
    try {
      await medicationsApi.markReminderAsTaken(reminderId);
      refreshReminders();
    } catch (error) {
      console.error('Error marking reminder as taken:', error);
      Alert.alert('Ошибка', 'Не удалось отметить лекарство как принятое');
    }
  };

  const handleMarkAsSkipped = async (reminderId: string) => {
    try {
      await medicationsApi.markReminderAsSkipped(reminderId);
      refreshReminders();
    } catch (error) {
      console.error('Error marking reminder as skipped:', error);
      Alert.alert('Ошибка', 'Не удалось отметить лекарство как пропущенное');
    }
  };

  useEffect(() => {
    // При монтировании проверяем статус и включаем уведомления, если они не включены
    if (medication && reminders && medication.reminderEnabled) {
      reminders.forEach(async reminder => {
        // Для непринятых и непропущенных напоминаний планируем уведомления
        if (!reminder.taken && !reminder.skipped) {
          await NotificationService.scheduleMedicationReminder(medication, reminder);
        }
      });
    }
  }, [medication, reminders]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Загрузка информации...
        </Text>
      </View>
    );
  }

  if (error || !medication) {
    return (
      <Card style={styles.errorCard}>
        <Ionicons name="warning-outline" size={48} color={theme.danger} />
        <Text style={[styles.errorText, { color: theme.text.primary }]}>
          Ошибка при загрузке информации о лекарстве
        </Text>
        <Button title="Повторить" onPress={refresh} variant="primary" style={styles.retryButton} />
      </Card>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.medicationTitle, { color: theme.text.primary }]}>
          {medication.name}
        </Text>
        <Badge
          label={getMedicationStatusText(medication.status)}
          containerStyle={{ backgroundColor: getMedicationStatusColor(medication.status) }}
          size="medium"
        />
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Основная информация
          </Text>
        </View>

        <ListItem
          title="Дозировка"
          subtitle={`${medication.dosage}`}
          leftContent={<Icon name="medical-outline" size={24} color={theme.primary} />}
        />
        <Divider style={styles.divider} />

        <ListItem
          title="Форма"
          subtitle={formatForm(medication.form)}
          leftContent={<Icon name="flask-outline" size={24} color={theme.primary} />}
        />
        <Divider style={styles.divider} />

        <ListItem
          title="Периодичность"
          subtitle={formatFrequency(medication)}
          leftContent={<Icon name="time-outline" size={24} color={theme.primary} />}
        />
        <Divider style={styles.divider} />

        <ListItem
          title="Начало приема"
          subtitle={formatDate(medication.startDate)}
          leftContent={<Icon name="calendar-outline" size={24} color={theme.primary} />}
        />

        {medication.endDate && (
          <>
            <Divider style={styles.divider} />
            <ListItem
              title="Окончание приема"
              subtitle={formatDate(medication.endDate)}
              leftContent={<Icon name="calendar-outline" size={24} color={theme.primary} />}
            />
          </>
        )}

        {medication.prescribedBy && (
          <>
            <Divider style={styles.divider} />
            <ListItem
              title="Назначил"
              subtitle={medication.prescribedBy || 'Не указано'}
              leftContent={<Icon name="person-outline" size={24} color={theme.primary} />}
            />
          </>
        )}
      </Card>

      {medication.notes && (
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Заметки</Text>
          </View>

          <Text style={{ color: theme.text.primary }}>{medication.notes}</Text>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Напоминания</Text>
        </View>

        {isRemindersLoading ? (
          <Spinner size="small" color={theme.primary} />
        ) : !reminders || reminders.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>Нет напоминаний</Text>
        ) : (
          <View style={styles.remindersList}>
            {reminders.map(reminder => (
              <Card key={reminder._id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderTime}>
                    <Ionicons name="time-outline" size={20} color={theme.primary} />
                    <Text style={[styles.reminderTimeText, { color: theme.text.primary }]}>
                      {formatReminderTime(reminder.time)}
                    </Text>
                    <Text style={[styles.reminderDate, { color: theme.text.secondary }]}>
                      {formatDate(reminder.date)}
                    </Text>
                  </View>

                  {reminder.taken ? (
                    <Badge label="Принято" containerStyle={{ backgroundColor: theme.success }} />
                  ) : reminder.skipped ? (
                    <Badge label="Пропущено" containerStyle={{ backgroundColor: theme.danger }} />
                  ) : (
                    <View style={styles.actionButtons}>
                      <IconButton
                        name="checkmark"
                        family="ionicons"
                        color={theme.text.inverse}
                        containerStyle={{ backgroundColor: theme.success }}
                        size="small"
                        onPress={() => handleMarkAsTaken(reminder._id)}
                      />
                      <IconButton
                        name="close"
                        family="ionicons"
                        color={theme.text.inverse}
                        containerStyle={{ backgroundColor: theme.danger }}
                        size="small"
                        onPress={() => handleMarkAsSkipped(reminder._id)}
                      />
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </Card>

      <View style={styles.actionContainer}>
        <Button
          title="Редактировать"
          onPress={handleEdit}
          leftIcon={<Icon name="create-outline" size={20} color={theme.primary} />}
          variant="outline"
          style={styles.editButton}
        />
        <Button
          title="Удалить"
          onPress={handleDelete}
          leftIcon={<Icon name="trash-outline" size={20} color={theme.text.inverse} />}
          variant="primary"
          style={[styles.deleteButton, { backgroundColor: theme.danger }]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  divider: {
    marginVertical: 8,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    margin: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  medicationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reminderCard: {
    padding: 12,
  },
  reminderDate: {
    fontSize: 14,
    marginLeft: 8,
  },
  reminderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderTime: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  reminderTimeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  remindersList: {
    gap: 12,
  },
  retryButton: {
    marginTop: 20,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default MedicationDetailsScreen;
