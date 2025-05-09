import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';

export const MedicalCardScreen: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('auth.pleaseLogin')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('medicalCard.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('medicalCard.personalInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('medicalCard.name')}:</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('medicalCard.email')}:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('medicalCard.medicalInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('medicalCard.bloodType')}:</Text>
            <Text style={styles.value}>{user.bloodType || t('medicalCard.notSpecified')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('medicalCard.allergies')}:</Text>
            <Text style={styles.value}>
              {user.allergies?.length ? user.allergies.join(', ') : t('medicalCard.notSpecified')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 8,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    color: COLORS.light.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.light.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: COLORS.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  value: {
    color: COLORS.light.text,
    flex: 2,
    fontSize: 16,
  },
});
