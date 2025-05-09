import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface LogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const ActionLogsScreen: React.FC = () => {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      action: 'Вход в систему',
      user: 'Иванов И.И.',
      timestamp: '2024-03-20 10:30',
      details: 'Успешный вход в систему',
      type: 'success',
    },
    {
      id: '2',
      action: 'Изменение настроек',
      user: 'Петрова М.С.',
      timestamp: '2024-03-20 10:15',
      details: 'Изменены настройки уведомлений',
      type: 'info',
    },
    {
      id: '3',
      action: 'Ошибка доступа',
      user: 'Сидоров А.П.',
      timestamp: '2024-03-20 09:45',
      details: 'Попытка доступа к запрещенному разделу',
      type: 'error',
    },
    {
      id: '4',
      action: 'Обновление данных',
      user: 'Система',
      timestamp: '2024-03-20 09:00',
      details: 'Автоматическое обновление базы данных',
      type: 'info',
    },
  ]);

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return COLORS.light.success;
      case 'warning':
        return COLORS.light.warning;
      case 'error':
        return COLORS.light.error;
      default:
        return COLORS.light.primary;
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Журнал действий</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Всего записей</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{logs.filter(log => log.type === 'error').length}</Text>
            <Text style={styles.statLabel}>Ошибок</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {logs.map(log => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logTypeContainer}>
                <Ionicons name={getTypeIcon(log.type)} size={20} color={getTypeColor(log.type)} />
                <Text style={[styles.logType, { color: getTypeColor(log.type) }]}>
                  {log.action}
                </Text>
              </View>
              <Text style={styles.timestamp}>{log.timestamp}</Text>
            </View>

            <View style={styles.logDetails}>
              <Text style={styles.userText}>Пользователь: {log.user}</Text>
              <Text style={styles.detailsText}>{log.details}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color={COLORS.light.whiteBackground} />
          <Text style={styles.exportButtonText}>Экспорт журнала</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  detailsText: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  exportButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  exportButtonText: {
    color: COLORS.light.whiteBackground,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  logCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  logDetails: {
    marginTop: 12,
  },
  logHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logType: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  logTypeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
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
  timestamp: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userText: {
    color: COLORS.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ActionLogsScreen;
