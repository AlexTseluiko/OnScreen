import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { facilitiesApi, Facility } from '../api/facilities';
import { clinicsApi, Clinic } from '../api/clinics';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Map } from '../components/Map';
import { INITIAL_REGION } from '../constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MedicalFacility } from '../types/medical';
import { calculateDistance } from '../utils/mapUtils';

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

// Тип для навигации
type FacilitiesMapScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Комбинированный тип маркера для карты
interface MapMarker {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: MedicalFacility['type'];
}

const RADIUS_OPTIONS = [
  { label: '1 км', value: 1000 },
  { label: '3 км', value: 3000 },
  { label: '5 км', value: 5000 },
  { label: '10 км', value: 10000 },
];

export const FacilitiesMapScreen: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<MedicalFacility['type'][]>(['hospital', 'clinic', 'pharmacy']);
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const [selectedRadius, setSelectedRadius] = useState(5000);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const navigation = useNavigation<FacilitiesMapScreenNavigationProp>();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем учреждения и клиники параллельно
      const [facilitiesData, clinicsData] = await Promise.all([
        facilitiesApi.getAll(),
        clinicsApi.getAll()
      ]);
      
      setFacilities(facilitiesData);
      setClinics(clinicsData);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Получаем местоположение пользователя
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (Platform.OS !== 'web' && Location) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Разрешение на использование геолокации не предоставлено');
            return;
          }
          
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        } else if (Platform.OS === 'web') {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setUserLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
              },
              (error) => {
                console.error('Ошибка при получении местоположения:', error);
              },
              { enableHighAccuracy: true }
            );
          }
        }
      } catch (error) {
        console.error('Ошибка получения местоположения:', error);
      }
    };

    getUserLocation();
  }, []);

  // Преобразуем данные в формат маркеров для карты
  useEffect(() => {
    const facilitiesMarkers: MapMarker[] = facilities
      .filter(facility => selectedTypes.includes(facility.type))
      .map(facility => ({
        id: facility.id,
        name: facility.name,
        address: facility.address,
        coordinates: {
          latitude: facility.coordinates.lat,
          longitude: facility.coordinates.lng
        },
        type: facility.type
      }));
    
    const clinicsMarkers: MapMarker[] = clinics
      .filter(clinic => selectedTypes.includes('clinic'))
      .map(clinic => ({
        id: clinic._id,
        name: clinic.name,
        address: clinic.address.street,
        coordinates: {
          latitude: clinic.address.coordinates.latitude,
          longitude: clinic.address.coordinates.longitude
        },
        type: 'clinic'
      }));
    
    let allMarkers = [...facilitiesMarkers, ...clinicsMarkers];

    // Фильтруем маркеры по радиусу, если есть местоположение пользователя
    if (userLocation) {
      allMarkers = allMarkers.filter(marker => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinates.latitude,
          marker.coordinates.longitude
        );
        return distance <= selectedRadius / 1000; // Конвертируем метры в километры
      });
    }
    
    setMarkers(allMarkers);
  }, [facilities, clinics, selectedTypes, userLocation, selectedRadius]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Обработчик нажатия на маркер
  const handleMarkerPress = (marker: MapMarker) => {
    if (marker.type === 'clinic') {
      const clinic = clinics.find(c => c._id === marker.id);
      if (clinic) {
        navigation.navigate('ClinicDetails', { clinic });
      }
    } else {
      const facility = facilities.find(f => f.id === marker.id);
      if (facility) {
        navigation.navigate('FacilityDetails', { facilityId: facility.id });
      }
    }
  };

  const toggleType = (type: MedicalFacility['type']) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <View style={styles.container}>
      <Map
        markers={markers}
        initialRegion={mapRegion}
        onMarkerPress={handleMarkerPress}
        radius={selectedRadius}
      />
      
      {loading && <View style={styles.loadingOverlay}><Text>Загрузка...</Text></View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 