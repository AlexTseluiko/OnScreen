import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Consultation {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'scheduled';
  diagnosis?: string;
  notes?: string;
}

const ConsultationHistoryScreen: React.FC = () => {
  useAuth();
  const [consultations] = useState<Consultation[]>([
    {
      id: '1',
      patientName: 'Иванов Иван Иванович',
      date: '2024-03-20',
      time: '10:00',
      status: 'completed',
      diagnosis: 'ОРВИ',
      notes: 'Рекомендован постельный режим',
    },
    {
      id: '2',
      patientName: 'Петрова Мария Сергеевна',
      date: '2024-03-20',
      time: '11:30',
      status: 'scheduled',
    },
    {
      id: '3',
      patientName: 'Сидоров Алексей Петрович',
      date: '2024-03-19',
      time: '15:00',
      status: 'cancelled',
    },
  ]);

  const getStatusColor = (status: Consultation['status']) => {
    switch (status) {
      case 'completed':
        return COLORS.light.success;
      case 'cancelled':
        return COLORS.light.error;
      default:
        return COLORS.light.warning;
    }
  };

  const getStatusText = (status: Consultation['status']) => {
    switch (status) {
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Запланирован';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>История консультаций</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{consultations.length}</Text>
            <Text style={styles.statLabel}>Всего консультаций</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {consultations.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Успешных</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {consultations.map(consultation => (
          <View key={consultation.id} style={styles.consultationCard}>
            <View style={styles.consultationHeader}>
              <View>
                <Text style={styles.patientName}>{consultation.patientName}</Text>
                <Text style={styles.dateTime}>
                  {consultation.date} в {consultation.time}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(consultation.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(consultation.status)}</Text>
              </View>
            </View>

            {consultation.status === 'completed' && (
              <View style={styles.consultationDetails}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="medkit"
                    size={20}
                    color={COLORS.light.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>Диагноз: {consultation.diagnosis}</Text>
                </View>
                {consultation.notes && (
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={COLORS.light.primary}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>Рекомендации: {consultation.notes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  consultationCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  consultationDetails: {
    marginTop: 12,
  },
  consultationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  dateTime: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  detailText: {
    color: COLORS.light.text,
    flex: 1,
    fontSize: 14,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  patientName: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
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
    marginTop: 16,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: COLORS.light.whiteBackground,
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ConsultationHistoryScreen;
