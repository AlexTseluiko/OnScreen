import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Linking, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Map } from '../components/organisms/Map';
import type { MapMarker } from '../components/organisms/Map';
import { clinicsApi } from '../api/clinics';
import { facilitiesApi } from '../api/facilities';
import { Clinic } from '../types/clinic';
import { Facility } from '../types/facility';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { estimateTravelTime, formatTravelTime } from '../utils/mapUtils';
import { useTranslation } from 'react-i18next';
import styles from './FacilitiesMapScreen.styles';

// Импортируем Location только для мобильных платформ
const Location = Platform.OS !== 'web' ? require('expo-location') : null;

type FacilitiesMapScreenRouteProp = RouteProp<RootStackParamList, 'FacilitiesMap'>;

export const FacilitiesMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<FacilitiesMapScreenRouteProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showClinicInfo, setShowClinicInfo] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  // Получаем параметр фильтра, если он был передан при навигации
  const initialFilter = route.params?.filter || 'all';

  const fetchData = async () => {
    try {
      const [clinicsResponse, facilitiesResponse] = await Promise.all([
        clinicsApi.getAll({}),
        facilitiesApi.getFacilities({}),
      ]);
      setClinics(clinicsResponse);
      setFacilities(facilitiesResponse);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Получаем местоположение пользователя
  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (Platform.OS !== 'web' && Location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          error => {
            console.error('Ошибка получения местоположения:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    } catch (error) {
      console.error('Ошибка при получении местоположения:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Получаем местоположение пользователя при монтировании компонента
  useEffect(() => {
    getUserLocation();
  }, []);

  // При выборе маркера находим соответствующую клинику и рассчитываем время пути
  useEffect(() => {
    if (selectedMarker && userLocation) {
      const clinic = clinics.find((c: Clinic) => c._id === selectedMarker.id);
      if (clinic) {
        setSelectedClinic(clinic);

        // Рассчитываем приблизительное время пути
        const minutes = estimateTravelTime(
          userLocation.latitude,
          userLocation.longitude,
          selectedMarker.coordinates.latitude,
          selectedMarker.coordinates.longitude
        );
        setEstimatedTime(formatTravelTime(minutes));

        setShowClinicInfo(true);
      }
    }
  }, [selectedMarker, clinics, userLocation]);

  const handleCloseClinicInfo = () => {
    setShowClinicInfo(false);
    setSelectedMarker(null);
    setSelectedClinic(null);
    setEstimatedTime(null);
  };

  const handleOpenDirections = () => {
    if (!selectedMarker || !userLocation) return;

    const { latitude, longitude } = selectedMarker.coordinates;
    let url;

    if (Platform.OS === 'ios') {
      url = `maps://app?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${latitude},${longitude}`;
    } else if (Platform.OS === 'android') {
      url = `google.navigation:q=${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${latitude},${longitude}`;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error('Невозможно открыть карты для построения маршрута');
      }
    });
  };

  const handleClinicDetails = () => {
    if (selectedClinic) {
      handleCloseClinicInfo();
      navigation.navigate('ClinicDetails', { clinicId: selectedClinic._id });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Кнопка обновления местоположения */}
      <TouchableOpacity
        style={[styles.updateLocationButton, { backgroundColor: theme.colors.primary }]}
        onPress={getUserLocation}
        disabled={isLoadingLocation}
      >
        <Ionicons name="locate" size={24} color={theme.colors.text.inverse} />
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color={theme.colors.text.inverse} />
        ) : (
          <Text style={[styles.updateLocationText, { color: theme.colors.text.inverse }]}>
            {t('map.myLocation')}
          </Text>
        )}
      </TouchableOpacity>

      <Map
        clinics={clinics}
        onMarkerPress={setSelectedMarker}
        selectedClinic={selectedClinic || undefined}
        showFilters={true}
        initialFilter={initialFilter as 'all' | 'hospital' | 'clinic' | 'pharmacy'}
      />

      {/* Модальное окно с информацией о клинике */}
      {selectedClinic && (
        <Modal
          visible={showClinicInfo}
          transparent
          animationType="slide"
          onRequestClose={handleCloseClinicInfo}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseClinicInfo}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.clinicInfoContainer}>
                {selectedClinic.imageUrl ? (
                  <Image source={{ uri: selectedClinic.imageUrl }} style={styles.clinicImage} />
                ) : (
                  <View style={[styles.noImage, { backgroundColor: theme.colors.border }]}>
                    <Ionicons name="medical" size={40} color={theme.colors.primary} />
                  </View>
                )}

                <Text style={styles.clinicName}>{selectedClinic.name}</Text>
                <Text style={styles.clinicAddress}>{selectedClinic.address.street}</Text>

                {estimatedTime && (
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.timeText}>
                      {t('map.estimatedTime')}: {estimatedTime}
                    </Text>
                  </View>
                )}

                <View style={styles.servicesContainer}>
                  <Text style={styles.servicesTitle}>{t('clinic.services')}:</Text>
                  <View style={styles.servicesList}>
                    {selectedClinic.services &&
                      selectedClinic.services.slice(0, 3).map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.colors.success}
                          />
                          <Text style={styles.serviceText}>{service}</Text>
                        </View>
                      ))}
                    {selectedClinic.services && selectedClinic.services.length > 3 && (
                      <Text style={styles.moreServices}>
                        +{selectedClinic.services.length - 3} {t('common.more')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title={t('map.getDirections')}
                    onPress={handleOpenDirections}
                    icon={<Ionicons name="navigate" size={20} color="white" />}
                    style={styles.directionButton}
                    variant="primary"
                  />
                  <Button
                    title={t('map.viewDetails')}
                    onPress={handleClinicDetails}
                    icon={<Ionicons name="information-circle" size={20} color="white" />}
                    style={styles.detailsButton}
                    variant="secondary"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
