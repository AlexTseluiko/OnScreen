import React, { useState, useEffect } from 'react';
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
import { doctorsApi, Doctor } from '../api/doctorsApi';
import { Ionicons } from '@expo/vector-icons';
import { DefaultAvatar } from './DefaultAvatar';

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

  const searchDoctors = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorsApi.searchDoctors({
        search: searchQuery,
        page: pageNum,
        limit: 10
      });
      
      if (pageNum === 1) {
        setDoctors(response.data.doctors);
      } else {
        setDoctors(prev => [...prev, ...response.data.doctors]);
      }
      
      setHasMore(response.data.doctors.length === 10);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        setPage(1);
        searchDoctors(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.doctorPhoto}
          />
        ) : (
          <DefaultAvatar size={50} />
        )}
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
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

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : null
        )}
        ListEmptyComponent={() => (
          !loading && !error ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('noDoctorsFound')}
            </Text>
          ) : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  doctorSpecialization: {
    fontSize: 14,
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
  },
  clinicName: {
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    margin: 10,
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
  },
  loader: {
    margin: 20,
  },
}); 