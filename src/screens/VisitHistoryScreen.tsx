import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';

// Импортируем компоненты из атомарной дизайн-системы
import { Text } from '../components/ui/atoms/Text';
import { Card } from '../components/ui/atoms/Card';
import { Badge } from '../components/ui/atoms/Badge';
import { Icon } from '../components/ui/atoms/Icon';
import { ListItem } from '../components/ui/molecules/ListItem';
import { COLORS } from '../theme/colors';

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
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;

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
        return theme.success;
      case 'cancelled':
        return theme.danger;
      case 'upcoming':
        return theme.primary;
      default:
        return theme.text.secondary;
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

  const styles = StyleSheet.create({
    appointmentCard: {
      marginBottom: 12,
    },
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    dateInfo: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 12,
    },
    dateText: {
      color: theme.text.secondary,
      marginLeft: 8,
    },
    diagnosisContainer: {
      marginTop: 12,
    },
    doctorName: {
      color: theme.text.primary,
      fontSize: 16,
    },
    headerCard: {
      margin: 16,
      padding: 20,
    },
    headerStats: {
      flexDirection: 'row',
      marginTop: 16,
    },
    headerText: {
      color: theme.text.primary,
      fontSize: 24,
    },
    specialty: {
      color: theme.text.secondary,
      fontSize: 14,
      marginTop: 4,
    },
    statContainer: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      color: theme.text.secondary,
      marginTop: 4,
    },
    statNumber: {
      color: theme.primary,
      fontSize: 24,
      fontWeight: 'bold',
    },
    visitContainer: {
      padding: 16,
    },
    visitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    visitsContainer: {
      padding: 16,
      paddingTop: 0,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Text variant="title" style={styles.headerText}>
          История посещений
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statContainer}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Всего посещений</Text>
          </View>
          <View style={styles.statContainer}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Предстоящих</Text>
          </View>
        </View>
      </Card>

      <View style={styles.visitsContainer}>
        {visits.map(visit => (
          <Card key={visit.id} style={styles.appointmentCard}>
            <View style={styles.visitContainer}>
              <View style={styles.visitHeader}>
                <View>
                  <Text variant="subtitle" style={styles.doctorName}>
                    {visit.doctorName}
                  </Text>
                  <Text style={styles.specialty}>{visit.specialty}</Text>
                </View>
                <Badge
                  label={getStatusText(visit.status)}
                  containerStyle={{ backgroundColor: getStatusColor(visit.status) }}
                />
              </View>

              <View style={styles.dateInfo}>
                <Icon name="calendar" family="ionicons" size={16} color={theme.text.secondary} />
                <Text style={styles.dateText}>
                  {visit.date} в {visit.time}
                </Text>
              </View>

              {visit.status === 'completed' && visit.diagnosis && (
                <View style={styles.diagnosisContainer}>
                  <ListItem
                    title="Диагноз"
                    subtitle={visit.diagnosis}
                    leftContent={
                      <Icon
                        name="medical"
                        family="ionicons"
                        size={16}
                        color={theme.text.secondary}
                      />
                    }
                    showDivider={!!visit.recommendations}
                  />
                  {visit.recommendations && (
                    <ListItem
                      title="Рекомендации"
                      subtitle={visit.recommendations}
                      leftContent={
                        <Icon
                          name="document-text"
                          family="ionicons"
                          size={16}
                          color={theme.text.secondary}
                        />
                      }
                    />
                  )}
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

export default VisitHistoryScreen;
