import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { Facility } from '../types/facility';
import { getShadowStyle } from '../theme/shadows';

interface FacilityItemProps {
  facility: Facility;
  onPress?: (facility: Facility) => void;
}

export const FacilityItem: React.FC<FacilityItemProps> = ({ facility, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, getShadowStyle(false)]}
      onPress={() => onPress?.(facility)}
      activeOpacity={0.7}
    >
      {facility.images?.[0] && (
        <Image source={{ uri: facility.images[0] }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{facility.name}</Text>
        <Text style={styles.address}>{facility.address}</Text>
        {facility.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {facility.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  address: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  image: {
    height: 150,
    width: '100%',
  },
  name: {
    color: COLORS.dark,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rating: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
