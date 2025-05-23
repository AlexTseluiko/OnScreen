import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  experience: number;
  imageUrl: string;
  clinicName: string;
  isAvailable: boolean;
}

const FavoriteDoctorsScreen: React.FC = () => {
  useAuth();
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Доктор Иванов',
      specialty: 'Терапевт',
      rating: 4.8,
      reviewsCount: 124,
      experience: 15,
      imageUrl: 'https://placehold.co/100/teal/white',
      clinicName: 'Медицинский центр "Здоровье"',
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Доктор Петрова',
      specialty: 'Кардиолог',
      rating: 4.9,
      reviewsCount: 89,
      experience: 12,
      imageUrl: 'https://placehold.co/100/teal/white',
      clinicName: 'Клиника "Кардио"',
      isAvailable: false,
    },
  ]);

  const handleRemoveFromFavorites = (id: string) => {
    // Здесь будет логика удаления из избранного
    console.log('Удаление из избранного:', id);
  };

  const handleBookAppointment = (id: string) => {
    // Здесь будет логика записи на прием
    console.log('Запись на прием:', id);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? COLORS.light.primary : COLORS.light.border}
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Избранные врачи</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctors.length}</Text>
            <Text style={styles.statLabel}>Всего врачей</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctors.filter(d => d.isAvailable).length}</Text>
            <Text style={styles.statLabel}>Доступно сейчас</Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorsContainer}>
        {doctors.map(doctor => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Image source={{ uri: doctor.imageUrl }} style={styles.doctorImageStyle} />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(doctor.rating)}
                  <Text style={styles.reviewsCount}>({doctor.reviewsCount} отзывов)</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => handleRemoveFromFavorites(doctor.id)}
              >
                <Ionicons name="heart" size={24} color={COLORS.light.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.doctorDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="business" size={16} color={COLORS.light.secondary} />
                <Text style={styles.detailText}>{doctor.clinicName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color={COLORS.light.secondary} />
                <Text style={styles.detailText}>Опыт работы: {doctor.experience} лет</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.bookButton, !doctor.isAvailable && styles.bookButtonDisabled]}
              onPress={() => handleBookAppointment(doctor.id)}
              disabled={!doctor.isAvailable}
            >
              <Text
                style={[
                  styles.bookButtonText,
                  !doctor.isAvailable && styles.bookButtonTextDisabled,
                ]}
              >
                {doctor.isAvailable ? 'Записаться' : 'Недоступен'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bookButton: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.light.border,
  },
  bookButtonText: {
    color: COLORS.palette.white,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bookButtonTextDisabled: {
    color: COLORS.light.secondary,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  detailText: {
    color: COLORS.palette.gray[800],
    fontSize: 14,
    marginLeft: 8,
  },
  doctorCard: {
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  doctorDetails: {
    marginTop: 12,
  },
  doctorHeader: {
    flexDirection: 'row',
  },
  doctorImageStyle: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    color: COLORS.palette.gray[900],
    fontSize: 16,
    fontWeight: '500',
  },
  doctorsContainer: {
    padding: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  header: {
    backgroundColor: COLORS.light.background,
    padding: 20,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewsCount: {
    color: COLORS.light.secondary,
    fontSize: 12,
    marginLeft: 8,
  },
  specialty: {
    color: COLORS.light.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  star: {
    marginRight: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.light.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  statValue: {
    color: COLORS.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  title: {
    color: COLORS.palette.gray[900],
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default FavoriteDoctorsScreen;
