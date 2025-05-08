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

type ClinicDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClinicDetails'>;

interface RouteParams {
  clinicId: string;
  clinic?: Clinic;
}

export const ClinicDetailsScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams;
  const { t } = useTranslation();
  const navigation = useNavigation<ClinicDetailsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  
  const [clinic, setClinic] = useState<Clinic | null>(params.clinic || null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!params.clinic);

  // Если клиника не передана в параметрах, загружаем ее по ID
  useEffect(() => {
    if (params.clinicId && !params.clinic) {
      const fetchClinic = async () => {
        try {
          setLoading(true);
          const response = await apiClient.getClinicById(params.clinicId) as ApiResponse<ClinicResponse>;
          if (response.success && response.data) {
            setClinic(response.data.clinic);
            setReviews(response.data.reviews || []);
          }
          setLoading(false);
        } catch (error) {
          console.error('Ошибка при загрузке клиники:', error);
          setLoading(false);
        }
      };
      
      fetchClinic();
    }
  }, [params.clinicId, params.clinic]);

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
      // TODO: Implement favorites for clinics
      // dispatch(toggleFavorite(clinic._id));
      setIsFavorite(!isFavorite);
    }
  };

  const handleAddReview = async (review: Omit<Review, '_id' | 'userId'>) => {
    try {
      const reviewParams: CreateReviewParams = {
        rating: review.rating,
        comment: review.comment
      };
      await apiClient.createReview(params.clinicId, reviewParams);
      await fetchClinicDetails();
    } catch (error) {
      Alert.alert(t('error'), t('errorAddingReview'));
    }
  };

  const fetchClinicDetails = async () => {
    try {
      const response = await apiClient.getClinicById(params.clinicId) as ApiResponse<ClinicResponse>;
      
      if (response.success && response.data) {
        setClinic(response.data.clinic);
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      Alert.alert(t('error'), t('errorLoadingClinic'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {t('clinicNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with photo gallery */}
      <View style={styles.header}>
        <Image
          source={{ uri: clinic.photos?.[0] || 'https://via.placeholder.com/400x200' }}
          style={styles.headerImage}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clinic Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{clinic.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: theme.colors.primary }]}>⭐ {clinic.rating.toFixed(1)}</Text>
          <Text style={[styles.reviews, { color: theme.colors.textSecondary }]}>({clinic.reviewsCount || 0} {t('details.reviews')})</Text>
        </View>

        {/* Address and Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('details.address')}</Text>
          <Text style={[styles.address, { color: theme.colors.textSecondary }]}>{clinic.address.street}, {clinic.address.city}</Text>
          <TouchableOpacity onPress={handleCall} style={styles.contactButton}>
            <Text style={[styles.contactButtonText, { color: theme.colors.textSecondary }]}>{t('details.call')}</Text>
          </TouchableOpacity>
        </View>

        {clinic.workingHours && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('details.workingHours')}</Text>
            {typeof clinic.workingHours === 'string' ? (
              <Text style={[styles.workingHours, { color: theme.colors.textSecondary }]}>{clinic.workingHours}</Text>
            ) : typeof clinic.workingHours === 'object' ? (
              Object.entries(clinic.workingHours).map(([day, hours]) => (
                <Text key={day} style={[styles.workingHours, { color: theme.colors.textSecondary }]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}: {typeof hours === 'object' ? `${hours.open} - ${hours.close}` : hours}
                </Text>
              ))
            ) : (
              <Text style={[styles.workingHours, { color: theme.colors.textSecondary }]}>Рабочие часы не указаны</Text>
            )}
          </View>
        )}

        {/* Services */}
        {clinic.services && clinic.services.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('details.services')}</Text>
            {clinic.services.map((service, index) => (
              <Text key={index} style={[styles.service, { color: theme.colors.textSecondary }]}>
                • {service}
              </Text>
            ))}
          </View>
        )}

        {/* Description */}
        {clinic.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('details.description')}</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{clinic.description}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.navigateButton]}
            onPress={handleNavigate}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>{t('details.navigate')}</Text>
          </TouchableOpacity>
          
          {clinic.website && (
            <TouchableOpacity
              style={[styles.actionButton, styles.websiteButton]}
              onPress={() => Linking.openURL(clinic.website)}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>{t('details.website')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('details.reviews')}</Text>
          <ReviewsSection
            reviews={reviews}
            clinicId={clinic._id}
            onAddReview={handleAddReview}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  type: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: 5,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: 16,
  },
  workingHours: {
    fontSize: 16,
    color: '#333',
  },
  service: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  navigateButton: {
    backgroundColor: COLORS.primary,
  },
  websiteButton: {
    backgroundColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
}); 