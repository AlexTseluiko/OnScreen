import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Visit {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'upcoming';
  diagnosis?: string;
  recommendations?: string;
}

const VisitHistoryScreen: React.FC = () => {
  useAuth();
  const [visits] = useState<Visit[]>([
    {
      id: '1',
      doctorName: 'Доктор Иванов',
      specialty: 'Терапевт',
      date: '15.03.2024',
      time: '10:00',
      status: 'completed',
      diagnosis: 'ОРВИ',
      recommendations: 'Постельный режим, обильное питье',
    },
    {
      id: '2',
      doctorName: 'Доктор Петрова',
      specialty: 'Кардиолог',
      date: '20.03.2024',
      time: '15:30',
      status: 'upcoming',
    },
    {
      id: '3',
      doctorName: 'Доктор Сидоров',
      specialty: 'Невролог',
      date: '10.03.2024',
      time: '11:00',
      status: 'cancelled',
    },
  ]);

  const getStatusColor = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return COLORS.light.success;
      case 'cancelled':
        return COLORS.light.error;
      case 'upcoming':
        return COLORS.light.primary;
      default:
        return COLORS.light.textSecondary;
    }
  };

  const getStatusText = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      case 'upcoming':
        return 'Предстоит';
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>История посещений</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Всего посещений</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Предстоящих</Text>
          </View>
        </View>
      </View>

      <View style={styles.visitsContainer}>
        {visits.map(visit => (
          <TouchableOpacity key={visit.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <View>
                <Text style={styles.doctorName}>{visit.doctorName}</Text>
                <Text style={styles.specialty}>{visit.specialty}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visit.status) }]}>
                <Text style={styles.statusText}>{getStatusText(visit.status)}</Text>
              </View>
            </View>

            <View style={styles.visitDateTime}>
              <Ionicons name="calendar" size={16} color={COLORS.light.textSecondary} />
              <Text style={styles.dateTimeText}>
                {visit.date} в {visit.time}
              </Text>
            </View>

            {visit.status === 'completed' && visit.diagnosis && (
              <View style={styles.visitDetails}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="medical"
                    size={20}
                    color={COLORS.light.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>Диагноз: {visit.diagnosis}</Text>
                </View>
                {visit.recommendations && (
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={COLORS.light.primary}
                      style={styles.detailIcon}
                    />
                    <Text style={styles.detailText}>Рекомендации: {visit.recommendations}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  dateTimeText: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginLeft: 8,
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
  doctorName: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
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
  visitCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  visitDateTime: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  visitDetails: {
    marginTop: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visitsContainer: {
    padding: 16,
  },
});

export default VisitHistoryScreen;
