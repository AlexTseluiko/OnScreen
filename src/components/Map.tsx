import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import type { Region as MapRegion } from 'react-native-maps';
import { API_KEYS } from '../constants';
import { getMarkerColor } from '../utils/mapUtils';
import { MedicalFacility } from '../types/medical';
import { useTheme } from '../contexts/ThemeContext';
import { Clinic } from '../types/clinic';

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

interface MapMarker {
  id: string;
  name: string;
  address: string;
  type: MedicalFacility['type'];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MapProps {
  clinics: Clinic[];
  initialRegion?: Region;
  onMarkerPress?: (clinic: Clinic) => void;
  selectedClinic?: Clinic;
}

export const Map: React.FC<MapProps> = ({
  clinics,
  initialRegion,
  onMarkerPress,
  selectedClinic,
}) => {
  const { theme } = useTheme();
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMyLocation, setShowMyLocation] = useState(true);
  const [region, setRegion] = useState<Region>(initialRegion || {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (Platform.OS !== 'web' && Location) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Для отображения вашего местоположения необходимо разрешение');
            return;
          }
          
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          };
          setUserLocation(newLocation);
          setRegion({
            ...newLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else if (Platform.OS === 'web') {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const newLocation = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                };
                setUserLocation(newLocation);
                setRegion({
                  ...newLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              },
              (error) => {
                setErrorMsg('Ошибка при получении местоположения: ' + error.message);
              },
              { enableHighAccuracy: true }
            );
          } else {
            setErrorMsg('Ваш браузер не поддерживает геолокацию');
          }
        }
      } catch (error) {
        console.error('Ошибка получения местоположения:', error);
        setErrorMsg('Не удалось получить местоположение');
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    if (selectedClinic && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedClinic.address.coordinates.latitude,
        longitude: selectedClinic.address.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [selectedClinic]);

  const handleMyLocationPress = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowMyLocation(true);
    }
  };

  // Для веб-версии используем Google Maps JavaScript API
  if (Platform.OS === 'web') {
    const markersString = clinics.map(clinic => 
      `&markers=color:${getMarkerColor('clinic').replace('#', '')}|${clinic.address.coordinates.latitude},${clinic.address.coordinates.longitude}`
    ).join('');
    
    const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedRadius, setSelectedRadius] = useState<number>(10000);
    
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(newLocation);
          },
          (error) => {
            setErrorMsg('Ошибка при получении местоположения: ' + error.message);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setErrorMsg('Ваш браузер не поддерживает геолокацию');
      }
    }, []);

    const mapUrl = currentLocation 
      ? `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${currentLocation.lat},${currentLocation.lng}&zoom=15&maptype=roadmap${markersString}`
      : `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${region.latitude},${region.longitude}&zoom=15&maptype=roadmap${markersString}`;
    
    return (
      <View style={styles.container}>
        <View style={styles.webFiltersContainer}>
          {filtersOpen ? (
            <>
              <View style={styles.filtersBlock}>
                {/* Тип учреждения */}
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {['all', 'hospital', 'clinic', 'pharmacy'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterButton, selectedType === type && styles.activeFilter]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={selectedType === type ? styles.activeFilterText : styles.filterText}>
                        {type === 'all' ? 'Все' : type === 'hospital' ? 'Больницы' : type === 'clinic' ? 'Клиники' : 'Аптеки'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Радиус */}
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  {[1000, 3000, 5000, 10000].map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.filterButton, selectedRadius === r && styles.activeFilter]}
                      onPress={() => setSelectedRadius(r)}
                    >
                      <Text style={selectedRadius === r ? styles.activeFilterText : styles.filterText}>
                        {r / 1000} км
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setFiltersOpen(false)} style={styles.collapseButton}>
                  <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>Свернуть фильтры ▲</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setFiltersOpen(true)} style={styles.expandButton}>
              <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>Показать фильтры ▼</Text>
            </TouchableOpacity>
          )}
        </View>
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    );
  }

  // Для мобильной версии используем нативные компоненты
  // В этой версии мы используем более простой подход из-за проблем типизации
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={showMyLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        customMapStyle={theme.isDark ? darkMapStyle : []}
      >
        {clinics.map((clinic) => (
          <Marker
            key={clinic._id}
            coordinate={{
              latitude: clinic.address.coordinates.latitude,
              longitude: clinic.address.coordinates.longitude,
            }}
            title={clinic.name}
            description={clinic.address.street}
            onPress={() => onMarkerPress?.(clinic)}
            pinColor={selectedClinic?._id === clinic._id ? theme.colors.primary : undefined}
          />
        ))}
      </MapView>
      
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleMyLocationPress}
      >
        <Text style={styles.myLocationButtonText}>Моё местоположение</Text>
      </TouchableOpacity>
      
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webFiltersContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 300,
  },
  filtersBlock: {
    padding: 5,
  },
  filterButton: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
  },
  activeFilter: {
    backgroundColor: '#4285F4',
  },
  filterText: {
    color: '#333',
    fontSize: 12,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
  },
  collapseButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  expandButton: {
    padding: 8,
  },
  errorText: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    color: 'white',
    padding: 10,
    textAlign: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 8,
  },
  myLocationButtonText: {
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
]; 