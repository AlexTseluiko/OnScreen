import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { Map } from '../components/Map';
import { clinicsApi } from '../api/clinics';
import { facilitiesApi } from '../api/facilities';
import { Clinic } from '../types/clinic';
import { Facility } from '../types/facility';

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

  const handleMarkerPress = (marker: { id: string; type: 'clinic' | 'facility' }) => {
    if (marker.type === 'clinic') {
      const clinic = clinics.find(c => c._id === marker.id);
      if (clinic) {
        navigation.navigate('ClinicDetails', { clinicId: clinic._id });
      }
    } else {
      const facility = facilities.find(f => f.id === marker.id);
      if (facility) {
        navigation.navigate('FacilityDetails', { facilityId: facility.id });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Map clinics={clinics} onMarkerPress={handleMarkerPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
