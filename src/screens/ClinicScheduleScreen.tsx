import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { formatDate as formatDateUtil } from '../utils/dateUtils';

// Типы для расписания
interface TimeSlot {
  id: string;
  time: string;
  doctorId: string;
  doctorName: string;
  patientName?: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  color: string;
}

// Моковые данные
const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Иванов И.И.', specialization: 'Терапевт', color: '#4caf50' },
  { id: '2', name: 'Петрова М.С.', specialization: 'Кардиолог', color: '#2196f3' },
  { id: '3', name: 'Сидоров А.П.', specialization: 'Невролог', color: '#9c27b0' },
  { id: '4', name: 'Козлова Е.В.', specialization: 'Эндокринолог', color: '#f44336' },
  { id: '5', name: 'Смирнов Д.А.', specialization: 'Хирург', color: '#ff9800' },
];

// Генерируем временные слоты
const generateTimeSlots = (doctorId: string, doctorName: string, date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isBooked = Math.random() > 0.7; // Для демо, 30% слотов заняты

      slots.push({
        id: `${doctorId}-${date.toISOString().split('T')[0]}-${timeString}`,
        time: timeString,
        doctorId,
        doctorName,
        patientName: isBooked ? 'Пациент' : undefined,
        status: isBooked ? 'booked' : 'available',
      });
    }
  }

  return slots;
};

const ClinicScheduleScreen: React.FC = () => {
  useAuth(); // Нужен доступ к аутентификации, но переменные не используются
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddSlotModalVisible, setIsAddSlotModalVisible] = useState<boolean>(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newAppointmentDoctor, setNewAppointmentDoctor] = useState<string>('');

  // Генерация дат для недели
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  // Загрузка расписания при изменении даты или врача
  useEffect(() => {
    setLoading(true);

    // Симуляция загрузки данных
    setTimeout(() => {
      let slots: TimeSlot[] = [];

      // Если врач выбран, показываем только его слоты
      if (selectedDoctor) {
        const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor);
        if (doctor) {
          slots = generateTimeSlots(doctor.id, doctor.name, selectedDate);
        }
      } else {
        // Иначе показываем слоты всех врачей
        MOCK_DOCTORS.forEach(doctor => {
          slots = [...slots, ...generateTimeSlots(doctor.id, doctor.name, selectedDate)];
        });
      }

      setTimeSlots(slots);
      setLoading(false);
    }, 800);
  }, [selectedDate, selectedDoctor]);

  // Добавление нового временного слота
  const handleAddTimeSlot = () => {
    if (!newAppointmentTime || !newAppointmentDoctor) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    // Валидация формата времени
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newAppointmentTime)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите время в формате ЧЧ:ММ');
      return;
    }

    const doctor = MOCK_DOCTORS.find(d => d.id === newAppointmentDoctor);
    if (!doctor) {
      Alert.alert('Ошибка', 'Врач не найден');
      return;
    }

    const newSlot: TimeSlot = {
      id: `${doctor.id}-${selectedDate.toISOString().split('T')[0]}-${newAppointmentTime}`,
      time: newAppointmentTime,
      doctorId: doctor.id,
      doctorName: doctor.name,
      status: 'available',
    };

    setTimeSlots([...timeSlots, newSlot]);
    setIsAddSlotModalVisible(false);
    setNewAppointmentTime('');
    setNewAppointmentDoctor('');

    Alert.alert('Успешно', 'Временной слот добавлен');
  };

  // Отмена записи
  const handleCancelAppointment = (slot: TimeSlot) => {
    Alert.alert('Подтверждение', 'Вы уверены, что хотите отменить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Подтвердить',
        style: 'destructive',
        onPress: () => {
          const updatedSlots = timeSlots.map(s => {
            if (s.id === slot.id) {
              return { ...s, status: 'cancelled' as const, patientName: undefined };
            }
            return s;
          });
          setTimeSlots(updatedSlots);
        },
      },
    ]);
  };

  // Форматирование даты
  const formatDateDisplay = (date: Date) => {
    try {
      // Преобразуем Date в строку ISO для нашей утилиты formatDate
      const dateString = date.toISOString();
      return formatDateUtil(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatDayOfWeek = (date: Date) => {
    try {
      // Получаем день недели (0 - воскресенье, 1 - понедельник, и т.д.)
      const day = date.getDay();
      // Массив сокращенных названий дней недели
      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      return days[day];
    } catch (error) {
      console.error('Error formatting day of week:', error);
      return '';
    }
  };

  const formatDayOfMonth = (date: Date) => {
    try {
      return date.getDate().toString();
    } catch (error) {
      console.error('Error formatting day of month:', error);
      return '';
    }
  };

  // Группировка слотов по времени
  const groupSlotsByTime = (slots: TimeSlot[]) => {
    const grouped: Record<string, TimeSlot[]> = {};

    slots.forEach(slot => {
      if (!grouped[slot.time]) {
        grouped[slot.time] = [];
      }
      grouped[slot.time].push(slot);
    });

    return Object.entries(grouped)
      .map(([time, slots]) => ({ time, slots }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const groupedSlots = groupSlotsByTime(timeSlots);

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Расписание клиники</Text>
        <Text style={styles.subtitle}>{formatDateDisplay(selectedDate)}</Text>
      </View>

      {/* Выбор даты */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {generateDates().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              isSameDay(selectedDate, date) && styles.selectedDateItem,
              isToday(date) && styles.todayDateItem,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[styles.dateDayName, isSameDay(selectedDate, date) && styles.selectedDateText]}
            >
              {formatDayOfWeek(date)}
            </Text>
            <Text
              style={[styles.dateDay, isSameDay(selectedDate, date) && styles.selectedDateText]}
            >
              {formatDayOfMonth(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Фильтры врачей */}
      <View style={styles.doctorFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.doctorFilterItem,
              selectedDoctor === null && styles.selectedDoctorFilterItem,
            ]}
            onPress={() => setSelectedDoctor(null)}
          >
            <Text
              style={[
                styles.doctorFilterText,
                selectedDoctor === null && styles.selectedDoctorFilterText,
              ]}
            >
              Все врачи
            </Text>
          </TouchableOpacity>

          {MOCK_DOCTORS.map(doctor => (
            <TouchableOpacity
              key={doctor.id}
              style={[
                styles.doctorFilterItem,
                { borderColor: doctor.color },
                selectedDoctor === doctor.id && styles.selectedDoctorFilterItem,
                selectedDoctor === doctor.id && { backgroundColor: doctor.color + '20' },
              ]}
              onPress={() => setSelectedDoctor(doctor.id)}
            >
              <Text
                style={[
                  styles.doctorFilterText,
                  { color: selectedDoctor === doctor.id ? doctor.color : '#666' },
                ]}
              >
                {doctor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddSlotModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Расписание */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.light.primary} />
          <Text style={styles.loaderText}>Загрузка расписания...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scheduleContainer}>
          {groupedSlots.length === 0 ? (
            <Text style={styles.emptyText}>Нет доступных временных слотов</Text>
          ) : (
            groupedSlots.map(group => (
              <View key={group.time} style={styles.timeGroup}>
                <View style={styles.timeHeader}>
                  <Text style={styles.timeText}>{group.time}</Text>
                  <View style={styles.timeLine} />
                </View>

                <View style={styles.appointmentsContainer}>
                  {group.slots.map(slot => {
                    const doctor = MOCK_DOCTORS.find(d => d.id === slot.doctorId);

                    return (
                      <View
                        key={slot.id}
                        style={[
                          styles.appointmentCard,
                          {
                            borderLeftColor: doctor?.color || COLORS.light.primary,
                            opacity: slot.status === 'cancelled' ? 0.5 : 1,
                          },
                        ]}
                      >
                        <View style={styles.appointmentInfo}>
                          <Text style={styles.doctorName}>{slot.doctorName}</Text>
                          <Text style={styles.doctorSpecialization}>
                            {doctor?.specialization || ''}
                          </Text>

                          {slot.patientName && slot.status !== 'cancelled' && (
                            <View style={styles.patientContainer}>
                              <Ionicons name="person" size={14} color="#666" />
                              <Text style={styles.patientName}>{slot.patientName}</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.appointmentActions}>
                          {slot.status === 'booked' && (
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => handleCancelAppointment(slot)}
                            >
                              <Ionicons name="close" size={16} color={COLORS.light.error} />
                              <Text style={styles.cancelButtonText}>Отменить</Text>
                            </TouchableOpacity>
                          )}

                          {slot.status === 'available' && (
                            <View style={styles.availableBadge}>
                              <Text style={styles.availableBadgeText}>Доступно</Text>
                            </View>
                          )}

                          {slot.status === 'completed' && (
                            <View style={styles.completedBadge}>
                              <Text style={styles.completedBadgeText}>Завершен</Text>
                            </View>
                          )}

                          {slot.status === 'cancelled' && (
                            <View style={styles.cancelledBadge}>
                              <Text style={styles.cancelledBadgeText}>Отменен</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Модальное окно добавления слота */}
      <Modal
        visible={isAddSlotModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddSlotModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить временной слот</Text>
              <TouchableOpacity onPress={() => setIsAddSlotModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Время (ЧЧ:ММ)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Например: 14:30"
                  value={newAppointmentTime}
                  onChangeText={setNewAppointmentTime}
                  keyboardType="default"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Врач</Text>
                <View style={styles.doctorSelector}>
                  {MOCK_DOCTORS.map(doctor => (
                    <TouchableOpacity
                      key={doctor.id}
                      style={[
                        styles.doctorOption,
                        newAppointmentDoctor === doctor.id && {
                          backgroundColor: doctor.color + '20',
                          borderColor: doctor.color,
                        },
                      ]}
                      onPress={() => setNewAppointmentDoctor(doctor.id)}
                    >
                      <Text
                        style={[
                          styles.doctorOptionText,
                          newAppointmentDoctor === doctor.id && { color: doctor.color },
                        ]}
                      >
                        {doctor.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddTimeSlot}>
              <Text style={styles.submitButtonText}>Добавить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: 10,
    width: 36,
  },
  appointmentActions: {
    alignItems: 'flex-end',
  },
  appointmentCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentsContainer: {
    paddingLeft: 50,
  },
  availableBadge: {
    backgroundColor: COLORS.light.success + '20',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableBadgeText: {
    color: COLORS.light.success,
    fontSize: 12,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.error + '20',
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    color: COLORS.light.error,
    fontSize: 12,
    marginLeft: 4,
  },
  cancelledBadge: {
    backgroundColor: COLORS.light.error + '20',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelledBadgeText: {
    color: COLORS.light.error,
    fontSize: 12,
  },
  completedBadge: {
    backgroundColor: COLORS.light.primary + '20',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: COLORS.light.primary,
    fontSize: 12,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  dateDay: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateDayName: {
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dateItem: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    height: 60,
    justifyContent: 'center',
    marginHorizontal: 5,
    width: 45,
  },
  dateSelector: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  doctorFilter: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 10,
  },
  doctorFilterItem: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doctorFilterText: {
    color: '#666',
    fontSize: 14,
  },
  doctorName: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  doctorOption: {
    borderColor: '#e0e0e0',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doctorOptionText: {
    color: '#333',
    fontSize: 14,
  },
  doctorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  doctorSpecialization: {
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  formInput: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderRadius: 5,
    borderWidth: 1,
    fontSize: 16,
    padding: 10,
  },
  formLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    padding: 15,
  },
  loaderContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loaderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  modalForm: {
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 5,
  },
  patientName: {
    color: '#333',
    fontSize: 12,
    marginLeft: 4,
  },
  scheduleContainer: {
    flex: 1,
    padding: 10,
  },
  selectedDateItem: {
    backgroundColor: COLORS.light.primary,
  },
  selectedDateText: {
    color: '#fff',
  },
  selectedDoctorFilterItem: {
    backgroundColor: COLORS.light.primary + '20',
    borderColor: COLORS.light.primary,
  },
  selectedDoctorFilterText: {
    color: COLORS.light.primary,
    fontWeight: '500',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 5,
    padding: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  timeGroup: {
    marginBottom: 15,
  },
  timeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  timeLine: {
    backgroundColor: '#e0e0e0',
    flex: 1,
    height: 1,
  },
  timeText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    width: 50,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  todayDateItem: {
    borderColor: COLORS.light.primary,
    borderWidth: 1,
  },
});

export default ClinicScheduleScreen;
