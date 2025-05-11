import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { doctorsApi } from '../../api/doctorsApi';
import { Doctor } from '../../types/doctor';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../atoms/Avatar';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';

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
    <Card style={styles.doctorCard}>
      <TouchableOpacity style={styles.cardContent} onPress={() => onSelectDoctor?.(item)}>
        {item.photoUrl ? (
          <Avatar uri={item.photoUrl} size={80} />
        ) : (
          <Avatar
            size={80}
            initials={`${item.name.charAt(0)}${item.name.includes(' ') ? item.name.split(' ')[1].charAt(0) : ''}`}
          />
        )}
        <View style={styles.doctorInfo}>
          <Text variant="title" style={styles.doctorName}>
            {item.name}
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.secondary, marginBottom: 8 }}>
            {item.specialization}
          </Text>
          <View style={styles.doctorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={theme.colors.primary} />
              <Text variant="body" style={styles.statText}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              <Text variant="body" style={styles.statText}>
                {item.experience} {t('years')}
              </Text>
            </View>
          </View>
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            {item.clinic}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          rightElement={<Ionicons name="search" size={20} color={theme.colors.text.secondary} />}
        />
      </View>

      {error && (
        <Text variant="error" style={styles.errorText}>
          {error}
        </Text>
      )}

      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() =>
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={() =>
          !loading && !error ? (
            <Text variant="body" style={styles.emptyText}>
              {t('noDoctorsFound')}
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  container: {
    flex: 1,
  },
  doctorCard: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  doctorName: {
    marginBottom: 4,
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
  listContent: {
    paddingBottom: 20,
  },
  loader: {
    margin: 20,
  },
  searchContainer: {
    margin: 10,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
  },
});
