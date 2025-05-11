import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';
import { Card } from '../molecules/Card';
import { useApiPerformance, ApiPerformanceStats } from '../../hooks/useApiPerformance';
import { Divider } from '../atoms/Divider';

interface ApiPerformanceMonitorProps {
  refreshInterval?: number; // интервал обновления в миллисекундах
  maxItems?: number; // максимальное количество элементов для отображения
}

export const ApiPerformanceMonitor: React.FC<ApiPerformanceMonitorProps> = ({
  refreshInterval = 10000,
  maxItems = 10,
}) => {
  const { theme } = useTheme();
  const { getAllStats, getSlowestEndpoints, getMostErrorProneEndpoints, resetStats } =
    useApiPerformance();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Record<string, ApiPerformanceStats>>({});
  const [slowestEndpoints, setSlowestEndpoints] = useState<ApiPerformanceStats[]>([]);
  const [errorProneEndpoints, setErrorProneEndpoints] = useState<ApiPerformanceStats[]>([]);

  // Загрузка данных
  const loadData = () => {
    const currentStats = getAllStats();
    setStats(currentStats);
    setSlowestEndpoints(getSlowestEndpoints(maxItems));
    setErrorProneEndpoints(getMostErrorProneEndpoints(maxItems));
  };

  // Обработчик обновления при свайпе вниз
  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  // Сброс статистики
  const handleReset = () => {
    resetStats();
    loadData();
  };

  // Периодическое обновление данных
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Форматирование времени
  const formatTime = (milliseconds: number) => {
    return milliseconds < 1000
      ? `${Math.round(milliseconds)} мс`
      : `${(milliseconds / 1000).toFixed(2)} с`;
  };

  // Форматирование процента
  const formatErrorRate = (endpoint: ApiPerformanceStats) => {
    const total = endpoint.totalCalls || 1;
    const rate = (endpoint.errorCount / total) * 100;
    return `${rate.toFixed(1)}%`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="title">Производительность API</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={{ color: theme.colors.primary }}>Сбросить статистику</Text>
        </TouchableOpacity>
      </View>

      <Text variant="subtitle" style={styles.sectionTitle}>
        Общая информация
      </Text>
      <Card style={styles.card}>
        <Text variant="body">
          Всего запросов:{' '}
          {Object.values(stats).reduce((sum, endpoint) => sum + endpoint.totalCalls, 0)}
        </Text>
        <Text variant="body">
          Успешных запросов:{' '}
          {Object.values(stats).reduce((sum, endpoint) => sum + endpoint.successCount, 0)}
        </Text>
        <Text variant="body">
          Ошибочных запросов:{' '}
          {Object.values(stats).reduce((sum, endpoint) => sum + endpoint.errorCount, 0)}
        </Text>
      </Card>

      <Text variant="subtitle" style={styles.sectionTitle}>
        Самые медленные запросы
      </Text>
      <Card style={styles.card}>
        {slowestEndpoints.length === 0 ? (
          <Text variant="body">Нет данных</Text>
        ) : (
          slowestEndpoints.map((endpoint, index) => (
            <View key={endpoint.endpoint}>
              <View style={styles.endpointRow}>
                <View style={styles.endpointInfo}>
                  <Text variant="subtitle" style={styles.endpointName}>
                    {index + 1}. {endpoint.endpoint}
                  </Text>
                  <Text variant="caption">
                    Всего запросов: {endpoint.totalCalls} | Ошибок: {endpoint.errorCount}
                  </Text>
                </View>
                <Text
                  variant="body"
                  style={[
                    styles.responseTime,
                    {
                      color:
                        endpoint.avgResponseTime > 1000
                          ? theme.colors.danger
                          : endpoint.avgResponseTime > 500
                            ? theme.colors.warning
                            : theme.colors.success,
                    },
                  ]}
                >
                  {formatTime(endpoint.avgResponseTime)}
                </Text>
              </View>
              {index < slowestEndpoints.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>

      <Text variant="subtitle" style={styles.sectionTitle}>
        Запросы с наибольшим числом ошибок
      </Text>
      <Card style={styles.card}>
        {errorProneEndpoints.length === 0 ? (
          <Text variant="body">Нет данных</Text>
        ) : (
          errorProneEndpoints.map((endpoint, index) => (
            <View key={endpoint.endpoint}>
              <View style={styles.endpointRow}>
                <View style={styles.endpointInfo}>
                  <Text variant="subtitle" style={styles.endpointName}>
                    {index + 1}. {endpoint.endpoint}
                  </Text>
                  <Text variant="caption">
                    Всего запросов: {endpoint.totalCalls} | Среднее время:{' '}
                    {formatTime(endpoint.avgResponseTime)}
                  </Text>
                </View>
                <Text
                  variant="body"
                  style={[
                    styles.errorRate,
                    {
                      color:
                        endpoint.errorCount / endpoint.totalCalls > 0.3
                          ? theme.colors.danger
                          : endpoint.errorCount / endpoint.totalCalls > 0.1
                            ? theme.colors.warning
                            : theme.colors.text.primary,
                    },
                  ]}
                >
                  {formatErrorRate(endpoint)}
                </Text>
              </View>
              {index < errorProneEndpoints.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  endpointInfo: {
    flex: 1,
  },
  endpointName: {
    fontWeight: 'bold',
  },
  endpointRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  errorRate: {
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  responseTime: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 16,
  },
});

export default ApiPerformanceMonitor;
