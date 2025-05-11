import React, { useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { Map } from '../components/organisms/Map';
import type { MapMarker } from '../components/organisms/Map';
import { clinicsApi } from '../api/clinics';
import { facilitiesApi } from '../api/facilities';
import { Clinic } from '../types/clinic';
import { Facility } from '../types/facility';
import styles from './FacilitiesMapScreen.styles';

export const FacilitiesMapScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

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

  const handleMarkerPress = (marker: MapMarker) => {
    if (marker.type === 'clinic') {
      const clinic = clinics.find(c => c._id === marker.id);
      if (clinic) {
        navigation.navigate('ClinicDetails', { clinicId: clinic._id });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Map clinics={clinics} onMarkerPress={handleMarkerPress} />
    </View>
  );
};
