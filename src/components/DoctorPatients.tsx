import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { doctorsApi } from '../api/doctorsApi';
import { Ionicons } from '@expo/vector-icons';
import { DefaultAvatar } from './DefaultAvatar';

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

interface DoctorPatientsProps {
  doctorId: string;
  onSelectPatient?: (patient: Patient) => void;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = ({
  doctorId,
  onSelectPatient,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorsApi.getDoctorPatients(doctorId);
      setPatients(response.data.patients);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [doctorId]);

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[styles.patientCard, { backgroundColor: theme.colors.card }]}
      onPress={() => onSelectPatient?.(item)}
    >
      <View style={styles.patientCard}>
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.patientPhoto}
          />
        ) : (
          <DefaultAvatar size={50} />
        )}
        <View style={styles.patientInfo}>
          <Text style={[styles.patientName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          {item.lastVisit && (
            <Text style={[styles.visitInfo, { color: theme.colors.textSecondary }]}>
              {t('lastVisit')}: {new Date(item.lastVisit).toLocaleDateString()}
            </Text>
          )}
          {item.nextAppointment && (
            <Text style={[styles.visitInfo, { color: theme.colors.textSecondary }]}>
              {t('nextAppointment')}: {new Date(item.nextAppointment).toLocaleDateString()}
            </Text>
          )}
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.error }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'active' ? t('active') : t('inactive')}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadPatients}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={patients}
        renderItem={renderPatientCard}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('noPatientsFound')}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  patientInfo: {
    flex: 1,
    marginLeft: 15,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visitInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    margin: 10,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
  },
}); 