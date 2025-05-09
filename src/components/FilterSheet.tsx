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
                  filters.specialties.includes(specialty) && styles.activeFilter,
                ]}
                onPress={() => handleSpecialtyToggle(specialty)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filters.specialties.includes(specialty) && styles.activeFilterText,
                  ]}
                >
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
                  filters.services.includes(service) && styles.activeFilter,
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filters.services.includes(service) && styles.activeFilterText,
                  ]}
                >
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
              style={[styles.ratingButton, filters.rating === rating && styles.activeRating]}
              onPress={() => handleRatingChange(rating)}
            >
              <Text
                style={[styles.ratingText, filters.rating === rating && styles.activeRatingText]}
              >
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
              style={[styles.hoursButton, filters.operatingHours === hours && styles.activeHours]}
              onPress={() => handleOperatingHoursChange(hours as 'openNow' | '24/7' | 'all')}
            >
              <Text
                style={[
                  styles.hoursText,
                  filters.operatingHours === hours && styles.activeHoursText,
                ]}
              >
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
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  activeFilterText: {
    color: COLORS.background,
  },
  activeHours: {
    backgroundColor: COLORS.primary,
  },
  activeHoursText: {
    color: COLORS.background,
  },
  activeRating: {
    backgroundColor: COLORS.primary,
  },
  activeRatingText: {
    color: COLORS.background,
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    left: 0,
    maxHeight: '80%',
    padding: 20,
    position: 'absolute',
    right: 0,
  },
  filterButton: {
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterText: {
    color: COLORS.primary,
  },
  hoursButton: {
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursText: {
    color: COLORS.primary,
  },
  ratingButton: {
    borderColor: COLORS.primary,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingText: {
    color: COLORS.primary,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    fontSize: 16,
    padding: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default FilterSheet;
