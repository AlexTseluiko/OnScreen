import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch } from '../store';
import { toggleFavorite } from '../store/slices/facilitiesSlice';
import ReviewsSection from '../components/ReviewsSection';
import { Clinic, Review } from '../types/clinic';
import { ApiResponse, ClinicResponse } from '../types/api';
import { CreateReviewParams } from '../api/types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient } from '../api/apiClient';
import { RouteProp } from '@react-navigation/native';
import { API_URL } from '../config/api';
import { useUserStorage } from '../contexts/UserStorageContext';

type ClinicDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClinicDetails'>;
type ClinicDetailsRouteProp = RouteProp<RootStackParamList, 'ClinicDetails'>;

interface RouteParams {
  clinicId: string;
  clinic?: Clinic;
}

export const ClinicDetailsScreen: React.FC = () => {
  const route = useRoute<ClinicDetailsRouteProp>();
  const params = route.params as RouteParams;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { getToken } = useUserStorage();

  const [clinic, setClinic] = useState<Clinic | null>(params.clinic || null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!params.clinic);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.clinicId && !params.clinic) {
      const fetchClinic = async () => {
        try {
          setLoading(true);
          const token = await getToken();
          const response = await fetch(`${API_URL}/clinics/${params.clinicId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data: ApiResponse<ClinicResponse> = await response.json();
          if (data.status === 'success' && data.data) {
            setClinic(data.data.clinic);
            setReviews(data.data.reviews || []);
          } else {
            setError(data.message || 'Ошибка при загрузке данных клиники');
          }
        } catch (err) {
          setError('Ошибка при загрузке данных клиники');
          console.error('Ошибка при загрузке данных клиники:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchClinic();
    }
  }, [params.clinicId, params.clinic, getToken]);

  const handleCall = () => {
    if (clinic?.phone) {
      Linking.openURL(`tel:${clinic.phone}`);
    }
  };

  const handleNavigate = () => {
    if (!clinic?.address.coordinates) return;

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${clinic.address.coordinates.latitude},${clinic.address.coordinates.longitude}`,
      android: `${scheme}${clinic.address.coordinates.latitude},${clinic.address.coordinates.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleToggleFavorite = () => {
    if (clinic?._id) {
      setIsFavorite(!isFavorite);
    }
  };

  const handleAddReview = async (review: Omit<Review, '_id' | 'userId'>) => {
    try {
      const reviewParams: CreateReviewParams = {
        rating: review.rating,
        comment: review.comment,
      };
      await apiClient.createReview(params.clinicId, reviewParams);
      await fetchClinicDetails();
    } catch (error) {
      Alert.alert(t('error'), t('errorAddingReview'));
    }
  };

  const fetchClinicDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetch(`${API_URL}/clinics/${params.clinicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: ApiResponse<ClinicResponse> = await response.json();
      if (data.status === 'success' && data.data) {
        setClinic(data.data.clinic);
        setReviews(data.data.reviews || []);
      } else {
        setError(data.message || 'Ошибка при загрузке данных клиники');
      }
    } catch (err) {
      setError('Ошибка при загрузке данных клиники');
      console.error('Ошибка при загрузке данных клиники:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsite = () => {
    if (clinic?.website) {
      Linking.openURL(clinic.website);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !clinic) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error || 'Клиника не найдена'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: clinic.photos?.[0] || 'https://via.placeholder.com/400x200' }}
          style={styles.headerImage}
        />
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{clinic.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: theme.colors.primary }]}>
            ⭐ {clinic.rating.toFixed(1)}
          </Text>
          <Text style={[styles.reviews, { color: theme.colors.textSecondary }]}>
            ({clinic.reviewsCount || 0} {t('details.reviews')})
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('details.address')}
          </Text>
          <Text style={[styles.address, { color: theme.colors.textSecondary }]}>
            {clinic.address.street}, {clinic.address.city}
          </Text>
          <TouchableOpacity onPress={handleCall} style={styles.contactButton}>
            <Text style={[styles.contactButtonText, { color: theme.colors.textSecondary }]}>
              {t('details.call')}
            </Text>
          </TouchableOpacity>
        </View>

        {clinic.workingHours && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('details.workingHours')}
            </Text>
            {typeof clinic.workingHours === 'string' ? (
              <Text style={[styles.workingHours, { color: theme.colors.textSecondary }]}>
                {clinic.workingHours}
              </Text>
            ) : typeof clinic.workingHours === 'object' ? (
              Object.entries(clinic.workingHours).map(([day, hours]) => (
                <Text
                  key={day}
                  style={[styles.workingHours, { color: theme.colors.textSecondary }]}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}:{' '}
                  {typeof hours === 'object' ? `${hours.open} - ${hours.close}` : hours}
                </Text>
              ))
            ) : (
              <Text style={[styles.workingHours, { color: theme.colors.textSecondary }]}>
                Рабочие часы не указаны
              </Text>
            )}
          </View>
        )}

        {clinic.services && clinic.services.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('details.services')}
            </Text>
            {clinic.services.map((service, index) => (
              <Text key={index} style={[styles.service, { color: theme.colors.textSecondary }]}>
                • {service}
              </Text>
            ))}
          </View>
        )}

        {clinic.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('details.description')}
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {clinic.description}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.navigateButton]}
            onPress={handleNavigate}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>
              {t('details.navigate')}
            </Text>
          </TouchableOpacity>

          {clinic.website && (
            <TouchableOpacity
              style={[styles.actionButton, styles.websiteButton]}
              onPress={handleWebsite}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>
                {t('details.website')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('details.reviews')}
          </Text>
          <ReviewsSection reviews={reviews} clinicId={clinic._id} onAddReview={handleAddReview} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  address: {
    fontSize: 16,
    marginBottom: 10,
  },
  contactButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    height: '100%',
    width: '100%',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
  },
  rating: {
    fontSize: 16,
    marginRight: 5,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  reviews: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  service: {
    fontSize: 16,
    marginBottom: 5,
  },
  websiteButton: {
    backgroundColor: COLORS.secondary,
  },
  workingHours: {
    fontSize: 16,
  },
});
