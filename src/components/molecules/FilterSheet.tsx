import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Card } from './Card';

// Типы для фильтров
export interface FilterOptions {
  specialties: string[];
  services: string[];
  rating: number;
  operatingHours: 'openNow' | '24/7' | 'all';
  searchQuery: string;
}

export interface FilterSheetProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  onClose?: () => void;
  specialties?: string[];
  services?: string[];
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  filters,
  onFiltersChange,
  onClose,
  specialties = [
    'therapy',
    'surgery',
    'pediatrics',
    'cardiology',
    'neurology',
    'dermatology',
    'ophthalmology',
    'dentistry',
  ],
  services = [
    'onlineBooking',
    'homeVisits',
    'emergency',
    'laboratory',
    'pharmacy',
    'parking',
    'wheelchairAccessible',
  ],
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    onFiltersChange({ specialties: newSpecialties });
  };

  const handleServiceToggle = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    onFiltersChange({ services: newServices });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ rating });
  };

  const handleOperatingHoursChange = (hours: 'openNow' | '24/7' | 'all') => {
    onFiltersChange({ operatingHours: hours });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onFiltersChange({ searchQuery: text });
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">{t('filters.title', 'Фильтры')}</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('search.placeholder', 'Поиск')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text variant="subtitle">{t('filters.specialties', 'Специализации')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {specialties.map(specialty => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.filterButton,
                  { borderColor: theme.colors.primary },
                  filters.specialties.includes(specialty) && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handleSpecialtyToggle(specialty)}
              >
                <Text
                  style={{
                    color: filters.specialties.includes(specialty)
                      ? theme.colors.text.inverse
                      : theme.colors.primary,
                  }}
                >
                  {t(`specialties.${specialty}`, specialty)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text variant="subtitle">{t('filters.services', 'Услуги')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {services.map(service => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.filterButton,
                  { borderColor: theme.colors.primary },
                  filters.services.includes(service) && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <Text
                  style={{
                    color: filters.services.includes(service)
                      ? theme.colors.text.inverse
                      : theme.colors.primary,
                  }}
                >
                  {t(`services.${service}`, service)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Rating */}
      <View style={styles.section}>
        <Text variant="subtitle">{t('filters.rating', 'Рейтинг')}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                { borderColor: theme.colors.primary },
                filters.rating === rating && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => handleRatingChange(rating)}
            >
              <Text
                style={{
                  color:
                    filters.rating === rating ? theme.colors.text.inverse : theme.colors.primary,
                }}
              >
                {rating}+
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Operating Hours */}
      <View style={styles.section}>
        <Text variant="subtitle">{t('filters.operatingHours', 'Время работы')}</Text>
        <View style={styles.hoursContainer}>
          {(
            [
              { key: 'openNow', label: t('hours.openNow', 'Открыто сейчас') },
              { key: '24/7', label: t('hours.24/7', 'Круглосуточно') },
              { key: 'all', label: t('hours.all', 'Все') },
            ] as const
          ).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.hoursButton,
                { borderColor: theme.colors.primary },
                filters.operatingHours === key && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => handleOperatingHoursChange(key)}
            >
              <Text
                style={{
                  color:
                    filters.operatingHours === key
                      ? theme.colors.text.inverse
                      : theme.colors.primary,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    padding: 4,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
    width: '100%',
  },
  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hoursButton: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingButton: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
});
