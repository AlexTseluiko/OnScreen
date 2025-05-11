import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { facilitiesApi } from '../../api/facilities';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Facility } from '../../types/facility';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { EmptyState } from '../molecules/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FacilitiesListProps {
  facilities: Facility[];
  onFacilityPress?: (facility: Facility) => void;
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({
  facilities,
  onFacilityPress: _onFacilityPress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true);
      await facilitiesApi.getAll();
      setError(null);
    } catch (err) {
      setError(t('errors.facilitiesLoadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFacilities();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadFacilities]);

  const renderFacility = ({ item }: { item: Facility }) => (
    <Card style={styles.facilityCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('FacilityDetails', { facilityId: item.id })}
      >
        {item.images?.[0] && (
          <Image source={{ uri: item.images[0] }} style={styles.facilityImage} resizeMode="cover" />
        )}
        <View style={styles.facilityInfo}>
          <Text variant="title" style={styles.facilityName}>
            {item.name}
          </Text>
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            {item.address}
          </Text>
          <View style={styles.ratingContainer}>
            <Text
              variant="body"
              style={{ color: theme.colors.warning, fontWeight: 'bold', marginRight: 4 }}
            >
              ★ {item.rating.toFixed(1)}
            </Text>
            <Text variant="body" style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
              ({item.reviews} {t('reviews')})
            </Text>
          </View>
          <View style={styles.servicesContainer}>
            {item.services.slice(0, 3).map((service: string, index: number) => (
              <View
                key={index}
                style={[styles.serviceTag, { backgroundColor: theme.colors.background }]}
              >
                <Text
                  variant="body"
                  style={{
                    color: theme.colors.success,
                    fontSize: 12,
                  }}
                >
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading && facilities.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState title={t('common.loading')} icon="time-outline" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="error" style={styles.errorText}>
          {error}
        </Text>
        <Button title={t('common.retry')} onPress={loadFacilities} variant="primary" />
      </View>
    );
  }

  return (
    <FlatList
      data={facilities}
      renderItem={renderFacility}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      onRefresh={loadFacilities}
      refreshing={loading}
      ListEmptyComponent={
        <EmptyState
          title={t('noFacilitiesFound')}
          description={t('tryChangingSearchCriteria')}
          icon="business-outline"
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  facilityCard: {
    marginBottom: 16,
    overflow: 'hidden',
    padding: 0,
  },
  facilityImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 200,
    width: '100%',
  },
  facilityInfo: {
    padding: 16,
  },
  facilityName: {
    marginBottom: 4,
  },
  listContainer: {
    padding: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 4,
  },
  serviceTag: {
    borderRadius: 12,
    marginBottom: 4,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
