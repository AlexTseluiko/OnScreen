import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { appointmentsApi, AppointmentStatus } from '../api/appointments';
import { format as formatTz } from 'date-fns-tz';
import { ru } from 'date-fns/locale/ru';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'online' | 'offline';
  status: 'scheduled' | 'cancelled' | 'completed';
  notes?: string;
}

const DoctorScheduleScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Генерируем даты для выбора (текущая неделя)
  const generateWeekDates = () => {
    const dates = [];
    const currentDate = new Date();

    // Генерируем даты на неделю вперед
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Получаем расписание врача на выбранную дату
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Формируем дату в нужном формате для API
      const formattedDate = formatTz(selectedDate, 'yyyy-MM-dd');

      // Получаем назначения с сервера
      const response = await appointmentsApi.getDoctorAppointments(user?.id || '', formattedDate);

      // Преобразуем данные с сервера в формат для отображения
      const formattedAppointments = response.map(appointment => ({
        id: appointment.id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        time: appointment.time,
        type: appointment.type as 'online' | 'offline',
        status: appointment.status as 'scheduled' | 'cancelled' | 'completed',
        notes: appointment.notes,
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Ошибка при загрузке расписания:', error);
      setError('Не удалось загрузить расписание. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, user]);

  // Загружаем расписание при изменении даты
  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, user, fetchSchedule]);

  // Начало приема
  const handleStartAppointment = (appointment: Appointment) => {
    if (appointment.type === 'online') {
      // Переход на экран видеоконсультации
      // navigation.navigate('VideoConsultation', { appointmentId: appointment.id });
      Alert.alert('Видеоконсультация', 'Переход к онлайн-консультации');
    } else {
      // Переход на экран офлайн-приема
      // navigation.navigate('PatientDetails', { appointmentId: appointment.id });
      Alert.alert('Очный прием', 'Переход к деталям пациента');
    }
  };

  // Отмена приема
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      Alert.alert('Подтверждение', 'Вы уверены, что хотите отменить прием?', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Подтвердить',
          onPress: async () => {
            await appointmentsApi.updateAppointmentStatus(
              appointmentId,
              AppointmentStatus.CANCELLED
            );
            Alert.alert('Успех', 'Прием отменен');
            fetchSchedule();
          },
        },
      ]);
    } catch (error) {
      console.error('Ошибка при отмене приема:', error);
      Alert.alert('Ошибка', 'Не удалось отменить прием');
    }
  };

  // Форматирование даты для отображения
  const formatDateHeader = (date: Date) => {
    try {
      return formatTz(date, 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      console.error('Error formatting date header:', error);
      return formatTz(date, 'dd/MM/yyyy');
    }
  };

  // Форматирование дня недели
  const formatDayOfWeek = (date: Date) => {
    try {
      return formatTz(date, 'EEEEEE', { locale: ru });
    } catch (error) {
      console.error('Error formatting day of week:', error);
      return formatTz(date, 'EE');
    }
  };

  // Форматирование дня месяца
  const formatDayOfMonth = (date: Date) => {
    try {
      return formatTz(date, 'd', { locale: ru });
    } catch (error) {
      console.error('Error formatting day of month:', error);
      return formatTz(date, 'd');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Расписание</Text>
          <Text style={styles.subtitle}>{formatDateHeader(selectedDate)}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Всего приемов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {appointments.filter(a => a.type === 'online').length}
            </Text>
            <Text style={styles.statLabel}>Онлайн</Text>
          </View>
        </View>
      </View>

      {/* Выбор даты */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {generateWeekDates().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              selectedDate.toDateString() === date.toDateString() && styles.selectedDateItem,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateDayName,
                selectedDate.toDateString() === date.toDateString() && styles.selectedDateText,
              ]}
            >
              {formatDayOfWeek(date)}
            </Text>
            <Text
              style={[
                styles.dateDay,
                selectedDate.toDateString() === date.toDateString() && styles.selectedDateText,
              ]}
            >
              {formatDayOfMonth(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.appointmentsContainer}>
        {loading ? (
          <Text style={styles.messageText}>Загрузка расписания...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : appointments.length === 0 ? (
          <Text style={styles.messageText}>На выбранную дату нет приемов</Text>
        ) : (
          appointments.map(appointment => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time" size={20} color={COLORS.light.primary} />
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        appointment.type === 'online' ? COLORS.light.primary : COLORS.light.success,
                    },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {appointment.type === 'online' ? 'Онлайн' : 'Очно'}
                  </Text>
                </View>
              </View>

              <Text style={styles.patientName}>{appointment.patientName}</Text>

              {appointment.notes && <Text style={styles.notes}>Заметки: {appointment.notes}</Text>}

              <View style={styles.actionsContainer}>
                {appointment.status === 'scheduled' && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleStartAppointment(appointment)}
                    >
                      <Ionicons
                        name={appointment.type === 'online' ? 'videocam' : 'medkit'}
                        size={20}
                        color={COLORS.light.primary}
                      />
                      <Text style={styles.actionButtonText}>Начать прием</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: COLORS.light.error + '20' }]}
                      onPress={() => handleCancelAppointment(appointment.id)}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.light.error} />
                      <Text style={[styles.actionButtonText, { color: COLORS.light.error }]}>
                        Отменить
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.light.success }]}>
                    <Text style={styles.statusText}>Завершен</Text>
                  </View>
                )}
                {appointment.status === 'cancelled' && (
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.light.error }]}>
                    <Text style={styles.statusText}>Отменен</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 4,
    marginLeft: 8,
    padding: 8,
  },
  actionButtonText: {
    color: COLORS.light.text.inverse,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  appointmentCard: {
    backgroundColor: COLORS.light.background,
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  appointmentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appointmentsContainer: {
    padding: 16,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  dateDay: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateDayName: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
  },
  dateItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    marginRight: 8,
    width: 60,
  },
  dateSelector: {
    padding: 16,
  },
  errorText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.light.background,
    elevation: 3,
    padding: 16,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    marginBottom: 16,
  },
  messageText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  notes: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
  },
  patientName: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedDateItem: {
    backgroundColor: COLORS.light.primary,
  },
  selectedDateText: {
    color: COLORS.light.text.inverse,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  statValue: {
    color: COLORS.light.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: COLORS.light.background,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statusBadge: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: COLORS.light.text.inverse,
    fontSize: 12,
  },
  subtitle: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 4,
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: COLORS.light.text.primary,
    fontSize: 14,
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  typeBadge: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    color: COLORS.light.text.inverse,
    fontSize: 12,
  },
});

export default DoctorScheduleScreen;
