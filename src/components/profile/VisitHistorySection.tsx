import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface Visit {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  recommendations: string;
}

interface VisitHistorySectionProps {
  visits: Visit[];
  onAddVisit: () => void;
  onViewVisit: (visit: Visit) => void;
}

export const VisitHistorySection: React.FC<VisitHistorySectionProps> = ({
  visits,
  onAddVisit,
  onViewVisit,
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('profile.visitHistory')}</Text>

      <ScrollView style={styles.visitsList}>
        {visits.map(visit => (
          <TouchableOpacity
            key={visit.id}
            style={styles.visitItem}
            onPress={() => onViewVisit(visit)}
          >
            <View style={styles.visitHeader}>
              <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>
              <Text style={styles.visitSpecialty}>{visit.specialty}</Text>
            </View>
            <Text style={styles.visitDoctor}>
              {t('profile.doctor')}: {visit.doctor}
            </Text>
            <Text style={styles.visitDiagnosis} numberOfLines={2}>
              {t('profile.diagnosis')}: {visit.diagnosis}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={onAddVisit}>
        <Text style={styles.addButtonText}>{t('profile.addVisit')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  visitDate: {
    color: COLORS.gray,
    fontSize: 14,
  },
  visitDiagnosis: {
    color: COLORS.gray,
    fontSize: 14,
  },
  visitDoctor: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  visitItem: {
    borderBottomColor: COLORS.gray,
    borderBottomWidth: 1,
    padding: 12,
  },
  visitSpecialty: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  visitsList: {
    maxHeight: 300,
  },
});
