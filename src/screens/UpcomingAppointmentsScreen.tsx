import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  clinicName: string;
  address: string;
  type: 'online' | 'offline';
}

const UpcomingAppointmentsScreen: React.FC = () => {
  useAuth();
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorName: 'Доктор Иванов',
      specialty: 'Терапевт',
      date: '20.03.2024',
      time: '10:00',
      clinicName: 'Медицинский центр "Здоровье"',
      address: 'ул. Ленина, 10',
      type: 'offline',
    },
    {
      id: '2',
      doctorName: 'Доктор Петрова',
      specialty: 'Кардиолог',
      date: '22.03.2024',
      time: '15:30',
      clinicName: 'Клиника "Кардио"',
      address: 'ул. Пушкина, 5',
      type: 'online',
    },
  ]);

  const handleCancelAppointment = (id: string) => {
    // Здесь будет логика отмены приема
    console.log('Отмена приема:', id);
  };

  const handleRescheduleAppointment = (id: string) => {
    // Здесь будет логика переноса приема
    console.log('Перенос приема:', id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Предстоящие приемы</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Запланировано</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {appointments.filter(a => a.type === 'online').length}
            </Text>
            <Text style={styles.statLabel}>Онлайн</Text>
          </View>
        </View>
      </View>

      <View style={styles.appointmentsContainer}>
        {appointments.map(appointment => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View>
                <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                <Text style={styles.specialty}>{appointment.specialty}</Text>
              </View>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      appointment.type === 'online'
                        ? COLORS.light.primary
                        : COLORS.light.textSecondary,
                  },
                ]}
              >
                <Text style={styles.typeText}>
                  {appointment.type === 'online' ? 'Онлайн' : 'В клинике'}
                </Text>
              </View>
            </View>

            <View style={styles.appointmentInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={COLORS.light.textSecondary} />
                <Text style={styles.infoText}>
                  {appointment.date} в {appointment.time}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business" size={16} color={COLORS.light.textSecondary} />
                <Text style={styles.infoText}>{appointment.clinicName}</Text>
              </View>
              {appointment.type === 'offline' && (
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={COLORS.light.textSecondary} />
                  <Text style={styles.infoText}>{appointment.address}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rescheduleButton]}
                onPress={() => handleRescheduleAppointment(appointment.id)}
              >
                <Ionicons name="calendar" size={16} color={COLORS.light.primary} />
                <Text style={[styles.actionButtonText, styles.rescheduleButtonText]}>
                  Перенести
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelAppointment(appointment.id)}
              >
                <Ionicons name="close-circle" size={16} color={COLORS.light.error} />
                <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Отменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  appointmentCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentInfo: {
    marginTop: 12,
  },
  appointmentsContainer: {
    padding: 16,
  },
  cancelButton: {
    backgroundColor: COLORS.light.whiteBackground,
    borderColor: COLORS.light.error,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: COLORS.light.error,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  doctorName: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  infoText: {
    color: COLORS.light.text,
    fontSize: 14,
    marginLeft: 8,
  },
  rescheduleButton: {
    backgroundColor: COLORS.light.whiteBackground,
    borderColor: COLORS.light.primary,
    borderWidth: 1,
  },
  rescheduleButtonText: {
    color: COLORS.light.primary,
  },
  specialty: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statValue: {
    color: COLORS.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeText: {
    color: COLORS.light.whiteBackground,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UpcomingAppointmentsScreen;
