import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ClinicStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  revenue: number;
}

interface DoctorRequest {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

const ClinicManagementScreen: React.FC = () => {
  useAuth();
  const [stats] = useState<ClinicStats>({
    totalDoctors: 25,
    totalPatients: 1500,
    totalAppointments: 320,
    revenue: 1500000,
  });

  const [doctorRequests] = useState<DoctorRequest[]>([
    {
      id: '1',
      name: 'Иванов Иван Иванович',
      specialty: 'Терапевт',
      experience: 10,
      documents: ['Диплом', 'Сертификат'],
      status: 'pending',
    },
    {
      id: '2',
      name: 'Петрова Мария Сергеевна',
      specialty: 'Кардиолог',
      experience: 15,
      documents: ['Диплом', 'Сертификат', 'Лицензия'],
      status: 'pending',
    },
  ]);

  const handleApproveRequest = (id: string) => {
    // Здесь будет логика одобрения заявки
    console.log('Одобрение заявки:', id);
  };

  const handleRejectRequest = (id: string) => {
    // Здесь будет логика отклонения заявки
    console.log('Отклонение заявки:', id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Управление клиникой</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalDoctors}</Text>
            <Text style={styles.statLabel}>Врачей</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPatients}</Text>
            <Text style={styles.statLabel}>Пациентов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Приемов</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(stats.revenue)}</Text>
            <Text style={styles.statLabel}>Доход</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Заявки врачей</Text>
        {doctorRequests.map(request => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View>
                <Text style={styles.doctorName}>{request.name}</Text>
                <Text style={styles.specialty}>{request.specialty}</Text>
                <Text style={styles.experienceText}>Опыт работы: {request.experience} лет</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>На рассмотрении</Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <Text style={styles.documentsTitle}>Документы:</Text>
              {request.documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Ionicons name="document-text" size={16} color={COLORS.light.primary} />
                  <Text style={styles.documentName}>{doc}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveRequest(request.id)}
              >
                <Ionicons name="checkmark" size={16} color={COLORS.light.whiteBackground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectRequest(request.id)}
              >
                <Ionicons name="close" size={16} color={COLORS.light.whiteBackground} />
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
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
    width: 36,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  approveButton: {
    backgroundColor: COLORS.light.success,
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
  documentItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  documentName: {
    color: COLORS.light.text,
    fontSize: 14,
    marginLeft: 8,
  },
  documentsTitle: {
    color: COLORS.light.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  experienceText: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
  },
  header: {
    backgroundColor: COLORS.light.whiteBackground,
    padding: 20,
  },
  rejectButton: {
    backgroundColor: COLORS.light.error,
  },
  requestCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  requestDetails: {
    marginTop: 12,
  },
  requestHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.light.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  specialty: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    marginTop: 2,
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
    backgroundColor: COLORS.light.warning,
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

export default ClinicManagementScreen;
