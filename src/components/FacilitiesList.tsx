import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { facilitiesApi, Facility } from '../api/facilities';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FacilitiesList: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getAll();
      setFacilities(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке учреждений');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Начальная загрузка
  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  // Периодическое обновление каждые 30 секунд
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFacilities();
    }, 30000); // 30 секунд

    return () => clearInterval(intervalId);
  }, [loadFacilities]);

  const renderFacility = ({ item }: { item: Facility }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => navigation.navigate('FacilityDetails', { facilityId: item.id })}
    >
      {item.images[0] && (
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
          {item.services.slice(0, 3).map((service, index) => (
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
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  facilityAddress: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  facilityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#FFA500',
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
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviews: {
    color: '#666',
    fontSize: 14,
  },
  serviceTag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    color: '#2E7D32',
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
