import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'online' | 'offline';
  status: 'scheduled' | 'completed' | 'cancelled';
}

const DoctorScheduleScreen: React.FC = () => {
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'Иванов Иван Иванович',
      time: '10:00',
      type: 'online',
      status: 'scheduled',
    },
    {
      id: '2',
      patientName: 'Петрова Мария Сергеевна',
      time: '11:30',
      type: 'offline',
      status: 'scheduled',
    },
    {
      id: '3',
      patientName: 'Сидоров Алексей Петрович',
      time: '13:00',
      type: 'online',
      status: 'scheduled',
    },
  ]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Расписание</Text>
          <Text style={styles.subtitle}>20 марта 2024</Text>
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

      <View style={styles.section}>
        {appointments.map(appointment => (
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

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="videocam" size={20} color={COLORS.light.primary} />
                <Text style={styles.actionButtonText}>Начать прием</Text>
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
    backgroundColor: COLORS.light.whiteBackground,
    borderColor: COLORS.light.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
  },
  actionButtonText: {
    color: COLORS.light.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  actionsContainer: {
    marginTop: 12,
  },
  appointmentCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  appointmentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  patientName: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  section: {
    padding: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  subtitle: {
    color: COLORS.light.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeText: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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

export default DoctorScheduleScreen;
