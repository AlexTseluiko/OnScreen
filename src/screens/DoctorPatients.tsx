import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { doctorApi, Patient } from '../services/doctorApi';
import { useTheme } from '../theme/ThemeContext';
import { COLORS } from '../constants';

const DoctorPatients: React.FC = () => {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { theme } = useTheme();

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getPatients();
      setPatients(response.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const renderPatient = ({ item }: { item: Patient }) => (
    <View style={[styles.patientCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.patientName, { color: theme.colors.text }]}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={[styles.patientInfo, { color: theme.colors.textSecondary }]}>
        Email: {item.email}
      </Text>
      {item.phone && (
        <Text style={[styles.patientInfo, { color: theme.colors.textSecondary }]}>
          Телефон: {item.phone}
        </Text>
      )}
      <Text style={[styles.patientInfo, { color: theme.colors.textSecondary }]}>
        Дата рождения: {new Date(item.dateOfBirth).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchPatients}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  patientCard: {
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default DoctorPatients;
