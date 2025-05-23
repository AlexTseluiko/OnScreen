import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clinic } from '../../types/clinic';
import { COLORS } from '../../theme/colors';

interface ClinicInfoProps {
  clinic: Clinic;
}

export const ClinicInfo: React.FC<ClinicInfoProps> = ({ clinic }) => {
  const formatWorkingHours = (hours: Clinic['workingHours']) => {
    return Object.entries(hours)
      .map(([day, schedule]) => {
        if (typeof schedule === 'string') {
          return `${day}: ${schedule}`;
        }
        return `${day}: ${schedule.open} - ${schedule.close}`;
      })
      .join('\n');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Информация о клинике</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Телефон:</Text>
        <Text style={styles.value}>{clinic.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Режим работы:</Text>
        <Text style={styles.value}>{formatWorkingHours(clinic.workingHours)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Описание:</Text>
        <Text style={styles.value}>{clinic.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.palette.white,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    color: COLORS.palette.secondary,
    flex: 1,
    fontSize: 16,
  },
  title: {
    color: COLORS.palette.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  value: {
    color: COLORS.palette.primary,
    flex: 2,
    fontSize: 16,
  },
});
