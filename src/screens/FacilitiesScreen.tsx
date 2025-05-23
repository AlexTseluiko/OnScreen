import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { Text } from '../components/ui/atoms/Text';
import { clinicsApi } from '../api/clinics';
import { Clinic } from '../types/clinic';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';

export const FacilitiesScreen: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const fetchedClinics = await clinicsApi.getAll();
        setClinics(fetchedClinics);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке клиник:', err);
        setError(t('facilities.error'));
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [t]);

  const handleClinicPress = (clinicId: string) => {
    // Навигация к детальной информации о клинике
    navigation.navigate('ClinicDetails', { clinicId });
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity style={styles.clinicCard} onPress={() => handleClinicPress(item._id)}>
      <Image
        source={{
          uri:
            item.photos && item.photos.length > 0
              ? item.photos[0]
              : `https://placehold.co/400x200?text=${t('facilities.clinicPlaceholder')}`,
        }}
        style={styles.clinicImage}
      />
      <View style={styles.clinicContent}>
        <Text style={styles.clinicName}>{item.name}</Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.palette.warning} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>

        <Text style={styles.clinicAddress}>
          {item.address.city}, {item.address.street}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={14} color={COLORS.palette.gray[600]} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>

        {item.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={COLORS.palette.gray[600]} />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
        )}

        <View style={styles.servicesContainer}>
          {item.services.slice(0, 3).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <View style={styles.serviceTag}>
              <Text style={styles.serviceText}>+{item.services.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.palette.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.header}>{t('facilities.title')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.palette.primary} />
          <Text style={styles.loadingText}>{t('facilities.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              clinicsApi
                .getAll()
                .then(fetchedClinics => {
                  setClinics(fetchedClinics);
                  setError(null);
                })
                .catch(err => {
                  console.error('Ошибка при повторной загрузке клиник:', err);
                  setError(t('facilities.error'));
                })
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>{t('facilities.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : clinics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={48} color={COLORS.palette.gray[400]} />
          <Text style={styles.emptyText}>{t('facilities.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={clinics}
          renderItem={renderClinicItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  clinicAddress: {
    color: COLORS.palette.gray[700],
    fontSize: 14,
    marginBottom: 8,
  },
  clinicCard: {
    backgroundColor: COLORS.palette.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clinicContent: {
    padding: 16,
  },
  clinicImage: {
    height: 180,
    width: '100%',
  },
  clinicName: {
    color: COLORS.palette.gray[900],
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.palette.gray[600],
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: COLORS.palette.danger,
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoText: {
    color: COLORS.palette.gray[600],
    fontSize: 14,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.palette.gray[600],
    fontSize: 16,
    marginTop: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingText: {
    color: COLORS.palette.gray[800],
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  retryButton: {
    backgroundColor: COLORS.palette.primary,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    color: COLORS.palette.white,
    fontSize: 16,
    fontWeight: '500',
  },
  serviceTag: {
    backgroundColor: COLORS.palette.gray[100],
    borderRadius: 4,
    marginRight: 8,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  serviceText: {
    color: COLORS.palette.gray[700],
    fontSize: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});
