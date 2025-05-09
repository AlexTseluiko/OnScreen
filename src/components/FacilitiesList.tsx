import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { facilitiesApi } from '../api/facilities';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Facility } from '../types/facility';
import { COLORS } from '../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FacilitiesListProps {
  facilities: Facility[];
  onFacilityPress?: (facility: Facility) => void;
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({
  facilities,
  onFacilityPress: _onFacilityPress,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      await facilitiesApi.getAll();
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке учреждений');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFacilities();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadFacilities]);

  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => navigation.navigate('FacilityDetails', { facilityId: item.id })}
    >
      {item.images?.[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.facilityImage} resizeMode="cover" />
      )}
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <Text style={styles.facilityAddress}>{item.address}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({item.reviews} отзывов)</Text>
        </View>
        <View style={styles.servicesContainer}>
          {item.services.slice(0, 3).map((service: string, index: number) => (
            <Text key={index} style={styles.serviceTag}>
              {service}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && facilities.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFacilities}>
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={facilities}
      renderItem={renderFacility}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      onRefresh={loadFacilities}
      refreshing={loading}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  facilityAddress: {
    color: COLORS.text.secondary.light,
    fontSize: 14,
    marginBottom: 8,
  },
  facilityCard: {
    backgroundColor: COLORS.background.light,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  facilityImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 200,
    width: '100%',
  },
  facilityInfo: {
    padding: 16,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listContainer: {
    padding: 16,
  },
  rating: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  reviews: {
    color: COLORS.text.secondary.light,
    fontSize: 14,
  },
  serviceTag: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    color: COLORS.success,
    fontSize: 12,
    marginBottom: 4,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
