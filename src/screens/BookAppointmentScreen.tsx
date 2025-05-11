import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsApi, AppointmentRequest } from '../api/appointments';
import { formatDate } from '../utils/dateUtils';

// Типизация параметров маршрута
type BookAppointmentRouteParams = {
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
};

type BookAppointmentScreenRouteProp = RouteProp<
  { BookAppointment: BookAppointmentRouteParams },
  'BookAppointment'
>;

// Структура временного слота
interface TimeSlot {
  time: string;
  available: boolean;
}

const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<BookAppointmentScreenRouteProp>();
  const { user } = useAuth();

  // Получаем данные о враче и клинике из параметров навигации
  const { doctorId, doctorName, specialty, clinicId, clinicName, clinicAddress } = route.params;

  // Состояния компонента
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'online' | 'offline'>('offline');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Генерируем список дат на ближайшие 14 дней
  const generateDates = (): { date: string; label: string }[] => {
    const dates = [];
    const now = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Форматируем дату для API и отображения
      const formattedDate = date.toISOString().split('T')[0];
      const formattedLabel = formatDate(formattedDate);

      dates.push({
        date: formattedDate,
        label: formattedLabel,
      });
    }

    return dates;
  };

  const availableDates = generateDates();

  // Загружаем доступные временные слоты при изменении выбранной даты
  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate]);

  // Функция для получения доступных слотов на выбранную дату
  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const slots = await appointmentsApi.getDoctorAvailableSlots(doctorId, selectedDate);
      setTimeSlots(slots);
    } catch (err) {
      console.error('Ошибка при загрузке доступного времени:', err);
      setError('Не удалось загрузить доступное время приема. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Функция для создания записи на прием
  const handleBookAppointment = async () => {
    if (!selectedTime) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите время приема');
      return;
    }

    try {
      setLoading(true);

      const appointmentData: AppointmentRequest = {
        doctorId,
        clinicId,
        date: selectedDate,
        time: selectedTime,
        type: selectedType,
      };

      await appointmentsApi.createAppointment(appointmentData);

      Alert.alert('Успешно', 'Запись на прием успешно создана', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error('Ошибка при создании записи:', err);
      Alert.alert('Ошибка', 'Не удалось создать запись на прием. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && timeSlots.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
        <Text style={styles.loadingText}>Загрузка доступного времени...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.light.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Запись на прием</Text>
      </View>

      <View style={styles.doctorInfoCard}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        <View style={styles.clinicInfo}>
          <Ionicons name="business" size={16} color={COLORS.light.text.secondary} />
          <Text style={styles.clinicName}>{clinicName}</Text>
        </View>
        <View style={styles.clinicInfo}>
          <Ionicons name="location" size={16} color={COLORS.light.text.secondary} />
          <Text style={styles.clinicAddress}>{clinicAddress}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Тип приема</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'offline' && styles.selectedTypeButton]}
            onPress={() => setSelectedType('offline')}
          >
            <Ionicons
              name="person"
              size={20}
              color={
                selectedType === 'offline' ? COLORS.light.background : COLORS.light.text.secondary
              }
            />
            <Text style={[styles.typeText, selectedType === 'offline' && styles.selectedTypeText]}>
              В клинике
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'online' && styles.selectedTypeButton]}
            onPress={() => setSelectedType('online')}
          >
            <Ionicons
              name="videocam"
              size={20}
              color={
                selectedType === 'online' ? COLORS.light.background : COLORS.light.text.secondary
              }
            />
            <Text style={[styles.typeText, selectedType === 'online' && styles.selectedTypeText]}>
              Онлайн
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите дату</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer}>
          {availableDates.map(date => (
            <TouchableOpacity
              key={date.date}
              style={[styles.dateButton, selectedDate === date.date && styles.selectedDateButton]}
              onPress={() => setSelectedDate(date.date)}
            >
              <Text
                style={[styles.dateText, selectedDate === date.date && styles.selectedDateText]}
              >
                {date.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите время</Text>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAvailableSlots}>
              <Text style={styles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : timeSlots.length === 0 ? (
          <Text style={styles.noSlotsText}>
            Нет доступного времени на выбранную дату. Пожалуйста, выберите другую дату.
          </Text>
        ) : (
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map(slot => (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.timeSlot,
                  !slot.available && styles.unavailableTimeSlot,
                  selectedTime === slot.time && styles.selectedTimeSlot,
                ]}
                disabled={!slot.available}
                onPress={() => setSelectedTime(slot.time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    !slot.available && styles.unavailableTimeSlotText,
                    selectedTime === slot.time && styles.selectedTimeSlotText,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.bookButton, (!selectedTime || loading) && styles.disabledBookButton]}
        disabled={!selectedTime || loading}
        onPress={handleBookAppointment}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.light.background} />
        ) : (
          <>
            <Ionicons name="calendar" size={20} color={COLORS.light.background} />
            <Text style={styles.bookButtonText}>Записаться на прием</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
  },
  bookButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
  },
  bookButtonText: {
    color: COLORS.light.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clinicAddress: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  clinicInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  clinicName: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  dateButton: {
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    padding: 10,
  },
  dateText: {
    color: COLORS.light.text.primary,
    fontSize: 14,
  },
  datesContainer: {
    marginTop: 12,
  },
  disabledBookButton: {
    backgroundColor: COLORS.light.text.disabled,
  },
  doctorInfoCard: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    elevation: 2,
    margin: 16,
    padding: 16,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorName: {
    color: COLORS.light.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
  },
  errorText: {
    color: COLORS.palette.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 12,
  },
  noSlotsText: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: COLORS.light.background,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedDateButton: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  selectedDateText: {
    color: COLORS.light.background,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  selectedTimeSlotText: {
    color: COLORS.light.background,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  selectedTypeText: {
    color: COLORS.light.background,
  },
  specialty: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
    marginBottom: 12,
    marginTop: 4,
  },
  timeSlot: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 8,
    marginRight: 8,
    padding: 12,
    width: '23%',
  },
  timeSlotText: {
    color: COLORS.light.text.primary,
    fontSize: 14,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  title: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  typeText: {
    color: COLORS.light.text.primary,
    fontSize: 14,
    marginLeft: 8,
  },
  unavailableTimeSlot: {
    backgroundColor: COLORS.light.text.disabled,
    borderColor: COLORS.light.text.disabled,
  },
  unavailableTimeSlotText: {
    color: COLORS.light.text.hint,
  },
});

export default BookAppointmentScreen;
