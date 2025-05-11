import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { EmptyState } from '../molecules/EmptyState';

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
  doctorId: string;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = ({ doctorId }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      setError(t('errors.failedToLoadPatients'));
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

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
    <TouchableOpacity
      style={[
        styles.patientCard,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
        },
      ]}
      onPress={() => handlePatientPress(item)}
    >
      <View style={styles.patientInfo}>
        <Text variant="title" style={{ color: theme.colors.text.primary, marginBottom: 4 }}>
          {item.firstName} {item.lastName}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text.secondary, marginTop: 2 }}>
          {item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : t('patient.noBirthDate')}
        </Text>
        {item.phone && (
          <Text variant="body" style={{ color: theme.colors.text.secondary, marginTop: 2 }}>
            {item.phone}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text
          variant="body"
          style={{ color: theme.colors.danger, marginBottom: 16, textAlign: 'center' }}
        >
          {error}
        </Text>
        <Button title={t('common.retry')} onPress={loadPatients} variant="primary" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('patient.noPatients')}
            description={t('patient.noPatientsDescription')}
            icon="people-outline"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  patientCard: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientInfo: {
    flex: 1,
  },
});
