import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Doctor } from '../types/doctor';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  onFavoritePress,
  isFavorite,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.colors.text.primary }]}>{doctor.name}</Text>
        <TouchableOpacity onPress={onFavoritePress}>
          <Icon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.specialization, { color: theme.colors.text.secondary }]}>
        {doctor.specialization}
      </Text>
      <Text style={[styles.rating, { color: theme.colors.text.secondary }]}>
        ⭐ {doctor.rating}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 14,
  },
  specialization: {
    fontSize: 14,
    marginBottom: 4,
  },
});
