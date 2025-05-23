import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Clinic } from '../../types/clinic';
import { COLORS } from '../../theme/colors';

interface ClinicHeaderProps {
  clinic: Clinic;
}

export const ClinicHeader: React.FC<ClinicHeaderProps> = ({ clinic }) => {
  const imageUrl = clinic.photos?.[0] || 'https://placehold.co/400x200/teal/white?text=Клиника';

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.name}>{clinic.name}</Text>
        <Text style={styles.address}>{clinic.address.street}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  address: {
    color: COLORS.palette.white,
    fontSize: 16,
  },
  container: {
    height: 200,
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  name: {
    color: COLORS.palette.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
});
