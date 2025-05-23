import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  patientName: string;
  patientAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

const DoctorReviewsScreen: React.FC = () => {
  useAuth();
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      patientName: 'Иван Петров',
      patientAvatar: 'https://placehold.co/50/gray/white',
      rating: 5,
      date: '15.03.2024',
      comment: 'Отличный врач! Очень внимательный и профессиональный подход к лечению.',
    },
    {
      id: '2',
      patientName: 'Мария Иванова',
      patientAvatar: 'https://placehold.co/50/gray/white',
      rating: 4,
      date: '10.03.2024',
      comment: 'Хороший специалист, но приём немного задержался.',
    },
  ]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
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
        <Text style={styles.title}>Отзывы пациентов</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Средний рейтинг</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Всего отзывов</Text>
          </View>
        </View>
      </View>

      <View style={styles.reviewsContainer}>
        {reviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.patientAvatar }} style={styles.avatarImage} />
              <View style={styles.reviewInfo}>
                <Text style={styles.patientName}>{review.patientName}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            {renderStars(review.rating)}
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.light.background,
    padding: 20,
  },
  patientName: {
    color: COLORS.palette.gray[900],
    fontSize: 16,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: COLORS.light.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  reviewComment: {
    color: COLORS.palette.gray[800],
    fontSize: 14,
    marginTop: 12,
  },
  reviewDate: {
    color: COLORS.light.secondary,
    fontSize: 14,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewInfo: {
    marginLeft: 12,
  },
  reviewsContainer: {
    padding: 16,
  },
  star: {
    marginRight: 4,
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

export default DoctorReviewsScreen;
