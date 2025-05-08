import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { updateFilters } from '../store/slices/facilitiesSlice';
import { COLORS } from '../constants';

const SPECIALTIES = [
  'therapy',
  'surgery',
  'pediatrics',
  'cardiology',
  'neurology',
  'dermatology',
  'ophthalmology',
  'dentistry',
];

const SERVICES = [
  'onlineBooking',
  'homeVisits',
  'emergency',
  'laboratory',
  'pharmacy',
  'parking',
  'wheelchairAccessible',
];

const FilterSheet = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.facilities.filters);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    dispatch(updateFilters({ specialties: newSpecialties }));
  };

  const handleServiceToggle = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    dispatch(updateFilters({ services: newServices }));
  };

  const handleRatingChange = (rating: number) => {
    dispatch(updateFilters({ rating }));
  };

  const handleOperatingHoursChange = (hours: 'openNow' | '24/7' | 'all') => {
    dispatch(updateFilters({ operatingHours: hours }));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    dispatch(updateFilters({ searchQuery: text }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('filters.title')}</Text>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filters.specialties')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {SPECIALTIES.map(specialty => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.filterButton,
                  filters.specialties.includes(specialty) && styles.activeFilter
                ]}
                onPress={() => handleSpecialtyToggle(specialty)}
              >
                <Text style={[
                  styles.filterText,
                  filters.specialties.includes(specialty) && styles.activeFilterText
                ]}>
                  {t(`specialties.${specialty}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filters.services')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {SERVICES.map(service => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.filterButton,
                  filters.services.includes(service) && styles.activeFilter
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <Text style={[
                  styles.filterText,
                  filters.services.includes(service) && styles.activeFilterText
                ]}>
                  {t(`services.${service}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filters.rating')}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                filters.rating === rating && styles.activeRating
              ]}
              onPress={() => handleRatingChange(rating)}
            >
              <Text style={[
                styles.ratingText,
                filters.rating === rating && styles.activeRatingText
              ]}>
                {rating}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Operating Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('filters.operatingHours')}</Text>
        <View style={styles.hoursContainer}>
          {['openNow', '24/7', 'all'].map(hours => (
            <TouchableOpacity
              key={hours}
              style={[
                styles.hoursButton,
                filters.operatingHours === hours && styles.activeHours
              ]}
              onPress={() => handleOperatingHoursChange(hours as 'openNow' | '24/7' | 'all')}
            >
              <Text style={[
                styles.hoursText,
                filters.operatingHours === hours && styles.activeHoursText
              ]}>
                {t(`hours.${hours}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.primary,
  },
  activeFilterText: {
    color: COLORS.background,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeRating: {
    backgroundColor: COLORS.primary,
  },
  ratingText: {
    color: COLORS.primary,
  },
  activeRatingText: {
    color: COLORS.background,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeHours: {
    backgroundColor: COLORS.primary,
  },
  hoursText: {
    color: COLORS.primary,
  },
  activeHoursText: {
    color: COLORS.background,
  },
});

export default FilterSheet; 