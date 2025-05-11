import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { medicationsApi, MedicationReminder, Medication } from '../api/medications';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../theme/ThemeContext';

// Формат отображения времени
const formatTime = (time: string) => {
  return time;
};

// Структура для сгруппированных напоминаний
interface GroupedReminder {
  medication: Medication;
  reminders: MedicationReminder[];
}

export const MedicationRemindersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [groupedReminders, setGroupedReminders] = useState<GroupedReminder[]>([]);
  const { isDark } = useTheme();

  // Запрос на получение всех напоминаний на сегодня
  const {
    data: reminders,
    isLoading,
    error,
    refresh,
  } = useApi<MedicationReminder[]>({
    url: '/medications/reminders/today',
    autoLoad: true,
    cacheStrategy: 'cache-first',
    cacheDuration: 5 * 60 * 1000, // 5 минут
    showErrorToast: true,
  });

  // Запрос на получение всех лекарств для отображения информации
  const { data: medications, isLoading: isMedicationsLoading } = useApi<Medication[]>({
    url: '/medications',
    autoLoad: true,
    cacheStrategy: 'cache-first',
    cacheDuration: 5 * 60 * 1000, // 5 минут
    showErrorToast: true,
  });

  // Группируем напоминания по лекарствам
  useEffect(() => {
    if (reminders && medications) {
      const grouped: GroupedReminder[] = [];
      const medicationsMap = new Map<string, Medication>();

      // Создаем карту лекарств для быстрого доступа
      medications.forEach(med => {
        medicationsMap.set(med._id, med);
      });

      // Группировка напоминаний по лекарствам
      const remindersByMedicationId = new Map<string, MedicationReminder[]>();
      reminders.forEach(reminder => {
        const medId = reminder.medicationId;
        if (!remindersByMedicationId.has(medId)) {
          remindersByMedicationId.set(medId, []);
        }
        remindersByMedicationId.get(medId)?.push(reminder);
      });

      // Формируем итоговый массив
      remindersByMedicationId.forEach((medicationReminders, medicationId) => {
        const medication = medicationsMap.get(medicationId);
        if (medication) {
          grouped.push({
            medication,
            reminders: medicationReminders,
          });
        }
      });

      setGroupedReminders(grouped);
    }
  }, [reminders, medications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleMarkAsTaken = async (reminderId: string) => {
    try {
      await medicationsApi.markReminderAsTaken(reminderId);
      refresh();
    } catch (error) {
      console.error('Error marking reminder as taken:', error);
      Alert.alert('Ошибка', 'Не удалось отметить лекарство как принятое');
    }
  };

  const handleMarkAsSkipped = async (reminderId: string) => {
    try {
      await medicationsApi.markReminderAsSkipped(reminderId);
      refresh();
    } catch (error) {
      console.error('Error marking reminder as skipped:', error);
      Alert.alert('Ошибка', 'Не удалось отметить лекарство как пропущенное');
    }
  };

  const handleViewMedication = (medicationId: string) => {
    // @ts-expect-error - Navigation type is not properly typed in the project
    navigation.navigate('MedicationDetails', { medicationId });
  };

  const renderReminderGroup = ({ item }: { item: GroupedReminder }) => (
    <View style={styles.reminderGroup}>
      <TouchableOpacity
        style={styles.medicationHeader}
        onPress={() => handleViewMedication(item.medication._id)}
      >
        <Text style={styles.medicationName}>{item.medication.name}</Text>
        <Text style={styles.dosage}>{item.medication.dosage}</Text>
      </TouchableOpacity>

      <View style={styles.remindersContainer}>
        {item.reminders.map(reminder => (
          <View key={reminder._id} style={styles.reminderItem}>
            <View style={styles.reminderTimeContainer}>
              <Ionicons name="time-outline" size={16} color={COLORS.palette.gray[500]} />
              <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
            </View>

            <View style={styles.reminderActions}>
              {reminder.taken ? (
                <View style={styles.takenBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.palette.success} />
                  <Text style={styles.takenText}>Принято</Text>
                </View>
              ) : reminder.skipped ? (
                <View style={styles.skippedBadge}>
                  <Ionicons name="close-circle" size={16} color={COLORS.palette.warning} />
                  <Text style={styles.skippedText}>Пропущено</Text>
                </View>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.takeButton]}
                    onPress={() => handleMarkAsTaken(reminder._id)}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.light.background} />
                    <Text style={styles.actionButtonText}>Принять</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.skipButton]}
                    onPress={() => handleMarkAsSkipped(reminder._id)}
                  >
                    <Ionicons name="close" size={16} color={COLORS.light.background} />
                    <Text style={styles.actionButtonText}>Пропустить</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if ((isLoading || isMedicationsLoading) && !reminders) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
        <Text style={styles.loadingText}>Загрузка напоминаний...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={COLORS.palette.danger} />
        <Text style={styles.errorText}>Ошибка при загрузке напоминаний</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Напоминания на сегодня</Text>
      </View>
      <FlatList
        data={groupedReminders}
        keyExtractor={item => item.medication._id}
        renderItem={renderReminderGroup}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginLeft: 8,
    padding: 8,
  },
  actionButtonText: {
    color: COLORS.light.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
  },
  dosage: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
  },
  list: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    marginTop: 16,
  },
  medicationHeader: {
    borderBottomColor: COLORS.palette.gray[200],
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingBottom: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderActions: {
    flexDirection: 'row',
  },
  reminderGroup: {
    marginBottom: 16,
  },
  reminderItem: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
  },
  reminderTime: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderTimeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  remindersContainer: {
    gap: 12,
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: COLORS.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: COLORS.palette.warning,
  },
  skippedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  skippedText: {
    color: COLORS.light.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  takeButton: {
    backgroundColor: COLORS.palette.success,
  },
  takenBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  takenText: {
    color: COLORS.light.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MedicationRemindersScreen;
