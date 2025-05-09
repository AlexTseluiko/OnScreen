import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { doctorsApi } from '../api/doctorsApi';
import { Doctor } from '../types/doctor';
import { Ionicons } from '@expo/vector-icons';
import { DefaultAvatar } from './DefaultAvatar';
import { COLORS } from '../constants';

interface DoctorSearchProps {
  onSelectDoctor?: (doctor: Doctor) => void;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({ onSelectDoctor }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchDoctors = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await doctorsApi.searchDoctors({
          search: searchQuery,
          page: pageNum,
          limit: 10,
        });

        if (pageNum === 1) {
          setDoctors(response);
        } else {
          setDoctors(prev => [...prev, ...response]);
        }

        setHasMore(response.length === 10);
      } catch (err) {
        setError(t('common.error'));
        console.error('Error searching doctors:', err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, t]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        setPage(1);
        searchDoctors(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchDoctors]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchDoctors(nextPage);
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={[styles.doctorCard, { backgroundColor: theme.colors.card }]}
      onPress={() => onSelectDoctor?.(item)}
    >
      <View style={styles.doctorCard}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.doctorPhoto} />
        ) : (
          <DefaultAvatar size={50} />
        )}
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.doctorSpecialization, { color: theme.colors.textSecondary }]}>
            {item.specialization}
          </Text>
          <View style={styles.doctorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>
                {item.experience} {t('years')}
              </Text>
            </View>
          </View>
          <Text style={[styles.clinicName, { color: theme.colors.textSecondary }]}>
            {item.clinic}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}

      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={() =>
          !loading && !error ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('noDoctorsFound')}
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  clinicName: {
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  doctorCard: {
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorPhoto: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  doctorSpecialization: {
    fontSize: 14,
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  emptyText: {
    margin: 20,
    textAlign: 'center',
  },
  errorText: {
    margin: 10,
    textAlign: 'center',
  },
  loader: {
    margin: 20,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    margin: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
});
