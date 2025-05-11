import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Получаем ширину экрана для графиков
const screenWidth = Dimensions.get('window').width;

// Демо-данные для аналитики
interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  patientsByAge: {
    '0-18': number;
    '19-35': number;
    '36-50': number;
    '51-65': number;
    '65+': number;
  };
  appointmentsByType: {
    online: number;
    offline: number;
  };
  revenueByMonth: {
    Янв: number;
    Фев: number;
    Мар: number;
    Апр: number;
    Май: number;
    Июн: number;
  };
  appointmentsByDay: {
    Пн: number;
    Вт: number;
    Ср: number;
    Чт: number;
    Пт: number;
    Сб: number;
    Вс: number;
  };
  topDoctors: Array<{
    id: string;
    name: string;
    appointments: number;
    rating: number;
  }>;
}

const ClinicAnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPatients: 1250,
    totalAppointments: 3150,
    completedAppointments: 2800,
    cancelledAppointments: 350,
    averageRating: 4.7,
    patientsByAge: {
      '0-18': 180,
      '19-35': 420,
      '36-50': 380,
      '51-65': 200,
      '65+': 70,
    },
    appointmentsByType: {
      online: 1200,
      offline: 1950,
    },
    revenueByMonth: {
      Янв: 950000,
      Фев: 1050000,
      Мар: 1200000,
      Апр: 1150000,
      Май: 1300000,
      Июн: 1450000,
    },
    appointmentsByDay: {
      Пн: 120,
      Вт: 150,
      Ср: 135,
      Чт: 145,
      Пт: 160,
      Сб: 90,
      Вс: 50,
    },
    topDoctors: [
      { id: '1', name: 'Иванов И.И.', appointments: 420, rating: 4.9 },
      { id: '2', name: 'Петров П.П.', appointments: 380, rating: 4.8 },
      { id: '3', name: 'Сидорова А.С.', appointments: 350, rating: 4.7 },
      { id: '4', name: 'Козлов К.К.', appointments: 310, rating: 4.6 },
      { id: '5', name: 'Смирнова С.С.', appointments: 280, rating: 4.5 },
    ],
  });

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Загрузка данных аналитики
  useEffect(() => {
    // Симулируем загрузку данных
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);

    // В реальном приложении здесь будет запрос к API
    // fetchAnalyticsData();
  }, [timeRange]);

  // Подготовка данных для графиков
  const prepareRevenueData = () => {
    const labels = Object.keys(analytics.revenueByMonth);
    const data = Object.values(analytics.revenueByMonth).map(value => value / 1000); // Конвертируем в тысячи для удобства отображения

    return {
      labels,
      datasets: [
        {
          data,
          color: () => COLORS.light.primary,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareAppointmentsByDayData = () => {
    const labels = Object.keys(analytics.appointmentsByDay);
    const data = Object.values(analytics.appointmentsByDay);

    return {
      labels,
      datasets: [
        {
          data,
          color: () => COLORS.light.primary,
        },
      ],
    };
  };

  const preparePatientsByAgeData = () => {
    const data = [
      analytics.patientsByAge['0-18'],
      analytics.patientsByAge['19-35'],
      analytics.patientsByAge['36-50'],
      analytics.patientsByAge['51-65'],
      analytics.patientsByAge['65+'],
    ];

    return {
      labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
      datasets: [
        {
          data,
          colors: [
            () => COLORS.light.primary,
            () => COLORS.light.secondary,
            () => COLORS.light.success,
            () => COLORS.light.warning,
            () => COLORS.light.error,
          ],
        },
      ],
    };
  };

  const prepareAppointmentsByTypeData = () => {
    const data = [analytics.appointmentsByType.online, analytics.appointmentsByType.offline];

    return {
      labels: ['Онлайн', 'Очно'],
      data,
      backgroundColor: [COLORS.light.primary, COLORS.light.success],
      color: (opacity = 1) => COLORS.light.text,
    };
  };

  // Расчет процента завершенных приемов
  const calculateCompletionRate = () => {
    return ((analytics.completedAppointments / analytics.totalAppointments) * 100).toFixed(1);
  };

  // Если загрузка
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
        <Text style={styles.loadingText}>Загрузка аналитики...</Text>
      </View>
    );
  }

  // Если ошибка
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.light.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)} // В реальном приложении здесь будет повторный запрос данных
        >
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Аналитика клиники</Text>

        {/* Переключатель временного интервала */}
        <View style={styles.timeRangeSelector}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('week')}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === 'week' && styles.timeRangeButtonTextActive,
              ]}
            >
              Неделя
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('month')}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === 'month' && styles.timeRangeButtonTextActive,
              ]}
            >
              Месяц
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'year' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('year')}
          >
            <Text
              style={[
                styles.timeRangeButtonText,
                timeRange === 'year' && styles.timeRangeButtonTextActive,
              ]}
            >
              Год
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Краткая статистика */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={COLORS.light.primary} />
          <Text style={styles.statValue}>{analytics.totalPatients}</Text>
          <Text style={styles.statLabel}>Пациентов</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={COLORS.light.success} />
          <Text style={styles.statValue}>{analytics.totalAppointments}</Text>
          <Text style={styles.statLabel}>Приемов</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.light.info} />
          <Text style={styles.statValue}>{calculateCompletionRate()}%</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color={COLORS.light.warning} />
          <Text style={styles.statValue}>{analytics.averageRating}</Text>
          <Text style={styles.statLabel}>Рейтинг</Text>
        </View>
      </View>

      {/* График дохода */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Доход (тыс. руб.)</Text>
        <LineChart
          data={prepareRevenueData()}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => `rgba(54, 162, 235, 1)`,
            labelColor: () => `rgba(0, 0, 0, 1)`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: COLORS.light.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* График приемов по дням недели */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Приемы по дням недели</Text>
        <BarChart
          data={prepareAppointmentsByDayData()}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => `rgba(75, 192, 192, 1)`,
            labelColor: () => `rgba(0, 0, 0, 1)`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
          }}
          style={styles.chart}
        />
      </View>

      {/* Распределение пациентов по возрасту */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Пациенты по возрастным группам</Text>
        <BarChart
          data={preparePatientsByAgeData()}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => `rgba(255, 99, 132, 1)`,
            labelColor: () => `rgba(0, 0, 0, 1)`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
          }}
          style={styles.chart}
          fromZero
        />
      </View>

      {/* Типы приемов */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Типы приемов</Text>
        <PieChart
          data={[
            {
              name: 'Онлайн',
              population: analytics.appointmentsByType.online,
              color: COLORS.light.primary,
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
            {
              name: 'Очно',
              population: analytics.appointmentsByType.offline,
              color: COLORS.light.success,
              legendFontColor: '#7F7F7F',
              legendFontSize: 15,
            },
          ]}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => `rgba(0, 0, 0, 1)`,
            labelColor: () => `rgba(0, 0, 0, 1)`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Топ врачей */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Лучшие врачи</Text>
        {analytics.topDoctors.map((doctor, index) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorRank}>{index + 1}</Text>
              <Text style={styles.doctorName}>{doctor.name}</Text>
            </View>
            <View style={styles.doctorStats}>
              <View style={styles.doctorStat}>
                <Text style={styles.doctorStatValue}>{doctor.appointments}</Text>
                <Text style={styles.doctorStatLabel}>Приемов</Text>
              </View>
              <View style={styles.doctorStat}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.doctorStatValue}>{doctor.rating}</Text>
                  <Ionicons name="star" size={14} color={COLORS.light.warning} />
                </View>
                <Text style={styles.doctorStatLabel}>Рейтинг</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  doctorCard: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  doctorInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  doctorName: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10,
  },
  doctorRank: {
    color: COLORS.light.primary,
    fontSize: 18,
    fontWeight: 'bold',
    width: 24,
  },
  doctorStat: {
    alignItems: 'center',
    marginLeft: 15,
  },
  doctorStatLabel: {
    color: '#666',
    fontSize: 12,
  },
  doctorStatValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorStats: {
    flexDirection: 'row',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '48%',
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  statValue: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
  },
  timeRangeButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    paddingVertical: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.light.primary,
  },
  timeRangeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: '#fff',
  },
  timeRangeSelector: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 4,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default ClinicAnalyticsScreen;
