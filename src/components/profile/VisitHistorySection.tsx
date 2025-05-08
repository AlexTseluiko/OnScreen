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
        {visits.map((visit) => (
          <TouchableOpacity
            key={visit.id}
            style={styles.visitItem}
            onPress={() => onViewVisit(visit)}
          >
            <View style={styles.visitHeader}>
              <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>
              <Text style={styles.visitSpecialty}>{visit.specialty}</Text>
            </View>
            <Text style={styles.visitDoctor}>{t('profile.doctor')}: {visit.doctor}</Text>
            <Text style={styles.visitDiagnosis} numberOfLines={2}>
              {t('profile.diagnosis')}: {visit.diagnosis}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddVisit}
      >
        <Text style={styles.addButtonText}>{t('profile.addVisit')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
  },
  visitsList: {
    maxHeight: 300,
  },
  visitItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  visitDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  visitSpecialty: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  visitDoctor: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  visitDiagnosis: {
    fontSize: 14,
    color: COLORS.gray,
  },
  addButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 