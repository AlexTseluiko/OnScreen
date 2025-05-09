import React, { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { default as MapView, Marker } from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { API_KEYS } from '../constants/index';
import { getMarkerColor } from '../utils/mapUtils';
import { useTheme } from '../contexts/ThemeContext';
import { Clinic } from '../types/clinic';

// Константы для цветов
const COLORS = {
  primary: '#4285F4',
  white: '#FFFFFF',
  error: 'rgba(255, 0, 0, 0.7)',
  background: '#f1f1f1',
  text: '#333333',
  shadow: '#000000',
};

// Специальный тип для стилей iframe
interface IFrameStyle {
  width: string;
  height: string;
  border: string;
}

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

interface MapMarker {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'clinic' | 'facility';
}

interface MapProps {
  clinics: Clinic[];
  initialRegion?: Region;
  onMarkerPress?: (marker: MapMarker) => void;
  selectedClinic?: Clinic;
}

export const Map: React.FC<MapProps> = ({
  clinics,
  initialRegion,
  onMarkerPress,
  selectedClinic,
}) => {
  const { theme } = useTheme();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMyLocation, setShowMyLocation] = useState(true);
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: 55.7558,
      longitude: 37.6173,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(10000);
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
            accuracy: Location.Accuracy.High,
          });
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
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
              position => {
                const newLocation = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                };
                setUserLocation(newLocation);
                setRegion({
                  ...newLocation,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
                setCurrentLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              error => {
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
    if (selectedClinic?.address.coordinates && mapRef.current) {
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

  const handleMarkerPress = (marker: MapMarker) => {
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
  };

  // Для веб-версии используем Google Maps JavaScript API
  if (Platform.OS === 'web') {
    const markersString = clinics
      .filter(clinic => clinic.address.coordinates)
      .map(
        clinic =>
          `&markers=color:${getMarkerColor('clinic').replace('#', '')}|${clinic.address.coordinates!.latitude},${clinic.address.coordinates!.longitude}`
      )
      .join('');

    const mapUrl = currentLocation
      ? `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${currentLocation.lat},${currentLocation.lng}&zoom=15&maptype=roadmap${markersString}`
      : `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${region.latitude},${region.longitude}&zoom=15&maptype=roadmap${markersString}`;

    return (
      <View style={styles.container}>
        <View style={styles.webFiltersContainer}>
          {filtersOpen ? (
            <>
              <View style={styles.filtersBlock}>
                <View style={styles.filterRow}>
                  {['all', 'hospital', 'clinic', 'pharmacy'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterButton, selectedType === type && styles.activeFilter]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text
                        style={selectedType === type ? styles.activeFilterText : styles.filterText}
                      >
                        {type === 'all'
                          ? 'Все'
                          : type === 'hospital'
                            ? 'Больницы'
                            : type === 'clinic'
                              ? 'Клиники'
                              : 'Аптеки'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filterRow}>
                  {[1000, 3000, 5000, 10000].map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.filterButton, selectedRadius === r && styles.activeFilter]}
                      onPress={() => setSelectedRadius(r)}
                    >
                      <Text
                        style={selectedRadius === r ? styles.activeFilterText : styles.filterText}
                      >
                        {r / 1000} км
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setFiltersOpen(false)}
                  style={styles.collapseButton}
                >
                  <Text style={styles.filterButtonText}>Свернуть фильтры ▲</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setFiltersOpen(true)} style={styles.expandButton}>
              <Text style={styles.filterButtonText}>Показать фильтры ▼</Text>
            </TouchableOpacity>
          )}
        </View>
        <iframe
          src={mapUrl}
          style={{ width: '100%', height: '100%', border: 'none' } as IFrameStyle}
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
        provider="google"
        style={styles.map}
        region={region}
        showsUserLocation={showMyLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        customMapStyle={theme.isDark ? darkMapStyle : []}
      >
        {clinics
          .filter(clinic => clinic.address.coordinates)
          .map(clinic => (
            <Marker
              key={clinic._id}
              coordinate={{
                latitude: clinic.address.coordinates!.latitude,
                longitude: clinic.address.coordinates!.longitude,
              }}
              title={clinic.name}
              description={clinic.address.street}
              onPress={() =>
                handleMarkerPress({
                  id: clinic._id,
                  coordinates: {
                    latitude: clinic.address.coordinates!.latitude,
                    longitude: clinic.address.coordinates!.longitude,
                  },
                  type: 'clinic',
                })
              }
              pinColor={selectedClinic?._id === clinic._id ? theme.colors.primary : undefined}
            />
          ))}
      </MapView>

      <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocationPress}>
        <Text style={styles.myLocationButtonText}>Моё местоположение</Text>
      </TouchableOpacity>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  activeFilterText: {
    color: COLORS.white,
    fontSize: 12,
  },
  collapseButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  errorText: {
    backgroundColor: COLORS.error,
    bottom: 10,
    color: COLORS.white,
    left: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  expandButton: {
    padding: 8,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterText: {
    color: COLORS.text,
    fontSize: 12,
  },
  filtersBlock: {
    padding: 5,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  myLocationButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    bottom: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    right: 20,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
        }
      : {
          elevation: 3,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }),
  },
  myLocationButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  webFiltersContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    maxWidth: 300,
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
        }
      : {
          elevation: 5,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }),
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
