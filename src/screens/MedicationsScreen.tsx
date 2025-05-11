import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { medicationsApi, Medication, MedicationStatus } from '../api/medications';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/dateUtils';
import { useTheme } from '../theme/ThemeContext';

export const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  // Используем кэшированный API-запрос со стратегией cache-first
  const {
    data: medications,
    isLoading,
    error,
    refresh,
    execute,
  } = useApi<Medication[]>({
    url: '/medications',
    autoLoad: true,
    cacheKey: 'user_medications',
    cacheStrategy: 'cache-first',
    cacheDuration: 5 * 60 * 1000, // 5 минут
    showErrorToast: true,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAddMedication = () => {
    // @ts-expect-error - Navigation type is not properly typed in the project
    navigation.navigate('AddMedication');
  };

  const handleEditMedication = (id: string) => {
    // @ts-expect-error - Navigation type is not properly typed in the project
    navigation.navigate('EditMedication', { medicationId: id });
  };

  const handleViewMedication = (id: string) => {
    // @ts-expect-error - Navigation type is not properly typed in the project
    navigation.navigate('MedicationDetails', { medicationId: id });
  };

  const handleDeleteMedication = (id: string) => {
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
              await medicationsApi.deleteMedication(id);
              execute(); // Обновляем список после удаления
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Ошибка', 'Не удалось удалить лекарство');
            }
          },
        },
      ]
    );
  };

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

  const getMedicationStatusColor = (status: MedicationStatus): string => {
    switch (status) {
      case MedicationStatus.ACTIVE:
        return COLORS.palette.success;
      case MedicationStatus.CANCELLED:
        return COLORS.palette.danger;
      case MedicationStatus.COMPLETED:
        return COLORS.palette.primary;
      case MedicationStatus.PAUSED:
        return COLORS.palette.warning;
      default:
        return COLORS.palette.gray[500];
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <TouchableOpacity style={styles.medicationCard} onPress={() => handleViewMedication(item._id)}>
      <View style={styles.medicationContent}>
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getMedicationStatusColor(item.status) }]}
          >
            <Text style={styles.statusText}>{getMedicationStatusText(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.medicationDosage}>
          {item.dosage} • {item.form}
        </Text>

        <View style={styles.medicationSchedule}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.palette.gray[500]} />
          <Text style={styles.scheduleText}>
            {formatDate(item.startDate)}
            {item.endDate ? ` - ${formatDate(item.endDate)}` : ' - Бессрочно'}
          </Text>
        </View>

        <View style={styles.medicationSchedule}>
          <Ionicons name="time-outline" size={16} color={COLORS.palette.gray[500]} />
          <Text style={styles.scheduleText}>{item.times.join(', ')}</Text>
        </View>
      </View>

      <View style={styles.medicationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditMedication(item._id)}
        >
          <Ionicons name="create-outline" size={22} color={COLORS.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteMedication(item._id)}
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.palette.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !medications) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
        <Text style={styles.loadingText}>Загрузка лекарств...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={COLORS.palette.danger} />
        <Text style={styles.errorText}>Ошибка при загрузке лекарств</Text>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
          <Ionicons name="add" size={24} color={COLORS.light.background} />
        </TouchableOpacity>
        <Text style={styles.title}>Мои лекарства</Text>
      </View>

      {medications && medications.length > 0 ? (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical-outline" size={64} color={COLORS.palette.gray[300]} />
          <Text style={styles.emptyText}>У вас пока нет добавленных лекарств</Text>
          <TouchableOpacity style={styles.addMedicationButton} onPress={handleAddMedication}>
            <Text style={styles.addMedicationText}>Добавить лекарство</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: 12,
    padding: 8,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  addMedicationButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addMedicationText: {
    color: COLORS.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.palette.gray[200],
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContainer: {
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
    marginTop: 12,
  },
  medicationActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  medicationCard: {
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.palette.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationContent: {
    flex: 1,
  },
  medicationDosage: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  medicationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medicationName: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicationSchedule: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: COLORS.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleText: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: COLORS.light.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MedicationsScreen;
