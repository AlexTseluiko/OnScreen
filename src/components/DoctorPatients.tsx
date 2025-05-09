import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

type DoctorPatientsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
}

interface DoctorPatientsResponse {
  patients: Patient[];
}

interface DoctorPatientsProps {
  _doctorId: string;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = ({ _doctorId }) => {
  const navigation = useNavigation<DoctorPatientsScreenNavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Заменить на реальный API-вызов
      const response: DoctorPatientsResponse = {
        patients: [
          {
            _id: '1',
            firstName: 'Иван',
            lastName: 'Иванов',
            dateOfBirth: '1990-01-01',
            phone: '+7 (999) 123-45-67',
          },
        ],
      };
      setPatients(response.patients);
    } catch (err) {
      setError('Не удалось загрузить список пациентов');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handlePatientPress = (patient: Patient) => {
    navigation.navigate('PatientDetails', { patientId: patient._id });
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity style={styles.patientCard} onPress={() => handlePatientPress(item)}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.patientDetails}>
          {item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : 'Дата рождения не указана'}
        </Text>
        {item.phone && <Text style={styles.patientDetails}>{item.phone}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPatients}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.light.primary]}
            tintColor={COLORS.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>У вас пока нет пациентов</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.light.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  patientCard: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.light.semiTransparentBlack,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...TYPOGRAPHY.body1,
  },
  patientDetails: {
    ...TYPOGRAPHY.body2,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    ...TYPOGRAPHY.h5,
    color: COLORS.light.text,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.light.whiteText,
  },
});
