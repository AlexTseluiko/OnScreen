import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  TextStyle,
  ScrollView,
} from 'react-native';
import MapView, { Region, Marker as RNMarker, Callout as RNCallout } from 'react-native-maps';
import { getMarkerColor } from '../../utils/mapUtils';
import { useTheme } from '../../theme';
import { Clinic } from '../../types/clinic';
import { Text } from '../atoms/Text';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Константы для прозрачности
const OPACITY = {
  LOW: '33',
  MEDIUM: '66',
  HIGH: '99',
} as const;

// Константы цветов
const COLORS = {
  WHITE: '#FFFFFF',
  PRIMARY_TEXT: '#FFFFFF',
  SECONDARY_TEXT: 'rgba(0, 0, 0, 0.8)',
  MARKER_BG: 'rgba(255, 255, 255, 0.9)',
  ITEM_BG: 'rgba(255, 255, 255, 0.95)',
  SHADOW: '#000000',
  GRAY: '#666666',
  LIGHT_GRAY: '#E0E0E0',
  LOADING_BG: 'rgba(255, 255, 255, 0.8)',
} as const;

// Константы для хранения настроек
const STORAGE_KEYS = {
  MAP_TYPE: 'map_settings_type',
  SELECTED_TYPE: 'map_settings_selected_type',
  SELECTED_RADIUS: 'map_settings_radius',
} as const;

// Функция для получения стиля текста фильтра
const getFilterTextStyle = (
  isSelected: boolean,
  theme: { colors: { text: { inverse: string; primary: string } } }
): StyleProp<TextStyle> => ({
  color: isSelected ? theme.colors.text.inverse : theme.colors.text.primary,
  fontWeight: isSelected ? 'bold' : 'normal',
});

// Заменим инлайн-стили на стили из StyleSheet
const inlineStyles = StyleSheet.create({
  buttonText: {
    color: COLORS.PRIMARY_TEXT,
    fontWeight: 'bold',
  },
  calloutTitle: {
    fontWeight: 'bold',
  },
  distanceText: {
    marginTop: 5,
  },
  errorText: {
    color: COLORS.WHITE,
  },
  iconContainer: {
    marginBottom: 10,
  },
  listItemContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  listItemDescription: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
  },
  mapContainer: {
    flex: 2,
  },
  markerCard: {
    backgroundColor: COLORS.ITEM_BG,
    borderRadius: 8,
    elevation: 2,
    marginVertical: 4,
    padding: 10,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerDistance: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerIcon: {
    marginRight: 8,
  },
  markerTypeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  nearbyPlacesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noPlacesFoundHint: {
    color: COLORS.SECONDARY_TEXT,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  noPlacesFoundText: {
    color: COLORS.SECONDARY_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
  },
});

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

// Начальный регион для Украины - Киев
const UKRAINE_REGION: Region = {
  latitude: 50.4501,
  longitude: 30.5234,
  latitudeDelta: 3,
  longitudeDelta: 3,
};

// Стили карты для скрытия нежелательных POI в мобильной версии
const mapCustomStyle = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
];

export interface MapMarker {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'clinic' | 'pharmacy' | 'hospital' | 'emergency';
  title?: string;
  description?: string;
  distance?: number;
}

interface ClinicMarker {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'clinic';
  title: string;
  description: string;
  distance?: number;
}

type MarkerWithDistance = MapMarker | ClinicMarker;

export interface MapProps {
  markers?: MapMarker[];
  clinics?: Clinic[];
  initialRegion?: Region;
  onMarkerPress?: (marker: MapMarker) => void;
  selectedClinic?: Clinic;
  showFilters?: boolean;
  initialFilter?: 'all' | 'hospital' | 'clinic' | 'pharmacy';
}

export const Map: React.FC<MapProps> = ({
  markers = [],
  clinics = [],
  initialRegion = UKRAINE_REGION,
  onMarkerPress,
  selectedClinic,
  showFilters = false,
  initialFilter = 'all',
}) => {
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  const { t } = useTranslation();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(showFilters);
  const [selectedType, setSelectedType] = useState<string>(initialFilter);
  const [selectedRadius, setSelectedRadius] = useState<number>(10000);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [selectedMarker, setSelectedMarker] = useState<MarkerWithDistance | null>(null);
  const [showMarkerDetails, setShowMarkerDetails] = useState<boolean>(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  // Загружаем сохраненные настройки
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMapType = await AsyncStorage.getItem(STORAGE_KEYS.MAP_TYPE);
        const savedSelectedType = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TYPE);
        const savedRadius = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_RADIUS);

        if (savedMapType) setMapType(savedMapType as 'standard' | 'satellite');
        if (savedSelectedType) setSelectedType(savedSelectedType);
        if (savedRadius) setSelectedRadius(parseInt(savedRadius, 10));
      } catch (error) {
        console.error('Ошибка при загрузке настроек карты:', error);
      }
    };

    loadSettings();
  }, []);

  // Сохраняем настройки при изменении
  const saveSettings = useCallback(async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Ошибка при сохранении настроек карты:', error);
    }
  }, []);

  // Обработчики изменения настроек с сохранением
  const handleSetMapType = useCallback(
    (type: 'standard' | 'satellite') => {
      setMapType(type);
      saveSettings(STORAGE_KEYS.MAP_TYPE, type);
    },
    [saveSettings]
  );

  const handleSetSelectedType = useCallback(
    (type: string) => {
      setSelectedType(type);
      saveSettings(STORAGE_KEYS.SELECTED_TYPE, type);
    },
    [saveSettings]
  );

  const handleSetSelectedRadius = useCallback(
    (radius: number) => {
      setSelectedRadius(radius);
      saveSettings(STORAGE_KEYS.SELECTED_RADIUS, radius.toString());
    },
    [saveSettings]
  );

  // Добавим кнопку для переключения типа карты
  const renderMapTypeToggle = () => (
    <TouchableOpacity
      style={[styles.mapTypeButton, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSetMapType(mapType === 'standard' ? 'satellite' : 'standard')}
    >
      <Ionicons
        name={mapType === 'standard' ? 'map' : 'map-outline'}
        size={24}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  // Расчет расстояния от пользователя до маркера
  const calculateDistanceFromUser = useCallback(
    (marker: MarkerWithDistance): number => {
      if (!userLocation) return Number.MAX_SAFE_INTEGER;

      const R = 6371; // Радиус Земли в км
      const dLat = toRad(marker.coordinates.latitude - userLocation.latitude);
      const dLon = toRad(marker.coordinates.longitude - userLocation.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLocation.latitude)) *
          Math.cos(toRad(marker.coordinates.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [userLocation]
  );

  // Конвертация градусов в радианы
  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Конвертируем клиники в маркеры для карты, если они переданы
  const allMarkers: MarkerWithDistance[] = useMemo(
    () => [
      ...markers,
      ...clinics
        .filter(clinic => clinic.address.coordinates)
        .map(clinic => ({
          id: clinic._id,
          coordinates: {
            latitude: clinic.address.coordinates!.latitude,
            longitude: clinic.address.coordinates!.longitude,
          },
          type: clinic.type || ('clinic' as const),
          title: clinic.name,
          description: clinic.address.street,
        })),
    ],
    [markers, clinics]
  );

  // Фильтруем маркеры по типу и радиусу
  const filteredMarkers = useMemo(
    () =>
      allMarkers.filter(marker => {
        // Фильтрация по типу
        if (selectedType !== 'all' && marker.type !== selectedType) {
          return false;
        }

        // Фильтрация по радиусу, если есть местоположение пользователя
        if (userLocation && selectedRadius > 0) {
          const distance = calculateDistanceFromUser(marker);
          // Обновляем маркер с расстоянием для последующего отображения
          marker.distance = distance;
          // Фильтрация по радиусу (в метрах)
          return distance <= selectedRadius / 1000;
        }

        return true;
      }),
    [allMarkers, selectedType, userLocation, selectedRadius, calculateDistanceFromUser]
  );

  // Получаем местоположение пользователя
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        setIsLoadingLocation(true);
        setErrorMsg(null);

        if (Platform.OS !== 'web' && Location) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg(t('errors.locationPermissionDenied'));
            setIsLoadingLocation(false);
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
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
                console.error('Ошибка получения местоположения:', error);
                setErrorMsg(t('errors.locationFailed'));
              },
              { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
            );
          } else {
            setErrorMsg(t('errors.locationNotSupported'));
          }
        }
      } catch (error) {
        console.error('Ошибка получения местоположения:', error);
        setErrorMsg(t('errors.locationFailed'));
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getUserLocation();
  }, [t]);

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
  const handleMyLocationPress = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

  // Обработчик нажатия на маркер
  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      if (onMarkerPress) {
        onMarkerPress(marker);
      }
    },
    [onMarkerPress]
  );

  // Визуализация слайдера для выбора радиуса
  const renderRadiusSlider = () => {
    return (
      <View style={styles.radiusContainer}>
        <Text>
          {t('map.filters.searchRadius')}: {selectedRadius / 1000} {t('map.filters.km')}
        </Text>
        <View style={styles.slider}>
          <TouchableOpacity
            onPress={() => handleSetSelectedRadius(Math.max(1000, selectedRadius - 1000))}
            style={styles.sliderButton}
          >
            <Ionicons name="remove" size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.sliderThumb,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(selectedRadius / 20000) * 100}%`,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSetSelectedRadius(Math.min(20000, selectedRadius + 1000))}
            style={styles.sliderButton}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Для веб-платформы используем напрямую iframe с Google Maps
  if (Platform.OS === 'web') {
    const mapCenter = currentLocation
      ? `${currentLocation.lat},${currentLocation.lng}`
      : `${UKRAINE_REGION.latitude},${UKRAINE_REGION.longitude}`;

    const handleSelectMarker = (marker: MarkerWithDistance) => {
      setSelectedMarker(marker);
      setShowMarkerDetails(true);
      setIsDetailsCollapsed(false);
    };

    const handleCloseDetails = () => {
      setShowMarkerDetails(false);
      setSelectedMarker(null);
    };

    try {
      const mapUrl = new URL('https://www.google.com/maps/embed/v1/search');
      mapUrl.searchParams.append(
        'key',
        process.env.REACT_APP_MAPS_API_KEY || 'AIzaSyBOy6uPJSI-pFCbjTJUqAUsb2eKJBi_sAw'
      );
      if (currentLocation) {
        mapUrl.searchParams.set(
          'q',
          `медицинские учреждения near ${currentLocation.lat},${currentLocation.lng}`
        );
      } else {
        mapUrl.searchParams.set('q', 'медицинские учреждения больницы клиники аптеки в Украине');
      }
      mapUrl.searchParams.append('center', mapCenter);
      mapUrl.searchParams.append('zoom', '14');
      mapUrl.searchParams.append('maptype', 'satellite');

      const markersForList = filteredMarkers;

      return (
        <View style={styles.container}>
          {showFilters && (
            <View
              style={[
                styles.webFiltersContainer,
                { backgroundColor: isDark ? theme.colors.surface : theme.colors.background },
              ]}
            >
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
                      onPress={() => handleSetSelectedType(type)}
                    >
                      <Text style={getFilterTextStyle(selectedType === type, theme)}>
                        {type === 'all'
                          ? t('map.filters.all')
                          : type === 'hospital'
                            ? t('map.filters.hospitals')
                            : type === 'clinic'
                              ? t('map.filters.clinics')
                              : t('map.filters.pharmacies')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {renderRadiusSlider()}
              </View>
            </View>
          )}

          <View style={styles.webMapContainer}>
            <View style={inlineStyles.mapContainer}>
              <iframe
                title="Google Maps"
                src={mapUrl.toString()}
                style={styles.iframe}
                allowFullScreen
                onError={e => {
                  console.error('Ошибка загрузки карты:', e);
                  setErrorMsg(t('errors.mapLoadFailed'));
                }}
              />

              {isLoadingLocation && (
                <View
                  style={[
                    styles.loadingContainer,
                    { backgroundColor: `${theme.colors.surface}${OPACITY.MEDIUM}` },
                  ]}
                >
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={inlineStyles.loadingText}>{t('map.loadingLocation')}</Text>
                </View>
              )}

              {errorMsg && (
                <View
                  style={[
                    styles.errorContainer,
                    { backgroundColor: `${theme.colors.danger}${OPACITY.MEDIUM}` },
                  ]}
                >
                  <Text style={inlineStyles.errorText}>{errorMsg}</Text>
                </View>
              )}
            </View>

            <View style={styles.markerListContainer}>
              <TouchableOpacity
                onPress={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                style={styles.collapseButton}
              >
                <Ionicons
                  name={isDetailsCollapsed ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.collapseButtonText, { color: theme.colors.primary }]}>
                  {isDetailsCollapsed
                    ? t('map.showDetails', 'Показать список')
                    : t('map.hideDetails', 'Скрыть список')}
                </Text>
              </TouchableOpacity>
              {!isDetailsCollapsed &&
                (showMarkerDetails && selectedMarker ? (
                  <View style={[styles.markerDetailsContainer, inlineStyles.markerCard]}>
                    <View style={styles.markerDetailsHeader}>
                      <Text style={styles.markerDetailsTitle}>
                        {selectedMarker.title || t(`map.filters.${selectedMarker.type}`)}
                      </Text>
                      <TouchableOpacity onPress={handleCloseDetails}>
                        <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                      </TouchableOpacity>
                    </View>
                    <View style={inlineStyles.markerTypeRow}>
                      <Ionicons
                        name={
                          selectedMarker.type === 'hospital'
                            ? 'medkit'
                            : selectedMarker.type === 'clinic'
                              ? 'medical'
                              : 'medical-outline'
                        }
                        size={22}
                        color={getMarkerColor(selectedMarker.type)}
                        style={inlineStyles.markerIcon}
                      />
                      <Text style={inlineStyles.typeText}>
                        {selectedMarker.type === 'hospital'
                          ? t('map.filters.hospitals')
                          : selectedMarker.type === 'clinic'
                            ? t('map.filters.clinics')
                            : t('map.filters.pharmacies')}
                      </Text>
                    </View>
                    {selectedMarker.description && (
                      <View style={styles.markerDetailSection}>
                        <Text style={styles.markerDetailsSectionTitle}>
                          {t('map.address') || 'Адрес'}:
                        </Text>
                        <Text>{selectedMarker.description}</Text>
                      </View>
                    )}
                    {selectedMarker.distance !== undefined && (
                      <View style={styles.markerDetailSection}>
                        <Text style={styles.markerDetailsSectionTitle}>
                          {t('map.distance') || 'Расстояние'}:
                        </Text>
                        <Text style={inlineStyles.markerDistance}>
                          {selectedMarker.distance.toFixed(1)} {t('map.filters.km') || 'км'}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        if (onMarkerPress && 'id' in selectedMarker) {
                          onMarkerPress(selectedMarker as MapMarker);
                        }
                      }}
                    >
                      <Text style={inlineStyles.buttonText}>
                        {t('map.viewDetails') || 'Подробнее'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={inlineStyles.nearbyPlacesTitle}>
                      {t('map.nearbyPlaces', 'Ближайшие учреждения')}
                    </Text>
                    <ScrollView style={inlineStyles.scrollContainer}>
                      {markersForList.length > 0 ? (
                        markersForList.map(marker => (
                          <TouchableOpacity
                            key={marker.id}
                            style={[
                              inlineStyles.markerCard,
                              { borderBottomColor: theme.colors.border },
                            ]}
                            onPress={() => handleSelectMarker(marker)}
                          >
                            <View
                              style={[
                                styles.markerTypeIcon,
                                { backgroundColor: getMarkerColor(marker.type) },
                              ]}
                            >
                              <Ionicons
                                name={
                                  marker.type === 'hospital'
                                    ? 'medkit'
                                    : marker.type === 'clinic'
                                      ? 'medical'
                                      : 'medical-outline'
                                }
                                size={16}
                                color="#FFFFFF"
                                style={inlineStyles.markerIcon}
                              />
                            </View>
                            <View style={inlineStyles.listItemContainer}>
                              <Text style={inlineStyles.listItemTitle}>
                                {marker.title || t(`map.filters.${marker.type}`) || marker.type}
                              </Text>
                              {marker.description && (
                                <Text
                                  style={[
                                    inlineStyles.listItemDescription,
                                    { color: theme.colors.text.secondary },
                                  ]}
                                >
                                  {marker.description.length > 40
                                    ? marker.description.substring(0, 40) + '...'
                                    : marker.description}
                                </Text>
                              )}
                            </View>
                            {marker.distance !== undefined && (
                              <Text
                                style={[
                                  inlineStyles.markerDistance,
                                  { color: theme.colors.primary },
                                ]}
                              >
                                {marker.distance.toFixed(1)} {t('map.filters.km', 'км')}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.emptyListContainer}>
                          <Ionicons
                            name="location-outline"
                            size={48}
                            color={theme.colors.text.secondary}
                            style={inlineStyles.iconContainer}
                          />
                          <Text style={inlineStyles.noPlacesFoundText}>
                            {t('map.noPlacesFound', 'Ничего не найдено поблизости')}
                          </Text>
                          <Text style={inlineStyles.noPlacesFoundHint}>
                            {t(
                              'map.tryChangeFilters',
                              'Попробуйте изменить фильтры или увеличить радиус поиска'
                            )}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </>
                ))}
            </View>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Ошибка формирования URL:', error);
      setErrorMsg(t('errors.mapUrlGenerationFailed'));
      return null;
    }
  }

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
          customMapStyle={mapCustomStyle}
          mapType={mapType}
        >
          {filteredMarkers.map(marker => (
            <RNMarker
              key={marker.id}
              coordinate={marker.coordinates}
              pinColor={getMarkerColor(marker.type)}
              title={marker.title}
              description={marker.description}
              onPress={() => handleMarkerPress(marker as MapMarker)}
            >
              {marker.distance !== undefined && (
                <RNCallout tooltip>
                  <View
                    style={[styles.calloutContainer, { backgroundColor: theme.colors.surface }]}
                  >
                    <Text style={inlineStyles.calloutTitle}>{marker.title}</Text>
                    <Text>{marker.description}</Text>
                    <Text style={[inlineStyles.distanceText, { color: theme.colors.primary }]}>
                      {t('map.distance')}: {marker.distance.toFixed(1)} {t('map.filters.km')}
                    </Text>
                  </View>
                </RNCallout>
              )}
            </RNMarker>
          ))}
        </MapView>

        {renderMapTypeToggle()}

        <TouchableOpacity
          style={[styles.myLocationButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleMyLocationPress}
        >
          <Ionicons name="locate" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

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
                        onPress={() => handleSetSelectedType(type)}
                      >
                        <Text style={getFilterTextStyle(selectedType === type, theme)}>
                          {type === 'all'
                            ? t('map.filters.all')
                            : type === 'hospital'
                              ? t('map.filters.hospitals')
                              : type === 'clinic'
                                ? t('map.filters.clinics')
                                : t('map.filters.pharmacies')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {renderRadiusSlider()}
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

        {isLoadingLocation && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: `${theme.colors.surface}${OPACITY.MEDIUM}` },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={inlineStyles.loadingText}>{t('map.loadingLocation')}</Text>
          </View>
        )}

        {errorMsg && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: `${theme.colors.danger}${OPACITY.MEDIUM}` },
            ]}
          >
            <Text style={inlineStyles.errorText}>{errorMsg}</Text>
          </View>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  calloutContainer: {
    borderRadius: 8,
    minWidth: 200,
    padding: 10,
  },
  collapseButton: {
    alignItems: 'center',
    padding: 8,
  },
  collapseButtonText: {
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  emptyListContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.MARKER_BG,
    justifyContent: 'center',
    padding: 20,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filtersBlock: {
    padding: 10,
  },
  filtersContainer: {
    backgroundColor: COLORS.MARKER_BG,
    borderRadius: 8,
    bottom: 20,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  iframe: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.LOADING_BG,
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  mapTypeButton: {
    backgroundColor: COLORS.MARKER_BG,
    borderRadius: 8,
    elevation: 5,
    padding: 10,
    position: 'absolute',
    right: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: 20,
  },
  markerDetailSection: {
    marginBottom: 10,
  },
  markerDetailsContainer: {
    backgroundColor: COLORS.ITEM_BG,
    borderRadius: 8,
    padding: 15,
  },
  markerDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  markerDetailsSectionTitle: {
    color: COLORS.GRAY,
    fontSize: 14,
    marginBottom: 5,
  },
  markerDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markerListContainer: {
    backgroundColor: COLORS.MARKER_BG,
    borderLeftWidth: 1,
    flex: 1,
    padding: 10,
  },
  markerTypeIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  myLocationButton: {
    backgroundColor: COLORS.MARKER_BG,
    borderRadius: 8,
    bottom: 20,
    elevation: 5,
    padding: 10,
    position: 'absolute',
    right: 20,
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  radiusContainer: {
    marginTop: 10,
    padding: 10,
  },
  slider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  sliderButton: {
    padding: 5,
  },
  sliderThumb: {
    borderRadius: 2,
    height: '100%',
  },
  sliderTrack: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginHorizontal: 10,
  },
  toggleFiltersButton: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  viewDetailsButton: {
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
  },
  webFiltersContainer: {
    backgroundColor: COLORS.MARKER_BG,
    borderRadius: 8,
    margin: 10,
    padding: 10,
  },
  webMapContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
