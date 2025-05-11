import React, { useState, useEffect, useRef } from 'react';
import { Platform, View, TouchableOpacity } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { API_KEYS, INITIAL_REGION } from '../../constants';
import { getMarkerColor } from '../../utils/mapUtils';
import { useTheme } from '../../theme';
import { Clinic } from '../../types/clinic';
import { Text } from '../atoms/Text';
import { Ionicons } from '@expo/vector-icons';
import styles, { webMap } from './Map.styles';

// Предварительно объявляем RNMarker для использования позже
let RNMarker: React.ComponentType<any> | null = null;
// Загружаем Marker только на мобильных платформах
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactNativeMaps = require('react-native-maps');
    RNMarker = ReactNativeMaps.Marker;
  } catch (error) {
    console.error('Ошибка при импорте Marker:', error);
  }
}

// Константы для цветов прозрачности
const OPACITY = {
  LOW: 0.5,
  MEDIUM: 0.7,
  HIGH: 0.9,
};

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

export interface MapMarker {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'clinic' | 'pharmacy' | 'hospital' | 'emergency';
  title?: string;
  description?: string;
}

export interface MapProps {
  markers?: MapMarker[];
  clinics?: Clinic[];
  initialRegion?: Region;
  onMarkerPress?: (marker: MapMarker) => void;
  selectedClinic?: Clinic;
  showFilters?: boolean;
}

export const Map: React.FC<MapProps> = ({
  markers = [],
  clinics = [],
  initialRegion = INITIAL_REGION,
  onMarkerPress,
  selectedClinic,
  showFilters = false,
}) => {
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(showFilters);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRadius] = useState<number>(10000);

  // Конвертируем клиники в маркеры для карты, если они переданы
  const allMarkers = [
    ...markers,
    ...clinics
      .filter(clinic => clinic.address.coordinates)
      .map(clinic => ({
        id: clinic._id,
        coordinates: {
          latitude: clinic.address.coordinates!.latitude,
          longitude: clinic.address.coordinates!.longitude,
        },
        type: 'clinic' as const,
        title: clinic.name,
        description: clinic.address.street,
      })),
  ];

  // Получаем местоположение пользователя
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

  // Если выбрана клиника, центрируем карту на ней
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

  // Обработчик для центрирования на местоположении пользователя
  const handleMyLocationPress = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Обработчик нажатия на маркер
  const handleMarkerPress = (marker: MapMarker) => {
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
  };

  // Для веб-платформы используем напрямую iframe с Google Maps
  if (Platform.OS === 'web') {
    const markersString = allMarkers
      .map(
        marker =>
          `&markers=color:${getMarkerColor(marker.type).replace('#', '')}|${marker.coordinates.latitude},${marker.coordinates.longitude}`
      )
      .join('');

    const mapUrl = currentLocation
      ? `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${currentLocation.lat},${currentLocation.lng}&zoom=15&maptype=roadmap${markersString}`
      : `https://www.google.com/maps/embed/v1/view?key=${API_KEYS.GOOGLE_MAPS}&center=${region.latitude},${region.longitude}&zoom=15&maptype=roadmap${markersString}`;

    return (
      <View style={styles.container}>
        {showFilters && (
          <View
            style={[
              styles.webFiltersContainer,
              { backgroundColor: isDark ? theme.colors.surface : theme.colors.background },
            ]}
          >
            {/* Фильтры */}
            {/* ... код фильтров ... */}
          </View>
        )}

        {/* Используем напрямую iframe вместо react-native-web-maps */}
        <iframe title="Google Maps" src={mapUrl} style={webMap as any} allowFullScreen />

        {userLocation && (
          <TouchableOpacity
            style={[styles.myLocationButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleMyLocationPress}
          >
            <Ionicons name="locate" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        )}

        {errorMsg && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: `${theme.colors.danger}${OPACITY.MEDIUM}` },
            ]}
          >
            <Text style={{ color: theme.colors.text.inverse }}>{errorMsg}</Text>
          </View>
        )}
      </View>
    );
  }

  // Не используем require('react-native-web-maps')
  // Вместо этого рендерим напрямую iframe для Google Maps

  // Для мобильных — MapView и Marker
  if (['ios', 'android'].includes(Platform.OS)) {
    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {allMarkers.map(marker => {
            // Проверяем наличие RNMarker перед использованием
            if (RNMarker) {
              return (
                <RNMarker
                  key={marker.id}
                  coordinate={marker.coordinates}
                  pinColor={getMarkerColor(marker.type)}
                  title={marker.title}
                  description={marker.description}
                  onPress={() => handleMarkerPress(marker)}
                />
              );
            }
            return null;
          })}
        </MapView>

        {showFilters && (
          <View
            style={[
              styles.filtersContainer,
              { backgroundColor: isDark ? theme.colors.surface : theme.colors.background },
            ]}
          >
            {filtersOpen ? (
              <>
                <View style={styles.filtersBlock}>
                  <View style={styles.filterRow}>
                    {['all', 'hospital', 'clinic', 'pharmacy'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterButton,
                          { borderColor: theme.colors.primary },
                          selectedType === type && {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                        onPress={() => setSelectedType(type)}
                      >
                        <Text
                          style={{
                            color:
                              selectedType === type
                                ? theme.colors.text.inverse
                                : theme.colors.text.primary,
                          }}
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
                  <View style={styles.radiusContainer}>
                    <Text>Радиус поиска: {selectedRadius / 1000} км</Text>
                    {/*Здесь может быть компонент слайдера для выбора радиуса*/}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggleFiltersButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setFiltersOpen(false)}
                >
                  <Ionicons name="chevron-up" size={24} color={theme.colors.text.inverse} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.toggleFiltersButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setFiltersOpen(true)}
              >
                <Ionicons name="chevron-down" size={24} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {userLocation && (
          <TouchableOpacity
            style={[styles.myLocationButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleMyLocationPress}
          >
            <Ionicons name="locate" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        )}

        {errorMsg && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: `${theme.colors.danger}${OPACITY.MEDIUM}` },
            ]}
          >
            <Text style={{ color: theme.colors.text.inverse }}>{errorMsg}</Text>
          </View>
        )}
      </View>
    );
  }

  return null;
};
