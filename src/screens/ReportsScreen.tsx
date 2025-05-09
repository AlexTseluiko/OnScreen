import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'medical' | 'analytics';
  period: string;
  lastUpdated: string;
}

const ReportsScreen: React.FC = () => {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      title: 'Финансовый отчет',
      description: 'Доходы и расходы клиники за период',
      type: 'financial',
      period: 'Март 2024',
      lastUpdated: '2024-03-20',
    },
    {
      id: '2',
      title: 'Статистика посещений',
      description: 'Анализ посещаемости по специалистам',
      type: 'analytics',
      period: 'Март 2024',
      lastUpdated: '2024-03-19',
    },
    {
      id: '3',
      title: 'Медицинская статистика',
      description: 'Распределение диагнозов и методов лечения',
      type: 'medical',
      period: 'Март 2024',
      lastUpdated: '2024-03-18',
    },
  ]);

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'financial':
        return 'cash';
      case 'medical':
        return 'medkit';
      case 'analytics':
        return 'bar-chart';
      default:
        return 'document';
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'financial':
        return COLORS.light.success;
      case 'medical':
        return COLORS.light.primary;
      case 'analytics':
        return COLORS.light.warning;
      default:
        return COLORS.light.text;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Отчеты</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>Всего отчетов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {reports.filter(report => report.type === 'financial').length}
            </Text>
            <Text style={styles.statLabel}>Финансовых</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {reports.map(report => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTypeContainer}>
                <Ionicons
                  name={getTypeIcon(report.type)}
                  size={24}
                  color={getTypeColor(report.type)}
                />
                <View style={styles.reportTitleContainer}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportPeriod}>{report.period}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={20} color={COLORS.light.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.lastUpdated}>Последнее обновление: {report.lastUpdated}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.generateButton}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.light.whiteBackground} />
          <Text style={styles.generateButtonText}>Создать новый отчет</Text>
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
  downloadButton: {
    padding: 8,
  },
  generateButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  generateButtonText: {
    color: COLORS.light.whiteBackground,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  lastUpdated: {
    color: COLORS.light.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  reportCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  reportDescription: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  reportHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportPeriod: {
    color: COLORS.light.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reportTitle: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  reportTitleContainer: {
    marginLeft: 12,
  },
  reportTypeContainer: {
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
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ReportsScreen;
