import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { RootStackParamList } from '../navigation/types';
import { Clinic } from '../types/clinic';
import { ApiResponse } from '../types/api';
import { COLORS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { ClinicHeader } from '../components/organisms/ClinicHeader';
import { ClinicInfo } from '../components/organisms/ClinicInfo';
import { LoadingSpinner } from '../components/atoms/LoadingSpinner';
import {
  ReviewsSection,
  Review as ReviewsSectionReview,
} from '../components/organisms/ReviewsSection';
import { useTranslation } from 'react-i18next';

type ClinicDetailsRouteProp = RouteProp<RootStackParamList, 'ClinicDetails'>;

interface RouteParams {
  clinicId: string;
}

export const ClinicDetailsScreen: React.FC = () => {
  const route = useRoute<ClinicDetailsRouteProp>();
  const { clinicId } = route.params as RouteParams;
  const { t } = useTranslation();
  const { token } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [reviews, setReviews] = useState<ReviewsSectionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClinicDetails = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<Clinic>>(
        API_ENDPOINTS.CLINICS.DETAILS(clinicId),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setClinic(response.data.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных клиники:', err);
      setError(t('errors.clinicLoadError'));
    } finally {
      setLoading(false);
    }
  }, [clinicId, token, t]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<ReviewsSectionReview[]>>(
        API_ENDPOINTS.CLINICS.REVIEWS(clinicId),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setError(t('errors.reviewsLoadError'));
    }
  }, [clinicId, token, t]);

  const handleAddReview = useCallback(
    async (review: { rating: number; text: string; photos?: string[] }) => {
      try {
        const response = await apiClient.post<ApiResponse<void>>(
          API_ENDPOINTS.CLINICS.REVIEWS(clinicId),
          review,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.data !== undefined) {
          await fetchReviews();
          Alert.alert(t('success'), t('reviews.addSuccess'));
        }
      } catch (err) {
        console.error('Ошибка при добавлении отзыва:', err);
        Alert.alert(t('error'), t('errors.reviewAddError'));
      }
    },
    [clinicId, token, t, fetchReviews]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchClinicDetails(), fetchReviews()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchClinicDetails, fetchReviews]);

  useEffect(() => {
    fetchClinicDetails();
    fetchReviews();
  }, [fetchClinicDetails, fetchReviews]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!clinic) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ClinicHeader clinic={clinic} />
      <ClinicInfo clinic={clinic} />
      <ReviewsSection reviews={reviews} onAddReview={handleAddReview} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.palette.white,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.palette.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});
