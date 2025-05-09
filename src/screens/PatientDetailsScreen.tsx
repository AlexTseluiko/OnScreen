import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import { getPatientDetails } from '../services/patientService';
import { Patient } from '../types/patient';

type PatientDetailsRouteProp = RouteProp<RootStackParamList, 'PatientDetails'>;

export const PatientDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<PatientDetailsRouteProp>();
  const { patientId } = route.params;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await getPatientDetails(patientId);
        setPatient(data);
        setError(null);
      } catch (err) {
        setError(t('errors.failedToLoadPatient'));
        console.error('Error fetching patient details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patientId, t]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('errors.patientNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.personalInfo')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.name')}:</Text>
          <Text style={styles.value}>{patient.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.age')}:</Text>
          <Text style={styles.value}>{patient.age}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.gender')}:</Text>
          <Text style={styles.value}>{patient.gender}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.contactInfo')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.phone')}:</Text>
          <Text style={styles.value}>{patient.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.email')}:</Text>
          <Text style={styles.value}>{patient.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.medicalInfo')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.bloodType')}:</Text>
          <Text style={styles.value}>{patient.bloodType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('patient.allergies')}:</Text>
          <Text style={styles.value}>
            {patient.allergies?.length ? patient.allergies.join(', ') : t('patient.noAllergies')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t('patient.viewMedicalHistory')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  buttonText: {
    color: COLORS.light.whiteText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
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
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    color: COLORS.light.textSecondary,
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    backgroundColor: COLORS.light.whiteBackground,
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.light.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  value: {
    color: COLORS.light.text,
    flex: 2,
    fontSize: 16,
  },
});
