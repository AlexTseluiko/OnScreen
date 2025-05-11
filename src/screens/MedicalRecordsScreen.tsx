import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/AppNavigation';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

type MedicalRecordsScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'MedicalRecordDetails'
>;

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  type: 'consultation' | 'test' | 'procedure';
}

// Демо-данные для отображения
const demoRecords: MedicalRecord[] = [
  {
    id: '1',
    date: '10.06.2023',
    doctorName: 'Иванов И.И.',
    diagnosis: 'Острый бронхит',
    type: 'consultation',
  },
  {
    id: '2',
    date: '15.05.2023',
    doctorName: 'Петрова Е.С.',
    diagnosis: 'Клинический анализ крови',
    type: 'test',
  },
  {
    id: '3',
    date: '03.04.2023',
    doctorName: 'Сидоров А.В.',
    diagnosis: 'Магнитно-резонансная томография',
    type: 'procedure',
  },
  {
    id: '4',
    date: '21.03.2023',
    doctorName: 'Козлова Н.П.',
    diagnosis: 'Вазомоторный ринит',
    type: 'consultation',
  },
  {
    id: '5',
    date: '15.02.2023',
    doctorName: 'Иванов И.И.',
    diagnosis: 'Профилактический осмотр',
    type: 'consultation',
  },
];

// Функция для получения иконки в зависимости от типа записи
const getIconByType = (type: MedicalRecord['type']) => {
  switch (type) {
    case 'consultation':
      return 'medical';
    case 'test':
      return 'flask';
    case 'procedure':
      return 'pulse';
    default:
      return 'document-text';
  }
};

export const MedicalRecordsScreen: React.FC = () => {
  const navigation = useNavigation<MedicalRecordsScreenNavigationProp>();
  const [records] = useState<MedicalRecord[]>(demoRecords);

  const handleRecordPress = (recordId: string) => {
    navigation.navigate('MedicalRecordDetails', {
      recordId,
      patientName: 'Пациент',
    });
  };

  const renderRecord = ({ item }: { item: MedicalRecord }) => (
    <TouchableOpacity style={styles.recordItem} onPress={() => handleRecordPress(item.id)}>
      <View style={styles.recordIcon}>
        <Ionicons name={getIconByType(item.type)} size={24} color={COLORS.light.primary} />
      </View>
      <View style={styles.recordContent}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <Text style={styles.recordDoctor}>{item.doctorName}</Text>
        <Text style={styles.recordDiagnosis}>{item.diagnosis}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.light.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Медицинская карта</Text>
      </View>

      {records.length > 0 ? (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={64} color={COLORS.light.text.secondary} />
          <Text style={styles.emptyText}>У вас пока нет медицинских записей</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.light.text.secondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.light.border,
    borderBottomWidth: 1,
    paddingBottom: 16,
    paddingTop: 20,
  },
  headerTitle: {
    color: COLORS.light.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  recordContent: {
    flex: 1,
    marginLeft: 12,
  },
  recordDate: {
    color: COLORS.light.text.secondary,
    fontSize: 14,
  },
  recordDiagnosis: {
    color: COLORS.light.text.primary,
    fontSize: 16,
  },
  recordDoctor: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  recordIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  recordItem: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
